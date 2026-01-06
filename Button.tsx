import React from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = size === "sm" ? "h-9 px-3 text-sm" : "h-10 px-3.5 text-sm";
  const variants =
    variant === "primary"
      ? "bg-neutral-100 text-neutral-950 hover:bg-neutral-200"
      : variant === "danger"
      ? "bg-red-900 text-white hover:bg-red-800"
      : variant === "ghost"
      ? "bg-transparent text-neutral-200 hover:bg-white/5"
      : "bg-white/5 text-neutral-200 hover:bg-white/10";

  return <button className={cn(base, sizes, variants, className)} {...props} />;
}
