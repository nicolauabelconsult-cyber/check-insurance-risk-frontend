import React from "react";
import { cn } from "../../lib/cn";
type Tone = "neutral" | "good" | "warn" | "bad";
export function Badge({ tone="neutral", className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  const t =
    tone === "good" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200" :
    tone === "warn" ? "border-amber-500/20 bg-amber-500/10 text-amber-200" :
    tone === "bad" ? "border-red-500/20 bg-red-500/10 text-red-200" :
    "border-white/10 bg-white/5 text-neutral-200";
  return <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs", t, className)} {...props} />;
}
