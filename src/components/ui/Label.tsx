import React from "react";

export function Label({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-xs text-neutral-400">{children}</div>;
}
