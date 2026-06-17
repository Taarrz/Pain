import type { Alert, PainRecord, Patient, User } from "@prisma/client";

type FullAlert = Alert & {
  painRecord: PainRecord & {
    patient: Patient & { user: User };
  };
};

export type SerializedAlert = {
  id: string;
  severity: "GREEN" | "YELLOW" | "RED";
  status: "PENDING" | "ACKNOWLEDGED";
  createdAt: string;
  acknowledgedAt: string | null;
  painRecord: {
    id: string;
    score: number;
    characteristics: string[];
    locations: string[];
    factors: string[];
    recordedAt: string;
    patient: {
      id: string;
      age: number;
      room: string;
      bed: string;
      diagnosis: string;
      name: string;
    };
  };
};

export function serializeAlert(a: FullAlert): SerializedAlert {
  return {
    id: a.id,
    severity: a.severity,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
    acknowledgedAt: a.acknowledgedAt?.toISOString() ?? null,
    painRecord: {
      id: a.painRecord.id,
      score: a.painRecord.score,
      characteristics: a.painRecord.characteristics,
      locations: a.painRecord.locations,
      factors: a.painRecord.factors,
      recordedAt: a.painRecord.recordedAt.toISOString(),
      patient: {
        id: a.painRecord.patient.id,
        age: a.painRecord.patient.age,
        room: a.painRecord.patient.room,
        bed: a.painRecord.patient.bed,
        diagnosis: a.painRecord.patient.diagnosis,
        name: a.painRecord.patient.user.name,
      },
    },
  };
}
