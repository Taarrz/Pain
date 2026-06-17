"use client";

import { useState } from "react";
import {
  BODY_LOCATIONS,
  type BodySide,
  LOCATION_LABEL_BY_ID,
} from "@/lib/pain";

type Props = {
  selected: Set<string>;
  onToggle: (id: string) => void;
};

const SILHOUETTE_PATH =
  "M60 8 C68 8 73 14 73 22 C73 28 70 32 66 34 L74 40 C84 42 92 50 92 64 L96 110 C97 124 90 126 88 116 L84 70 L82 118 C82 120 81 130 80 138 L77 200 C77 208 67 208 67 200 L64 140 L60 140 L56 140 L53 200 C53 208 43 208 43 200 L40 138 C39 130 38 120 38 118 L36 70 L32 116 C30 126 23 124 24 110 L28 64 C28 50 36 42 46 40 L54 34 C50 32 47 28 47 22 C47 14 52 8 60 8 Z";

export function BodyMap({ selected, onToggle }: Props) {
  const [side, setSide] = useState<BodySide>("front");
  const dots = BODY_LOCATIONS.filter((l) => l.side === side);

  return (
    <div className="flex flex-col items-center">
      <div
        className="text-xs font-semibold mb-2"
        style={{ color: "#155486" }}
      >
        👆 แตะเลือกมุมมอง
      </div>
      <div
        className="flex gap-2 mb-3.5 p-1.5 rounded-xl"
        style={{
          background: "#e8f1f9",
          border: "1px solid #cfe2f2",
        }}
      >
        <SideToggle
          active={side === "front"}
          onClick={() => setSide("front")}
          label="🧍 ด้านหน้า"
        />
        <SideToggle
          active={side === "back"}
          onClick={() => setSide("back")}
          label="🧍‍♂️ ด้านหลัง"
        />
      </div>

      <svg
        viewBox="0 0 120 216"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[200px] h-auto cursor-pointer"
        aria-label={`รูปร่างกายด้าน${side === "front" ? "หน้า"  : "หลัง"}`}
      >
        <path
          d={SILHOUETTE_PATH}
          fill="#e8eef5"
          stroke="#cdd9e6"
          strokeWidth="1.5"
        />
        {dots.map((dot) => {
          const isSelected = selected.has(dot.id);
          return (
            <g key={dot.id}>
              <circle
                cx={dot.cx}
                cy={dot.cy}
                r={dot.r}
                fill={isSelected ? "#d83a3a" : "#cdd9e6"}
                stroke="#ffffff"
                strokeWidth="1.2"
                style={{ cursor: "pointer", transition: "fill .12s" }}
                onClick={() => onToggle(dot.id)}
              >
                <title>{dot.label}</title>
              </circle>
            </g>
          );
        })}
      </svg>

      <div
        className="text-sm text-center mt-2.5 min-h-[20px]"
        style={{ color: "#5a6b80" }}
      >
        {selected.size > 0
          ? `เลือกแล้ว: ${[...selected]
              .map((id) => LOCATION_LABEL_BY_ID[id] ?? id)
              .join(", ")}`
          : "ยังไม่ได้เลือกตำแหน่ง"}
      </div>
    </div>
  );
}

function SideToggle({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="px-5 py-2.5 rounded-lg text-sm font-semibold transition"
      style={{
        background: active ? "#1f6fb2" : "transparent",
        color: active ? "#ffffff" : "#155486",
        boxShadow: active ? "0 2px 8px rgba(31,111,178,.3)" : "none",
        border: "none",
      }}
    >
      {label}
    </button>
  );
}
