import React from "react";
import Button from "./Button";

export default function Modal({ title, open, onClose, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-900 p-4">
          <div className="text-sm font-semibold">{title}</div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div className="p-4">{children}</div>
        {footer ? <div className="border-t border-neutral-900 p-4">{footer}</div> : null}
      </div>
    </div>
  );
}
