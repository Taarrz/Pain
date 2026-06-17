import type { AlertSeverity } from "@prisma/client";

export const PAIN_CHARACTERISTICS = [
  "ปวดตื้อ",
  "ปวดแปลบ/ไฟช้อต",
  "ปวดบีบ",
  "ปวดแสบร้อน",
  "ปวดตุบ ๆ",
] as const;

export const PAIN_FACTORS = [
  "ปวดขณะพัก",
  "ปวดขณะเคลื่อนไหว",
  "ปวดขณะทำกายภาพบำบัด",
] as const;

export type BodySide = "front" | "back";

export type BodyLocation = {
  id: string;
  label: string;
  side: BodySide;
  cx: number;
  cy: number;
  r: number;
};

// SVG positions on a 120x216 viewBox (matches Silhouette component)
export const BODY_LOCATIONS: BodyLocation[] = [
  // FRONT
  { id: "head_front", label: "ศีรษะ", side: "front", cx: 60, cy: 24, r: 13 },
  { id: "left_shoulder", label: "ไหล่ซ้าย", side: "front", cx: 38, cy: 56, r: 9 },
  { id: "right_shoulder", label: "ไหล่ขวา", side: "front", cx: 82, cy: 56, r: 9 },
  { id: "chest", label: "หน้าอก", side: "front", cx: 60, cy: 66, r: 11 },
  { id: "abdomen", label: "ท้อง", side: "front", cx: 60, cy: 92, r: 11 },
  { id: "left_arm", label: "แขนซ้าย", side: "front", cx: 30, cy: 90, r: 8 },
  { id: "right_arm", label: "แขนขวา", side: "front", cx: 90, cy: 90, r: 8 },
  { id: "left_hand", label: "มือซ้าย", side: "front", cx: 24, cy: 120, r: 7 },
  { id: "right_hand", label: "มือขวา", side: "front", cx: 96, cy: 120, r: 7 },
  { id: "hip", label: "สะโพก", side: "front", cx: 60, cy: 118, r: 11 },
  { id: "left_knee", label: "เข่าซ้าย", side: "front", cx: 48, cy: 158, r: 9 },
  { id: "right_knee", label: "เข่าขวา", side: "front", cx: 72, cy: 158, r: 9 },
  { id: "left_foot", label: "เท้าซ้าย", side: "front", cx: 48, cy: 196, r: 8 },
  { id: "right_foot", label: "เท้าขวา", side: "front", cx: 72, cy: 196, r: 8 },

  // BACK
  { id: "head_back", label: "ท้ายทอย", side: "back", cx: 60, cy: 24, r: 13 },
  { id: "left_scapula", label: "สะบักซ้าย", side: "back", cx: 46, cy: 60, r: 9 },
  { id: "right_scapula", label: "สะบักขวา", side: "back", cx: 74, cy: 60, r: 9 },
  { id: "upper_back", label: "หลังส่วนบน", side: "back", cx: 60, cy: 72, r: 11 },
  { id: "lower_back", label: "หลังส่วนล่าง", side: "back", cx: 60, cy: 98, r: 11 },
  { id: "buttock", label: "ก้น", side: "back", cx: 60, cy: 120, r: 12 },
  { id: "left_hamstring", label: "ต้นขาหลังซ้าย", side: "back", cx: 50, cy: 148, r: 9 },
  { id: "right_hamstring", label: "ต้นขาหลังขวา", side: "back", cx: 70, cy: 148, r: 9 },
  { id: "left_calf", label: "น่องซ้าย", side: "back", cx: 50, cy: 180, r: 8 },
  { id: "right_calf", label: "น่องขวา", side: "back", cx: 70, cy: 180, r: 8 },
  { id: "left_heel", label: "ส้นเท้าซ้าย", side: "back", cx: 50, cy: 204, r: 7 },
  { id: "right_heel", label: "ส้นเท้าขวา", side: "back", cx: 70, cy: 204, r: 7 },
];

export const LOCATION_LABEL_BY_ID: Record<string, string> = Object.fromEntries(
  BODY_LOCATIONS.map((l) => [l.id, l.label])
);

// 5-level pain zones (display & user-facing) with exact hex colors
export type Zone = {
  range: [number, number];
  label: string;
  hex: string;
  // SVG mouth path for face emoji, viewBox 0 0 96 96
  mouth: string;
};

export const ZONES: Zone[] = [
  { range: [0, 0], label: "ไม่ปวดเลย", hex: "#2e9e6b", mouth: "M30 60 Q48 78 66 60" },
  { range: [1, 3], label: "ปวดเล็กน้อย", hex: "#86b817", mouth: "M30 62 Q48 72 66 62" },
  { range: [4, 6], label: "ปวดปานกลาง", hex: "#d9920a", mouth: "M30 66 L66 66" },
  { range: [7, 9], label: "ปวดมาก", hex: "#e8631a", mouth: "M30 70 Q48 60 66 70" },
  { range: [10, 10], label: "ปวดมากที่สุด", hex: "#d11f1f", mouth: "M30 72 Q48 54 66 72" },
];

export function zoneFor(score: number): Zone {
  return (
    ZONES.find((z) => score >= z.range[0] && score <= z.range[1]) ?? ZONES[0]
  );
}

// 3-level severity for nurse alerts (simpler triage groups)
export type SeverityInfo = {
  hex: string;
  bg: string;
  line: string;
  label: string;
  managementHint: string;
};

export const SEVERITY_INFO: Record<AlertSeverity, SeverityInfo> = {
  GREEN: {
    hex: "#2e9e6b",
    bg: "#e6f6ee",
    line: "#bce5d1",
    label: "ปวดเล็กน้อย",
    managementHint: "👁 เฝ้าสังเกตอาการ · ยังไม่ต้องให้ยา",
  },
  YELLOW: {
    hex: "#d9920a",
    bg: "#fdf3df",
    line: "#f3dca0",
    label: "ปวดปานกลาง",
    managementHint: "💊 ให้ยาแก้ปวดระดับกลาง (PRN) ตามแผนการรักษา",
  },
  RED: {
    hex: "#d83a3a",
    bg: "#fcecec",
    line: "#f3c2c2",
    label: "ปวดมาก",
    managementHint: "💊 ให้ยาแก้ปวดแรง (เช่น opioid PRN) + รายงานแพทย์",
  },
};

export function severityFor(score: number): AlertSeverity {
  if (score >= 7) return "RED";
  if (score >= 4) return "YELLOW";
  return "GREEN";
}
