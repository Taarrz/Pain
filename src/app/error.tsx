"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-zinc-50">
      <div className="max-w-md w-full bg-white rounded-2xl border p-8 text-center space-y-4">
        <div className="text-5xl" aria-hidden>
          ⚠️
        </div>
        <h1 className="text-xl font-bold text-zinc-900">เกิดข้อผิดพลาด</h1>
        <p className="text-zinc-600 text-sm">
          ระบบไม่สามารถโหลดหน้านี้ได้ในขณะนี้
        </p>
        {error.digest && (
          <p className="text-xs text-zinc-400 font-mono">
            รหัส: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          className="w-full py-3 rounded-xl bg-zinc-900 text-white font-medium hover:bg-zinc-800"
        >
          ลองใหม่
        </button>
      </div>
    </main>
  );
}
