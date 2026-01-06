export function friendlyError(e: any): string {
  const detail = e?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return "Validation error. Please review fields.";
  const status = e?.response?.status;
  if (status === 401) return "Session expired or invalid credentials.";
  if (status === 403) return "You do not have permission to perform this action.";
  if (status === 404) return "Resource not found.";
  return "Unexpected error. Please try again.";
}
