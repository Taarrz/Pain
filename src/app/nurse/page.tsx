import Link from "next/link";
import { requireNurse } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { serializeAlert } from "@/lib/alert-serialize";
import { TopBar } from "@/components/TopBar";
import { AlertList } from "./_components/AlertList";

export const dynamic = "force-dynamic";

export default async function NursePage() {
  const user = await requireNurse();

  const pending = await prisma.alert.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      painRecord: {
        include: { patient: { include: { user: true } } },
      },
    },
  });

  const initialAlerts = pending.map(serializeAlert);

  return (
    <>
      <TopBar
        subtitle={`หน้าพยาบาล · ${user.name}`}
        right={
          <div className="flex items-center gap-3">
            <Link
              href="/nurse/stats"
              className="text-sm font-medium hover:underline"
              style={{ color: "#1f6fb2" }}
            >
              📈 สถิติ
            </Link>
            <Link
              href="/logout"
              className="text-sm font-medium hover:underline"
              style={{ color: "#5a6b80" }}
            >
              ออกจากระบบ
            </Link>
          </div>
        }
      />

      <main className="flex-1 px-4 sm:px-5 py-5 pb-10">
        <div className="max-w-[760px] mx-auto">
          <AlertList initialAlerts={initialAlerts} />
        </div>
      </main>
    </>
  );
}
