import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className = "", ...props }: Props) {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-white text-black hover:bg-neutral-200"
      : "bg-neutral-800 text-white hover:bg-neutral-700";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
