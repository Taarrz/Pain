"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  Cell,
} from "recharts";
import type { RecordPoint } from "./StatsView";
import { zoneFor } from "@/lib/pain";

type Props = {
  recordsByDay: Map<string, RecordPoint[]>;
  dayKeys: string[];
};

function formatShortDay(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
  });
}

export function DailyChart({ recordsByDay, dayKeys }: Props) {
  const data = dayKeys.map((key) => {
    const recs = recordsByDay.get(key) ?? [];
    const scores = recs.map((r) => r.score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return {
      key,
      label: formatShortDay(key),
      max: Math.max(...scores),
      avg: Number(avg.toFixed(1)),
      count: recs.length,
    };
  });

  if (data.length === 0) {
    return (
      <div
        className="h-64 flex items-center justify-center text-sm"
        style={{ color: "#8da0b5" }}
      >
        ยังไม่มีข้อมูล
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
          <XAxis dataKey="label" stroke="#8da0b5" fontSize={11} />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            stroke="#8da0b5"
            fontSize={11}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as (typeof data)[number];
              return (
                <div
                  className="rounded-lg px-3 py-2 text-sm shadow"
                  style={{
                    background: "#ffffff",
                    border: "1px solid #dce5ef",
                    color: "#1a2b42",
                  }}
                >
                  <div className="font-semibold mb-1">{p.label}</div>
                  <div>
                    เฉลี่ย:{" "}
                    <span className="font-bold font-en">{p.avg}</span>
                  </div>
                  <div>
                    สูงสุด:{" "}
                    <span className="font-bold font-en">{p.max}</span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: "#8da0b5" }}>
                    บันทึก {p.count} ครั้ง
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="max" radius={[4, 4, 0, 0]} fillOpacity={0.5}>
            {data.map((d, i) => (
              <Cell key={i} fill={zoneFor(d.max).hex} />
            ))}
          </Bar>
          <Line
            type="monotone"
            dataKey="avg"
            stroke="#1f6fb2"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#1f6fb2" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
