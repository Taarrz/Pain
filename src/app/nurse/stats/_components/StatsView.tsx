"use client";

import { useMemo, useState } from "react";
import { zoneFor } from "@/lib/pain";
import { HourlyChart } from "./HourlyChart";
import { DailyChart } from "./DailyChart";
import { AssessmentLog } from "./AssessmentLog";

export type RecordPoint = {
  id: string;
  score: number;
  recordedAt: string;
};

type Props = {
  patientName: string;
  records: RecordPoint[];
};

type View = "hourly" | "daily";

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDay(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    weekday: "short",
  });
}

export function StatsView({ patientName, records }: Props) {
  const [view, setView] = useState<View>("hourly");

  const recordsByDay = useMemo(() => {
    const map = new Map<string, RecordPoint[]>();
    for (const r of records) {
      const k = dayKey(new Date(r.recordedAt));
      const arr = map.get(k) ?? [];
      arr.push(r);
      map.set(k, arr);
    }
    return map;
  }, [records]);

  const dayKeys = useMemo(
    () => [...recordsByDay.keys()].sort(),
    [recordsByDay]
  );

  const [selectedDay, setSelectedDay] = useState<string>(
    () => dayKeys[dayKeys.length - 1] ?? dayKey(new Date())
  );

  const currentDayRecords = recordsByDay.get(selectedDay) ?? [];
  const summaryRecords = view === "hourly" ? currentDayRecords : records;

  const summary = useMemo(() => {
    if (summaryRecords.length === 0) {
      return { max: null as number | null, min: null as number | null, count: 0 };
    }
    const scores = summaryRecords.map((r) => r.score);
    return {
      max: Math.max(...scores),
      min: Math.min(...scores),
      count: summaryRecords.length,
    };
  }, [summaryRecords]);

  const dayIdx = dayKeys.indexOf(selectedDay);
  const canPrev = dayIdx > 0;
  const canNext = dayIdx >= 0 && dayIdx < dayKeys.length - 1;

  return (
    <div className="space-y-4">
      {/* View toggle + selected patient */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs" style={{ color: "#8da0b5" }}>
            ผู้ป่วยที่เลือก
          </div>
          <div
            className="text-base sm:text-lg font-semibold"
            style={{ color: "#1a2b42" }}
          >
            {patientName}
          </div>
        </div>
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: "#eef3f8" }}
        >
          <ToggleButton
            active={view === "hourly"}
            onClick={() => setView("hourly")}
            label="รายชั่วโมง"
          />
          <ToggleButton
            active={view === "daily"}
            onClick={() => setView("daily")}
            label="รายวัน"
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <SummaryBox
          label="ปวดสูงสุด"
          value={summary.max}
          color={summary.max !== null ? zoneFor(summary.max).hex : "#8da0b5"}
        />
        <SummaryBox
          label="ปวดต่ำสุด"
          value={summary.min}
          color={summary.min !== null ? zoneFor(summary.min).hex : "#8da0b5"}
        />
        <SummaryBox label="ครั้งที่บันทึก" value={summary.count} color="#1a2b42" />
      </div>

      {/* Chart card */}
      <Card>
        <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
          <div className="text-sm font-semibold" style={{ color: "#1a2b42" }}>
            แนวโน้มความปวด{" "}
            <span
              className="font-en font-normal text-xs"
              style={{ color: "#8da0b5" }}
            >
              Pain Score
            </span>
          </div>
          {view === "hourly" && (
            <div className="flex items-center gap-1.5">
              <DayNavButton
                onClick={() => canPrev && setSelectedDay(dayKeys[dayIdx - 1])}
                disabled={!canPrev}
                label="‹"
                aria="วันก่อนหน้า"
              />
              <span
                className="text-sm font-semibold text-center min-w-[110px]"
                style={{ color: "#1a2b42" }}
              >
                {formatDay(selectedDay)}
              </span>
              <DayNavButton
                onClick={() => canNext && setSelectedDay(dayKeys[dayIdx + 1])}
                disabled={!canNext}
                label="›"
                aria="วันถัดไป"
              />
            </div>
          )}
        </div>
        <div className="text-xs mb-3" style={{ color: "#8da0b5" }}>
          {view === "hourly"
            ? "แกนนอน = เวลาในวันนั้น (00:00–23:00 น.)"
            : "แกนนอน = แต่ละวันที่นอนโรงพยาบาล (แท่ง = สูงสุด, เส้น = เฉลี่ย)"}
        </div>
        {view === "hourly" ? (
          <HourlyChart records={currentDayRecords} />
        ) : (
          <DailyChart recordsByDay={recordsByDay} dayKeys={dayKeys} />
        )}
      </Card>

      {/* Log */}
      <Card>
        <div className="text-sm font-semibold mb-3" style={{ color: "#1a2b42" }}>
          รายการบันทึก ({records.length}){" "}
          <span
            className="font-en font-normal text-xs"
            style={{ color: "#8da0b5" }}
          >
            Log
          </span>
        </div>
        <AssessmentLog records={records} />
      </Card>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "#ffffff",
        border: "1px solid #dce5ef",
        boxShadow:
          "0 1px 3px rgba(26,43,66,.06), 0 4px 16px rgba(26,43,66,.06)",
      }}
    >
      {children}
    </div>
  );
}

function ToggleButton({
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
      className="px-4 py-1.5 rounded-lg text-sm font-medium transition"
      style={{
        background: active ? "#ffffff" : "transparent",
        color: active ? "#1a2b42" : "#5a6b80",
        boxShadow: active ? "0 1px 3px rgba(0,0,0,.08)" : "none",
        border: "none",
      }}
    >
      {label}
    </button>
  );
}

function SummaryBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number | null;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-3.5 text-center"
      style={{
        background: "#ffffff",
        border: "1px solid #dce5ef",
        boxShadow: "0 1px 3px rgba(26,43,66,.06)",
      }}
    >
      <div
        className="text-2xl font-bold font-en leading-none"
        style={{ color: value === null ? "#8da0b5" : color }}
      >
        {value === null ? "—" : value}
      </div>
      <div className="text-xs mt-1.5" style={{ color: "#5a6b80" }}>
        {label}
      </div>
    </div>
  );
}

function DayNavButton({
  onClick,
  disabled,
  label,
  aria,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  aria: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={aria}
      className="grid place-items-center rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
      style={{
        width: 30,
        height: 30,
        background: "#ffffff",
        border: "1px solid #dce5ef",
        color: "#5a6b80",
        fontSize: 15,
      }}
    >
      {label}
    </button>
  );
}
