"use client";

import { useTransition } from "react";
import type { SerializedAlert } from "@/lib/alert-serialize";
import { LOCATION_LABEL_BY_ID, SEVERITY_INFO, zoneFor } from "@/lib/pain";
import { timeAgo } from "@/lib/time";
import { acknowledgeAlert } from "../actions";

type Props = {
  alert: SerializedAlert;
  now: number;
};

export function AlertCard({ alert, now }: Props) {
  const [pending, startTransition] = useTransition();
  const sev = SEVERITY_INFO[alert.severity];
  const zone = zoneFor(alert.painRecord.score);
  const { patient, score, characteristics, locations, factors, recordedAt } =
    alert.painRecord;

  function onAck() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", alert.id);
      await acknowledgeAlert(fd);
    });
  }

  const isRed = alert.severity === "RED";

  return (
    <article
      className="flex items-start gap-3.5 rounded-2xl p-4 sm:p-5 transition"
      style={{
        background: `linear-gradient(90deg, ${sev.bg} 0%, #ffffff 60%)`,
        border: `1px solid ${sev.line}`,
        borderLeft: `5px solid ${sev.hex}`,
        boxShadow:
          "0 1px 3px rgba(26,43,66,.06), 0 4px 16px rgba(26,43,66,.06)",
        animation: isRed
          ? "slide-in .35s ease, pulse-slow 1.8s ease-in-out infinite"
          : "slide-in .35s ease",
        opacity: pending ? 0.5 : 1,
      }}
    >
      <div
        className="grid place-items-center font-en font-bold text-white shrink-0 rounded-xl"
        style={{
          width: 50,
          height: 50,
          fontSize: 23,
          background: zone.hex,
          marginTop: 2,
        }}
        aria-hidden
      >
        {score}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span
            className="font-semibold text-[15px]"
            style={{ color: "#1a2b42" }}
          >
            {patient.name}
          </span>
          <span
            className="text-[13px]"
            style={{ color: "#8da0b5", fontWeight: 400 }}
          >
            · อายุ {patient.age} ปี
          </span>
        </div>

        <div className="text-xs mt-0.5" style={{ color: "#5a6b80" }}>
          ห้อง {patient.room} · เตียง {patient.bed} · {timeAgo(recordedAt, now)}
        </div>

        <span
          className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-xl mt-1.5"
          style={{ background: sev.bg, color: sev.hex }}
        >
          {sev.label} ({score}/10)
        </span>

        {(characteristics.length > 0 ||
          locations.length > 0 ||
          factors.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {characteristics.map((v) => (
              <Tag key={v} icon="🩹">
                {v}
              </Tag>
            ))}
            {locations.map((id) => (
              <Tag key={id} icon="📍">
                {LOCATION_LABEL_BY_ID[id] ?? id}
              </Tag>
            ))}
            {factors.map((v) => (
              <Tag key={v} icon="⚡">
                {v}
              </Tag>
            ))}
          </div>
        )}

        <div
          className="text-xs mt-2 font-medium"
          style={{ color: "#5a6b80" }}
        >
          {sev.managementHint}
        </div>
      </div>

      <button
        type="button"
        onClick={onAck}
        disabled={pending}
        className="shrink-0 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white transition"
        style={{
          background: pending ? "#5a6b80" : "#1a2b42",
          marginTop: 2,
          border: "none",
          cursor: pending ? "not-allowed" : "pointer",
        }}
      >
        {pending ? "..." : "รับเรื่อง"}
      </button>
    </article>
  );
}

function Tag({
  icon,
  children,
}: {
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg"
      style={{
        background: "#eef3f8",
        color: "#5a6b80",
        border: "1px solid #dce5ef",
      }}
    >
      <span aria-hidden>{icon}</span>
      {children}
    </span>
  );
}
