import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    select: { username: true, role: true, name: true },
  });
  console.log("Users:", users);

  const pending = await prisma.alert.count({ where: { status: "PENDING" } });
  console.log("Pending alerts:", pending);

  const records = await prisma.painRecord.findMany({
    include: { patient: { include: { user: true } }, alert: true },
    orderBy: { recordedAt: "desc" },
  });
  console.log(`Pain records: ${records.length}`);
  for (const r of records) {
    console.log(
      `  - ${r.patient.user.name}: score=${r.score} severity=${r.alert?.severity} status=${r.alert?.status}`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
