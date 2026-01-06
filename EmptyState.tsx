import React from "react";
import { Card } from "./Card";
import { Button } from "./Button";

export function EmptyState({ title, description, actionLabel, onAction }:
{ title: string; description?: string; actionLabel?: string; onAction?: () => void; }) {
  return (
    <Card className="p-8 text-center">
      <div className="text-base font-semibold text-neutral-100">{title}</div>
      {description && <div className="mt-2 text-sm text-neutral-400">{description}</div>}
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </Card>
  );
}
