import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { readSessionUserId } from "./session";

export const getCurrentUser = cache(async () => {
  const id = await readSessionUserId();
  if (!id) return null;
  return prisma.user.findUnique({
    where: { id },
    include: { patient: true },
  });
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requirePatient() {
  const user = await requireUser();
  if (user.role !== "PATIENT" || !user.patient) redirect("/login");
  return { user, patient: user.patient };
}

export async function requireNurse() {
  const user = await requireUser();
  if (user.role !== "NURSE") redirect("/login");
  return user;
}
