"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SerializedAlert } from "@/lib/alert-serialize";
import { AlertCard } from "./AlertCard";

type Filter = "all" | "RED" | "YELLOW" | "GREEN";
type ConnState = "connecting" | "open" | "error";

type Props = {
  initialAlerts: SerializedAlert[];
};

const SEVERITY_ORDER: Record<SerializedAlert["severity"], number> = {
  RED: 0,
  YELLOW: 1,
  GREEN: 2,
};

export function AlertList({ initialAlerts }: Props) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState<Filter>("all");
  const [now, setNow] = useState(() => Date.now());
  const [conn, setConn] = useState<ConnState>("connecting");
  const router = useRouter();
  const wasConnected = useRef(false);

  useEffect(() => {
    setAlerts(initialAlerts);
  }, [initialAlerts]);

  useEffect(() => {
    const es = new EventSource("/api/alerts/stream");

    es.onopen = () => {
      setConn("open");
      if (wasConnected.current) {
        router.refresh();
      }
      wasConnected.current = true;
    };

    es.onerror = () => {
      setConn("error");
    };

    es.onmessage = (e) => {
      const ev = JSON.parse(e.data) as
        | { type: "ready" }
        | { type: "new"; alert: SerializedAlert }
        | { type: "acknowledged"; alertId: string };

      if (ev.type === "new") {
        setAlerts((prev) =>
          prev.some((a) => a.id === ev.alert.id) ? prev : [ev.alert, ...prev]
        );
      } else if (ev.type === "acknowledged") {
        setAlerts((prev) => prev.filter((a) => a.id !== ev.alertId));
      }
    };

    return () => es.close();
  }, [router]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const counts = useMemo(
    () => ({
      all: alerts.length,
      RED: alerts.filter((a) => a.severity === "RED").length,
      YELLOW: alerts.filter((a) => a.severity === "YELLOW").length,
      GREEN: alerts.filter((a) => a.severity === "GREEN").length,
    }),
    [alerts]
  );

  const visible = useMemo(() => {
    const filtered =
      filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);
    return [...filtered].sort((a, b) => {
      const s = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      if (s !== 0) return s;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [alerts, filter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2
          className="text-lg font-semibold flex items-center gap-2"
          style={{ color: "#1a2b42" }}
        >
          การแจ้งเตือน
          <span
            className="font-en font-normal text-sm"
            style={{ color: "#8da0b5" }}
          >
            Pain Alerts
          </span>
        </h2>
        <ConnectionIndicator state={conn} />
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <FilterPill
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="ทั้งหมด"
          count={counts.all}
        />
        <FilterPill
          active={filter === "RED"}
          onClick={() => setFilter("RED")}
          label="แดง"
          count={counts.RED}
        />
        <FilterPill
          active={filter === "YELLOW"}
          onClick={() => setFilter("YELLOW")}
          label="เหลือง"
          count={counts.YELLOW}
        />
      </div>

      {visible.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{
            background: "#ffffff",
            border: "2px dashed #dce5ef",
            color: "#8da0b5",
          }}
        >
          <div className="text-4xl mb-2 opacity-50" aria-hidden>
            ✓
          </div>
          <div className="font-medium">ไม่มีการแจ้งเตือนค้างอยู่</div>
          <div className="text-sm mt-1">ผู้ป่วยทุกคนได้รับการดูแลแล้ว</div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visible.map((a) => (
            <AlertCard key={a.id} alert={a} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="text-xs px-3 py-1.5 rounded-2xl font-medium transition"
      style={{
        background: active ? "#1a2b42" : "#ffffff",
        color: active ? "#ffffff" : "#5a6b80",
        border: `1px solid ${active ? "#1a2b42" : "#dce5ef"}`,
      }}
    >
      {label}
      <span
        className="ml-1.5 font-en"
        style={{
          opacity: active ? 0.7 : 1,
          color: active ? "#ffffff" : "#8da0b5",
        }}
      >
        ({count})
      </span>
    </button>
  );
}

function ConnectionIndicator({ state }: { state: ConnState }) {
  const config = {
    connecting: {
      color: "#d9920a",
      pulse: true,
      text: "กำลังเชื่อมต่อ...",
      textColor: "#5a6b80",
    },
    open: {
      color: "#2e9e6b",
      pulse: false,
      text: "เชื่อมต่อ realtime",
      textColor: "#5a6b80",
    },
    error: {
      color: "#d83a3a",
      pulse: true,
      text: "ขาดการเชื่อมต่อ — กำลังลองใหม่",
      textColor: "#d83a3a",
    },
  }[state];

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-1.5 text-xs font-medium"
      style={{ color: config.textColor }}
    >
      <span
        className={`inline-block w-2 h-2 rounded-full ${
          config.pulse ? "animate-pulse" : ""
        }`}
        style={{ background: config.color }}
        aria-hidden
      />
      {config.text}
    </div>
  );
}
