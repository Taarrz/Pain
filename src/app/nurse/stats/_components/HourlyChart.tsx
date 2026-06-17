"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceArea,
} from "recharts";
import type { RecordPoint } from "./StatsView";
import { zoneFor } from "@/lib/pain";

type Props = {
  records: RecordPoint[];
};

export function HourlyChart({ records }: Props) {
  const data = records
    .map((r) => {
      const d = new Date(r.recordedAt);
      return {
        hour: d.getHours() + d.getMinutes() / 60,
        score: r.score,
        label: `${String(d.getHours()).padStart(2, "0")}:${String(
          d.getMinutes()
        ).padStart(2, "0")}`,
      };
    })
    .sort((a, b) => a.hour - b.hour);

  if (records.length === 0) {
    return (
      <div
        className="h-64 flex items-center justify-center text-sm"
        style={{ color: "#8da0b5" }}
      >
        ไม่มีบันทึกในวันนี้
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid stroke="#dce5ef" strokeDasharray="3 3" />
          <ReferenceArea y1={0} y2={3.5} fill="#2e9e6b" fillOpacity={0.05} />
          <ReferenceArea y1={3.5} y2={6.5} fill="#d9920a" fillOpacity={0.05} />
          <ReferenceArea y1={6.5} y2={10} fill="#d83a3a" fillOpacity={0.05} />
          <XAxis
            type="number"
            dataKey="hour"
            domain={[0, 24]}
            ticks={[0, 6, 12, 18, 23]}
            tickFormatter={(v: number) =>
              `${String(Math.round(v)).padStart(2, "0")}:00`
            }
            stroke="#8da0b5"
            fontSize={11}
          />
          <YAxis
            type="number"
            dataKey="score"
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            stroke="#8da0b5"
            fontSize={11}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as (typeof data)[number];
              const z = zoneFor(p.score);
              return (
                <div
                  className="rounded-lg px-3 py-2 text-sm shadow"
                  style={{
                    background: "#ffffff",
                    border: "1px solid #dce5ef",
                    color: "#1a2b42",
                  }}
                >
                  <div className="font-semibold">{p.label}</div>
                  <div>
                    คะแนน: <span className="font-bold font-en">{p.score}</span>{" "}
                    <span style={{ color: z.hex }}>({z.label})</span>
                  </div>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#1f6fb2"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
            connectNulls
          />
          <Scatter dataKey="score">
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill="#ffffff"
                stroke={zoneFor(entry.score).hex}
                strokeWidth={3}
              />
            ))}
          </Scatter>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
