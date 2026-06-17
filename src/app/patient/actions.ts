"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePatient } from "@/lib/dal";
import { severityFor } from "@/lib/pain";
import { alertBus } from "@/lib/alert-bus";

export type AssessmentState = { error?: string };

export async function submitAssessment(
  _prev: AssessmentState,
  formData: FormData
): Promise<AssessmentState> {
  const { patient } = await requirePatient();

  const scoreRaw = formData.get("score");
  const score = Number(scoreRaw);
  if (!Number.isInteger(score) || score < 0 || score > 10) {
    return { error: "กรุณาเลือกระดับความปวด" };
  }

  const characteristics = formData
    .getAll("characteristics")
    .map(String)
    .filter(Boolean);
  const locations = formData.getAll("locations").map(String).filter(Boolean);
  const factors = formData.getAll("factors").map(String).filter(Boolean);

  try {
    const record = await prisma.painRecord.create({
      data: {
        patientId: patient.id,
        score,
        characteristics,
        locations,
        factors,
        alert: { create: { severity: severityFor(score) } },
      },
      include: { alert: true },
    });

    if (record.alert) {
      alertBus.emit("event", { type: "new", alertId: record.alert.id });
    }
  } catch (e) {
    console.error("submitAssessment failed:", e);
    return { error: "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่" };
  }

  redirect("/patient/submitted");
}
