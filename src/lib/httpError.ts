export function friendlyError(e: any): string {
  const msg =
    e?.response?.data?.detail ||
    e?.message ||
    "Unexpected error";
  return String(msg);
}
