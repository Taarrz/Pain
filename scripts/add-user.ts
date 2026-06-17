import "dotenv/config";
import * as readline from "node:readline/promises";
import { parseArgs } from "node:util";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

type UserInput = {
  username: string;
  password: string;
  name: string;
  role: "PATIENT" | "NURSE";
  // For patient only:
  age?: number;
  room?: string;
  bed?: string;
  diagnosis?: string;
};

async function readFromArgs(): Promise<UserInput | null> {
  const { values } = parseArgs({
    options: {
      username: { type: "string" },
      password: { type: "string" },
      name: { type: "string" },
      role: { type: "string" },
      age: { type: "string" },
      room: { type: "string" },
      bed: { type: "string" },
      diagnosis: { type: "string" },
    },
    strict: false,
    allowPositionals: true,
  });

  if (!values.username && !values.password && !values.role) return null;

  if (!values.username || !values.password || !values.name || !values.role) {
    throw new Error(
      "ต้องใส่ --username --password --name --role (และถ้า role=PATIENT ต้องมี --age --room --bed --diagnosis)"
    );
  }

  const role = (values.role as string).toUpperCase();
  if (role !== "PATIENT" && role !== "NURSE") {
    throw new Error(`role ต้องเป็น PATIENT หรือ NURSE (ได้: ${role})`);
  }

  const input: UserInput = {
    username: values.username as string,
    password: values.password as string,
    name: values.name as string,
    role,
  };

  if (role === "PATIENT") {
    if (!values.age || !values.room || !values.bed || !values.diagnosis) {
      throw new Error(
        "role=PATIENT ต้องมี --age --room --bed --diagnosis ด้วย"
      );
    }
    input.age = parseInt(values.age as string, 10);
    input.room = values.room as string;
    input.bed = values.bed as string;
    input.diagnosis = values.diagnosis as string;
  }

  return input;
}

async function readFromPrompts(): Promise<UserInput> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  async function ask(q: string): Promise<string> {
    return (await rl.question(q)).trim();
  }

  async function required(q: string): Promise<string> {
    while (true) {
      const a = await ask(q);
      if (a) return a;
      console.log("⚠ ห้ามเว้นว่าง");
    }
  }

  async function int(q: string): Promise<number> {
    while (true) {
      const a = await ask(q);
      const n = parseInt(a, 10);
      if (Number.isInteger(n) && n > 0) return n;
      console.log("⚠ ต้องเป็นตัวเลขจำนวนเต็มบวก");
    }
  }

  async function role(): Promise<"PATIENT" | "NURSE"> {
    while (true) {
      const a = (await ask("บทบาท (P=ผู้ป่วย, N=พยาบาล): ")).toUpperCase();
      if (a === "P" || a === "PATIENT") return "PATIENT";
      if (a === "N" || a === "NURSE") return "NURSE";
      console.log("⚠ ตอบ P หรือ N");
    }
  }

  try {
    console.log("\n🆕 เพิ่ม user ใหม่\n────────────────────");
    const username = await required("ชื่อผู้ใช้ (username): ");
    const password = await required("รหัสผ่าน: ");
    const name = await required("ชื่อ-นามสกุล (เช่น คุณสมชาย ใจดี): ");
    const r = await role();

    const input: UserInput = { username, password, name, role: r };
    if (r === "PATIENT") {
      console.log("\n── ข้อมูลผู้ป่วยเพิ่มเติม ──");
      input.age = await int("อายุ (ปี): ");
      input.room = await required("ห้อง: ");
      input.bed = await required("เตียง: ");
      input.diagnosis = await required("การวินิจฉัย/ผ่าตัด: ");
    }
    return input;
  } finally {
    rl.close();
  }
}

async function createUser(input: UserInput) {
  const existing = await prisma.user.findUnique({
    where: { username: input.username },
  });
  if (existing) {
    throw new Error(`มีผู้ใช้ "${input.username}" อยู่แล้ว`);
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  if (input.role === "PATIENT") {
    await prisma.user.create({
      data: {
        username: input.username,
        passwordHash,
        role: "PATIENT",
        name: input.name,
        patient: {
          create: {
            age: input.age!,
            room: input.room!,
            bed: input.bed!,
            diagnosis: input.diagnosis!,
          },
        },
      },
    });
  } else {
    await prisma.user.create({
      data: {
        username: input.username,
        passwordHash,
        role: "NURSE",
        name: input.name,
      },
    });
  }
}

async function main() {
  const fromArgs = await readFromArgs();
  const input = fromArgs ?? (await readFromPrompts());

  await createUser(input);

  console.log("\n────────────────────");
  console.log(`✅ สร้างเรียบร้อย`);
  console.log(`   username: ${input.username}`);
  console.log(`   role: ${input.role === "NURSE" ? "พยาบาล" : "ผู้ป่วย"}`);
  console.log(`   login ที่ http://localhost:3000/login\n`);
}

main()
  .catch((e) => {
    console.error("\n❌", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
