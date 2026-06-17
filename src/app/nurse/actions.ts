"use server";

import { prisma } from "@/lib/prisma";
import { requireNurse } from "@/lib/dal";
import { alertBus } from "@/lib/alert-bus";

export async function acknowledgeAlert(formData: FormData) {
  const user = await requireNurse();
  const id = String(formData.get("id"));
  if (!id) throw new Error("missing id");

  const result = await prisma.alert.updateMany({
    where: { id, status: "PENDING" },
    data: {
      status: "ACKNOWLEDGED",
      acknowledgedById: user.id,
      acknowledgedAt: new Date(),
    },
  });

  if (result.count > 0) {
    alertBus.emit("event", { type: "acknowledged", alertId: id });
  }
}
