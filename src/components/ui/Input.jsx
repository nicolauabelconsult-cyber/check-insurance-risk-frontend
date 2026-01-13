import React from "react";

export default function Input({ className="", ...props }) {
  return (
    <input
      className={`w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-700 ${className}`}
      {...props}
    />
  );
}
