import { requirePatient } from "@/lib/dal";
import { TopBar } from "@/components/TopBar";
import { AssessmentForm } from "./_components/AssessmentForm";

export default async function PatientPage() {
  const { user, patient } = await requirePatient();

  return (
    <>
      <TopBar
        subtitle="แบบประเมินความปวด"
        right={
          <a
            href="/logout"
            className="text-sm font-medium hover:underline"
            style={{ color: "#5a6b80" }}
          >
            ออกจากระบบ
          </a>
        }
      />

      <main className="flex-1 px-4 sm:px-5 py-5 pb-10">
        <div className="max-w-[760px] mx-auto">
          <div
            className="rounded-2xl p-5 sm:p-6"
            style={{
              background: "#ffffff",
              border: "1px solid #dce5ef",
              boxShadow:
                "0 1px 3px rgba(26,43,66,.06), 0 4px 16px rgba(26,43,66,.06)",
            }}
          >
            <div
              className="flex items-center gap-3.5 pb-4 mb-4"
              style={{ borderBottom: "1px solid #dce5ef" }}
            >
              <div
                className="grid place-items-center text-2xl rounded-2xl shrink-0"
                style={{
                  width: 52,
                  height: 52,
                  background: "#e8f1f9",
                  color: "#155486",
                }}
                aria-hidden
              >
                🧑
              </div>
              <div className="min-w-0">
                <div
                  className="font-semibold text-lg truncate"
                  style={{ color: "#1a2b42" }}
                >
                  {user.name}
                </div>
                <div
                  className="text-sm truncate"
                  style={{ color: "#5a6b80" }}
                >
                  อายุ {patient.age} ปี · ห้อง {patient.room} เตียง {patient.bed} ·{" "}
                  {patient.diagnosis}
                </div>
              </div>
            </div>

            <AssessmentForm />
          </div>
        </div>
      </main>
    </>
  );
}
