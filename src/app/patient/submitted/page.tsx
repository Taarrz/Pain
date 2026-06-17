import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { LogoutButton } from "@/components/LogoutButton";

export default function SubmittedPage() {
  return (
    <>
      <TopBar subtitle="ส่งข้อมูลเรียบร้อย" />
      <main className="flex-1 flex items-center justify-center p-6">
        <div
          className="max-w-md w-full rounded-2xl p-8 text-center"
          style={{
            background: "#ffffff",
            border: "1px solid #dce5ef",
            boxShadow:
              "0 1px 3px rgba(26,43,66,.06), 0 4px 16px rgba(26,43,66,.06)",
          }}
        >
          <div
            className="mx-auto mb-4 grid place-items-center rounded-full text-3xl"
            style={{
              width: 64,
              height: 64,
              background: "#e6f6ee",
              color: "#2e9e6b",
              border: "2px solid #bce5d1",
            }}
            aria-hidden
          >
            ✓
          </div>
          <h1
            className="text-xl font-semibold mb-2"
            style={{ color: "#1a2b42" }}
          >
            ส่งข้อมูลเรียบร้อยแล้ว
          </h1>
          <p className="text-sm mb-6" style={{ color: "#5a6b80" }}>
            พยาบาลได้รับการแจ้งเตือนแล้ว
            <br />
            กรุณารอสักครู่ พยาบาลกำลังมาดูแลคุณ
          </p>
          <div className="space-y-2">
            <Link
              href="/patient"
              className="block w-full py-3 rounded-xl text-white font-semibold transition"
              style={{ background: "#1f6fb2" }}
            >
              ทำแบบประเมินอีกครั้ง
            </Link>
            <LogoutButton
              className="block w-full py-3 rounded-xl font-medium transition"
              style={{
                border: "1px solid #dce5ef",
                color: "#5a6b80",
                width: "100%",
              }}
            />
          </div>
        </div>
      </main>
    </>
  );
}
