import React from "react";
import { cn } from "../../lib/cn";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 text-sm text-neutral-100 shadow-hairline",
        "focus:border-white/20",
        className
      )}
      {...props}
    />
  );
}
