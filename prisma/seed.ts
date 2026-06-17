import "dotenv/config";
import { PrismaClient, AlertSeverity, AlertStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

function severityFromScore(score: number): AlertSeverity {
  if (score >= 7) return AlertSeverity.RED;
  if (score >= 4) return AlertSeverity.YELLOW;
  return AlertSeverity.GREEN;
}

async function main() {
  console.log("Resetting tables...");
  await prisma.alert.deleteMany();
  await prisma.painRecord.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  console.log("Creating nurse...");
  await prisma.user.create({
    data: {
      username: "nurse1",
      passwordHash,
      role: "NURSE",
      name: "พยาบาลสุดา รักษ์ดี",
    },
  });

  console.log("Creating patient 1...");
  const patient1 = await prisma.user.create({
    data: {
      username: "patient1",
      passwordHash,
      role: "PATIENT",
      name: "คุณสมชาย ใจดี",
      patient: {
        create: {
          age: 65,
          room: "301",
          bed: "1",
          diagnosis: "ผ่าตัดเปลี่ยนข้อเข่าขวา",
          admittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        },
      },
    },
    include: { patient: true },
  });

  console.log("Creating patient 2...");
  const patient2 = await prisma.user.create({
    data: {
      username: "patient2",
      passwordHash,
      role: "PATIENT",
      name: "คุณสมหญิง รักดี",
      patient: {
        create: {
          age: 72,
          room: "302",
          bed: "2",
          diagnosis: "ผ่าตัดเปลี่ยนข้อสะโพกซ้าย",
          admittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        },
      },
    },
    include: { patient: true },
  });

  console.log("Creating pain records and alerts...");
  type RecordSpec = {
    patientId: string;
    score: number;
    characteristics: string[];
    locations: string[];
    factors: string[];
    hoursAgo: number;
    acknowledged: boolean;
  };

  const records: RecordSpec[] = [
    {
      patientId: patient1.patient!.id,
      score: 8,
      characteristics: ["ปวดตุบ ๆ", "ปวดแสบร้อน"],
      locations: ["เข่าขวา"],
      factors: ["ปวดขณะเคลื่อนไหว"],
      hoursAgo: 0.5,
      acknowledged: false,
    },
    {
      patientId: patient1.patient!.id,
      score: 5,
      characteristics: ["ปวดตื้อ"],
      locations: ["เข่าขวา"],
      factors: ["ปวดขณะพัก"],
      hoursAgo: 6,
      acknowledged: true,
    },
    {
      patientId: patient1.patient!.id,
      score: 2,
      characteristics: ["ปวดตื้อ"],
      locations: ["เข่าขวา"],
      factors: ["ปวดขณะพัก"],
      hoursAgo: 24,
      acknowledged: true,
    },
    {
      patientId: patient2.patient!.id,
      score: 9,
      characteristics: ["ปวดแปลบ-ไฟช้อต"],
      locations: ["สะโพกซ้าย", "หลังส่วนล่าง"],
      factors: ["ปวดขณะทำกายภาพบำบัด"],
      hoursAgo: 0.25,
      acknowledged: false,
    },
    {
      patientId: patient2.patient!.id,
      score: 6,
      characteristics: ["ปวดบีบ"],
      locations: ["สะโพกซ้าย"],
      factors: ["ปวดขณะเคลื่อนไหว"],
      hoursAgo: 12,
      acknowledged: true,
    },
    {
      patientId: patient2.patient!.id,
      score: 3,
      characteristics: ["ปวดตื้อ"],
      locations: ["สะโพกซ้าย"],
      factors: ["ปวดขณะพัก"],
      hoursAgo: 36,
      acknowledged: true,
    },
  ];

  for (const r of records) {
    const recordedAt = new Date(Date.now() - r.hoursAgo * 60 * 60 * 1000);
    const painRecord = await prisma.painRecord.create({
      data: {
        patientId: r.patientId,
        score: r.score,
        characteristics: r.characteristics,
        locations: r.locations,
        factors: r.factors,
        recordedAt,
      },
    });
    await prisma.alert.create({
      data: {
        painRecordId: painRecord.id,
        severity: severityFromScore(r.score),
        status: r.acknowledged ? AlertStatus.ACKNOWLEDGED : AlertStatus.PENDING,
        acknowledgedAt: r.acknowledged ? recordedAt : null,
        createdAt: recordedAt,
      },
    });
  }

  console.log("Done!");
  console.log("Logins:");
  console.log("  nurse1 / password123  (พยาบาล)");
  console.log("  patient1 / password123  (ผู้ป่วยห้อง 301)");
  console.log("  patient2 / password123  (ผู้ป่วยห้อง 302)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
