"use client";

import { ZONES, zoneFor } from "@/lib/pain";

type Props = {
  score: number | null;
  size?: number;
};

const NEUTRAL_HEX = "#8da0b5";
const NEUTRAL_MOUTH = "M30 64 Q48 64 66 64";

export function PainFace({ score, size = 84 }: Props) {
  const color = score === null ? NEUTRAL_HEX : zoneFor(score).hex;
  const mouth = score === null ? NEUTRAL_MOUTH : zoneFor(score).mouth;

  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        cx="48"
        cy="48"
        r="44"
        fill={`${color}1a`}
        stroke={color}
        strokeWidth="3"
      />
      <circle cx="34" cy="40" r="4.5" fill={color} />
      <circle cx="62" cy="40" r="4.5" fill={color} />
      <path
        d={mouth}
        stroke={color}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

// preload all zones (so we ensure Tailwind picks up any classnames if used)
export const _zoneSnapshot = ZONES;
