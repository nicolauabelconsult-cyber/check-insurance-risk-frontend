export const mockLogin = async () => ({
  user: {
    id: "1",
    name: "Nicolau Abel",
    email: "nicolau@checkinsurancerisk.com",
    role: "SUPER_ADMIN",
    permissions: [
      "risk:read","risk:create","risk:pdf:download",
      "sources:read","sources:upload",
      "users:read","users:create","users:update",
      "audit:read"
    ]
  }
});
