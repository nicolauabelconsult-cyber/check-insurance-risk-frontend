export type Role = "SUPER_ADMIN" | "ADMIN" | "CLIENT_ADMIN" | "CLIENT_ANALYST";

const ROLE_PERMS: Record<Role, Set<string>> = {
  SUPER_ADMIN: new Set([
    "dashboard:read",            // 👈 ADICIONAR AQUI

    "entities:read", "entities:create",
    "users:read", "users:create", "users:update", "users:delete",
    "sources:*",
    "risk:*",
    "audit:read",
  ]),
  ADMIN: new Set([
    "dashboard:read",            // 👈 ADICIONAR AQUI

    "entities:read",
    "users:read", "users:create", "users:update",
    "sources:*",
    "risk:*",
    "audit:read",
  ]),
  CLIENT_ADMIN: new Set([
    "risk:read", "risk:create", "risk:pdf:download",
    "sources:read",
    "audit:read",
    "users:read",
  ]),
  CLIENT_ANALYST: new Set([
    "risk:read", "risk:create", "risk:pdf:download",
    "sources:read",
    "audit:read",
  ]),
};
