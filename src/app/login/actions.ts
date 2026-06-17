"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";

export type LoginState = { error?: string };

export async function loginWithPassword(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "กรุณากรอก username และ password" };
  }

  // Same error for "user not found" and "wrong password"
  // to prevent username enumeration attacks
  const GENERIC_ERROR = "username หรือ password ไม่ถูกต้อง";

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return { error: GENERIC_ERROR };
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return { error: GENERIC_ERROR };
  }

  await setSession(user.id);

  if (user.role === "NURSE") redirect("/nurse");
  redirect("/patient");
}
