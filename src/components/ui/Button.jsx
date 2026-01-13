import React from "react";

const styles = {
  primary: "bg-white text-neutral-950 hover:bg-neutral-200",
  secondary: "bg-neutral-900 text-neutral-100 hover:bg-neutral-800 border border-neutral-800",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "bg-transparent text-neutral-200 hover:bg-neutral-900 border border-transparent",
};

export default function Button({ variant="primary", className="", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ${styles[variant] || styles.primary} ${className}`}
      {...props}
    />
  );
}
