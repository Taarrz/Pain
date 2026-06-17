"use client";

import { useActionState, useState } from "react";
import { PainScoreSelector } from "./PainScoreSelector";
import { ChipGroup } from "./ChipGroup";
import { BodyMap } from "./BodyMap";
import { PAIN_CHARACTERISTICS, PAIN_FACTORS, zoneFor } from "@/lib/pain";
import { submitAssessment, type AssessmentState } from "../actions";

const INITIAL_STATE: AssessmentState = {};

export function AssessmentForm() {
  const [score, setScore] = useState<number | null>(null);
  const [characteristics, setCharacteristics] = useState<Set<string>>(new Set());
  const [locations, setLocations] = useState<Set<string>>(new Set());
  const [factors, setFactors] = useState<Set<string>>(new Set());

  const [state, action, pending] = useActionState(
    submitAssessment,
    INITIAL_STATE
  );

  function toggle(set: Set<string>, setSet: (s: Set<string>) => void, v: string) {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    setSet(next);
  }

  const canSubmit = score !== null && !pending;
  const z = score !== null ? zoneFor(score) : null;

  return (
    <form action={action}>
      {score !== null && <input type="hidden" name="score" value={score} />}
      {[...characteristics].map((v) => (
        <input key={v} type="hidden" name="characteristics" value={v} />
      ))}
      {[...locations].map((v) => (
        <input key={v} type="hidden" name="locations" value={v} />
      ))}
      {[...factors].map((v) => (
        <input key={v} type="hidden" name="factors" value={v} />
      ))}

      <Section number={1} title="ระดับความปวด" titleEn="Pain Score (NRS 0–10)">
        <PainScoreSelector value={score} onChange={setScore} />
      </Section>

      <Section number={2} title="ลักษณะความปวด" hint="เลือกได้มากกว่า 1">
        <ChipGroup
          options={PAIN_CHARACTERISTICS}
          selected={characteristics}
          onToggle={(v) => toggle(characteristics, setCharacteristics, v)}
        />
      </Section>

      <Section number={3} title="ตำแหน่งที่ปวด" hint="แตะที่รูปเพื่อเลือก">
        <BodyMap
          selected={locations}
          onToggle={(id) => toggle(locations, setLocations, id)}
        />
      </Section>

      <Section number={4} title="ปัจจัยที่ทำให้ปวด" hint="เลือกได้มากกว่า 1">
        <ChipGroup
          options={PAIN_FACTORS}
          selected={factors}
          onToggle={(v) => toggle(factors, setFactors, v)}
        />
      </Section>

      {state.error && (
        <div
          role="alert"
          className="mt-6 p-4 rounded-xl text-sm"
          style={{
            background: "#fcecec",
            border: "1px solid #f3c2c2",
            color: "#b32a2a",
          }}
        >
          {state.error}
        </div>
      )}

      <div className="sticky bottom-4 mt-6">
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-4 rounded-2xl text-base sm:text-lg font-semibold transition flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          style={{
            background: !canSubmit ? "#cdd9e6" : z ? z.hex : "#1f6fb2",
            color: !canSubmit ? "#8da0b5" : "#ffffff",
            boxShadow: canSubmit ? "0 8px 20px rgba(26,43,66,.18)" : "none",
            border: "none",
          }}
        >
          {pending ? (
            "กำลังส่ง..."
          ) : score === null ? (
            "กรุณาเลือกระดับความปวดก่อน"
          ) : (
            <>
              <span aria-hidden>📤</span> ส่งให้พยาบาล
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Section({
  number,
  title,
  titleEn,
  hint,
  children,
}: {
  number: number;
  title: string;
  titleEn?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 first:mt-0">
      <div className="flex items-center gap-2 mb-3 text-[15px] font-semibold">
        <span
          className="font-en grid place-items-center text-xs text-white shrink-0 rounded-lg"
          style={{
            width: 22,
            height: 22,
            background: "#1f6fb2",
          }}
          aria-hidden
        >
          {number}
        </span>
        <span style={{ color: "#1a2b42" }}>{title}</span>
        {titleEn && (
          <span
            className="font-en text-xs font-normal"
            style={{ color: "#8da0b5" }}
          >
            {titleEn}
          </span>
        )}
        {hint && (
          <span
            className="text-xs font-normal ml-auto"
            style={{ color: "#8da0b5" }}
          >
            {hint}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}
