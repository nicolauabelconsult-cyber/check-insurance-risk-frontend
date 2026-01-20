export function friendlyError(e: any): string {
  const msg = e?.details?.detail || e?.details?.message || e?.message || "Unexpected error";
  return String(msg);
}
