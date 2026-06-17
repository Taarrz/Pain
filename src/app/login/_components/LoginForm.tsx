"use client";

import { useActionState } from "react";
import { loginWithPassword, type LoginState } from "../actions";

const INITIAL_STATE: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(
    loginWithPassword,
    INITIAL_STATE
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor="username"
          className="block text-sm font-medium"
          style={{ color: "#1a2b42" }}
        >
          ชื่อผู้ใช้
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          disabled={pending}
          className="w-full px-4 py-2.5 rounded-xl text-base outline-none transition disabled:opacity-50"
          style={{
            background: "#ffffff",
            border: "1.5px solid #dce5ef",
            color: "#1a2b42",
          }}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-sm font-medium"
          style={{ color: "#1a2b42" }}
        >
          รหัสผ่าน
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          className="w-full px-4 py-2.5 rounded-xl text-base outline-none transition disabled:opacity-50 font-en"
          style={{
            background: "#ffffff",
            border: "1.5px solid #dce5ef",
            color: "#1a2b42",
          }}
        />
      </div>

      {state.error && (
        <div
          role="alert"
          className="p-3 rounded-xl text-sm"
          style={{
            background: "#fcecec",
            border: "1px solid #f3c2c2",
            color: "#b32a2a",
          }}
        >
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 rounded-xl text-base font-semibold text-white transition disabled:cursor-not-allowed"
        style={{
          background: pending ? "#5a6b80" : "#1f6fb2",
          border: "none",
          boxShadow: pending ? "none" : "0 4px 12px rgba(31,111,178,.25)",
        }}
      >
        {pending ? "กำลังเข้าระบบ..." : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
