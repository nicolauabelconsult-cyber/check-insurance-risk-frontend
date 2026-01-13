import React from "react";

export function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs text-neutral-200">{children}</span>;
}
