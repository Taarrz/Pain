"use client";

import { zoneFor } from "@/lib/pain";
import type { RecordPoint } from "./StatsView";

type Props = {
  records: RecordPoint[];
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AssessmentLog({ records }: Props) {
  const sorted = [...records].sort((a, b) =>
    b.recordedAt.localeCompare(a.recordedAt)
  );

  if (sorted.length === 0) {
    return (
      <div className="text-center text-sm py-5" style={{ color: "#8da0b5" }}>
        ยังไม่มีบันทึก
      </div>
    );
  }

  return (
    <ul className="divide-y" style={{ borderColor: "#dce5ef" }}>
      {sorted.map((r) => {
        const z = zoneFor(r.score);
        return (
          <li
            key={r.id}
            className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <span
              className="grid place-items-center font-en font-bold text-white shrink-0 rounded-lg"
              style={{
                width: 34,
                height: 34,
                background: z.hex,
              }}
            >
              {r.score}
            </span>
            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-medium"
                style={{ color: "#1a2b42" }}
              >
                {z.label}
              </div>
              <div
                className="text-xs font-en"
                style={{ color: "#8da0b5" }}
              >
                Pain Score {r.score}/10
              </div>
            </div>
            <div
              className="text-xs font-en shrink-0"
              style={{ color: "#8da0b5" }}
            >
              {formatTimestamp(r.recordedAt)}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
