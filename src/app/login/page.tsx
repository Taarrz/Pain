import { TopBar } from "@/components/TopBar";
import { LoginForm } from "./_components/LoginForm";

export default function LoginPage() {
  return (
    <>
      <TopBar subtitle="เข้าสู่ระบบ" />
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-3">
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              background: "#ffffff",
              border: "1px solid #dce5ef",
              boxShadow:
                "0 1px 3px rgba(26,43,66,.06), 0 4px 16px rgba(26,43,66,.06)",
            }}
          >
            <div className="mb-5">
              <h2
                className="text-xl font-semibold"
                style={{ color: "#1a2b42" }}
              >
                เข้าสู่ระบบ
              </h2>
              <p className="text-sm mt-1" style={{ color: "#8da0b5" }}>
                สำหรับเจ้าหน้าที่และผู้ป่วยที่ลงทะเบียนแล้ว
              </p>
            </div>

            <LoginForm />
          </div>

          <div
            className="rounded-xl p-3.5 text-xs"
            style={{
              background: "#e8f1f9",
              border: "1px solid #cfe2f2",
              color: "#155486",
            }}
          >
            <div className="font-semibold mb-1">บัญชีทดสอบ (Demo)</div>
            <ul className="space-y-0.5 font-en">
              <li>nurse1 / password123 → พยาบาล</li>
              <li>patient1 / password123 → คุณสมชาย</li>
              <li>patient2 / password123 → คุณสมหญิง</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
