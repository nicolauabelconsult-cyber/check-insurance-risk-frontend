import React from "react";

export function Card({ children, className="" }) {
  return <div className={`rounded-2xl border border-neutral-900 bg-neutral-950 shadow-sm ${className}`}>{children}</div>;
}
export function CardHeader({ children, className="" }) {
  return <div className={`p-5 border-b border-neutral-900 ${className}`}>{children}</div>;
}
export function CardBody({ children, className="" }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
