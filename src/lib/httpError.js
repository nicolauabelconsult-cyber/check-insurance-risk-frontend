export function friendlyError(err) {
  const msg = err?.response?.data?.detail || err?.response?.data?.message || err?.message;
  if (typeof msg === "string") return msg;
  return "Something went wrong";
}
