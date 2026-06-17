"use client";

import { ZONES, zoneFor } from "@/lib/pain";
import { PainFace } from "./PainFace";

type Props = {
  value: number | null;
  onChange: (n: number) => void;
};

export function PainScoreSelector({ value, onChange }: Props) {
  const selected = value !== null ? zoneFor(value) : null;

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <PainFace score={value} size={84} />
      </div>

      <div
        className="text-center font-bold font-en leading-none"
        style={{
          fontSize: 40,
          color: selected ? selected.hex : "#8da0b5",
        }}
      >
        {value === null ? "—" : `${value} / 10`}
      </div>
      <div
        className="text-center font-semibold text-sm"
        style={{ color: selected ? selected.hex : "#8da0b5" }}
      >
        {selected ? selected.label : "เลือกคะแนนด้านล่าง"}
      </div>

      <div className="flex flex-wrap justify-center gap-1.5 pt-2">
        {Array.from({ length: 11 }, (_, n) => {
          const z = zoneFor(n);
          const isSelected = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              aria-pressed={isSelected}
              className="font-en font-bold rounded-xl transition focus:outline-none"
              style={{
                width: 48,
                height: 48,
                fontSize: 18,
                borderWidth: isSelected ? 3.5 : 2.5,
                borderStyle: "solid",
                borderColor: z.hex,
                background: isSelected ? z.hex : `${z.hex}1f`,
                color: isSelected ? "#ffffff" : z.hex,
                transform: isSelected ? "translateY(-4px) scale(1.18)" : "none",
                boxShadow: isSelected ? "0 6px 18px rgba(0,0,0,.22)" : "none",
                zIndex: isSelected ? 2 : 1,
                position: "relative",
              }}
            >
              {n}
            </button>
          );
        })}
      </div>

      <div
        className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-xs font-medium rounded-xl px-4 py-3"
        style={{
          background: "#f5f8fb",
          border: "1px solid #dce5ef",
          color: "#1a2b42",
        }}
      >
        {ZONES.map((z) => (
          <span key={z.label} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3.5 h-3.5 rounded-full shrink-0"
              style={{
                background: z.hex,
                boxShadow: "0 0 0 2px #fff, 0 0 0 3px rgba(0,0,0,.05)",
              }}
              aria-hidden
            />
            <span className="font-en">
              {z.range[0] === z.range[1]
                ? z.range[0]
                : `${z.range[0]}–${z.range[1]}`}
            </span>
            <span>{z.label.replace("ปวด", "")}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
