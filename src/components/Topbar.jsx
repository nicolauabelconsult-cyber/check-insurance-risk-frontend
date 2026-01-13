import React from "react";

export default function Topbar({ title, subtitle }) {
  return (
    <div className="border-b border-neutral-900 bg-neutral-950 px-6 py-4">
      <div className="text-sm font-semibold">{title}</div>
      {subtitle ? <div className="mt-1 text-xs text-neutral-500">{subtitle}</div> : null}
    </div>
  );
}
