import React from "react";

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-neutral-900 bg-neutral-950/70 shadow-xl">{children}</div>;
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`border-b border-neutral-900 p-6 ${className}`}>{children}</div>;
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="p-6">{children}</div>;
}
