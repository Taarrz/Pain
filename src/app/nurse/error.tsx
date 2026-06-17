"use client";

import { useEffect } from "react";

export default function NurseError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Nurse route error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-zinc-50">
      <div className="max-w-md w-full bg-white rounded-2xl border p-8 text-center space-y-4">
        <div className="text-5xl" aria-hidden>
          ⚠️
        </div>
        <h1 className="text-xl font-bold text-zinc-900">
          โหลดข้อมูลไม่สำเร็จ
        </h1>
        <p className="text-zinc-600 text-sm">
          ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ในขณะนี้
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={reset}
            className="w-full py-3 rounded-xl bg-zinc-900 text-white font-medium hover:bg-zinc-800"
          >
            ลองใหม่
          </button>
          <a
            href="/logout"
            className="block w-full py-3 rounded-xl border border-zinc-300 text-zinc-700 font-medium hover:bg-zinc-50"
          >
            ออกจากระบบ
          </a>
        </div>
      </div>
    </main>
  );
}
