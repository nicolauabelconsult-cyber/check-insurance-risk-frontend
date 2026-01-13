import React from "react";

const tones = {
  neutral: "bg-neutral-900 text-neutral-200 border-neutral-800",
  green: "bg-emerald-950 text-emerald-200 border-emerald-900",
  yellow: "bg-yellow-950 text-yellow-200 border-yellow-900",
  red: "bg-red-950 text-red-200 border-red-900",
};

export default function Badge({ tone="neutral", children, className="" }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${tones[tone] || tones.neutral} ${className}`}>
      {children}
    </span>
  );
}
