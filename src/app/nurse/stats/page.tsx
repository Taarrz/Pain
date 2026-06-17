import Link from "next/link";
import { requireNurse } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/TopBar";
import { LogoutButton } from "@/components/LogoutButton";
import { StatsView } from "./_components/StatsView";

export const dynamic = "force-dynamic";

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string }>;
}) {
  await requireNurse();
  const { patient: patientId } = await searchParams;

  const patients = await prisma.patient.findMany({
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });

  const selected = patientId
    ? patients.find((p) => p.id === patientId)
    : null;

  const records = selected
    ? await prisma.painRecord.findMany({
        where: { patientId: selected.id },
        orderBy: { recordedAt: "asc" },
        select: { id: true, score: true, recordedAt: true },
      })
    : [];

  return (
    <>
      <TopBar
        subtitle="สถิติและแนวโน้ม"
        right={
          <div className="flex items-center gap-3">
            <Link
              href="/nurse"
              className="text-sm font-medium hover:underline"
              style={{ color: "#1f6fb2" }}
            >
              ← การแจ้งเตือน
            </Link>
            <LogoutButton
              className="text-sm font-medium hover:underline"
              style={{ color: "#5a6b80" }}
            />
          </div>
        }
      />

      <main className="flex-1 px-4 sm:px-5 py-5 pb-10">
        <div className="max-w-[760px] mx-auto space-y-4">
          <div>
            <div
              className="text-xs mb-2 font-medium"
              style={{ color: "#5a6b80" }}
            >
              ผู้ป่วยในวอร์ด
            </div>
            <div className="flex gap-2 flex-wrap">
              {patients.map((p) => {
                const active = p.id === selected?.id;
                return (
                  <Link
                    key={p.id}
                    href={`/nurse/stats?patient=${p.id}`}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium transition"
                    style={{
                      background: active ? "#e8f1f9" : "#ffffff",
                      border: `1px solid ${active ? "#1f6fb2" : "#dce5ef"}`,
                      color: active ? "#155486" : "#5a6b80",
                    }}
                  >
                    {p.user.name}{" "}
                    <span
                      className="font-en text-xs"
                      style={{ color: active ? "#1f6fb2" : "#8da0b5" }}
                    >
                      · ห้อง {p.room}/{p.bed}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {!selected ? (
            <Empty icon="📊" title="กรุณาเลือกผู้ป่วย" />
          ) : records.length === 0 ? (
            <Empty
              icon="📭"
              title={selected.user.name}
              subtitle="ยังไม่มีการประเมินความปวด"
            />
          ) : (
            <StatsView
              patientName={selected.user.name}
              records={records.map((r) => ({
                id: r.id,
                score: r.score,
                recordedAt: r.recordedAt.toISOString(),
              }))}
            />
          )}
        </div>
      </main>
    </>
  );
}

function Empty({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div
      className="rounded-2xl p-10 text-center"
      style={{
        background: "#ffffff",
        border: "2px dashed #dce5ef",
        color: "#8da0b5",
      }}
    >
      <div className="text-4xl mb-2 opacity-60" aria-hidden>
        {icon}
      </div>
      <div className="font-medium" style={{ color: "#5a6b80" }}>
        {title}
      </div>
      {subtitle && <div className="text-sm mt-1">{subtitle}</div>}
    </div>
  );
}
