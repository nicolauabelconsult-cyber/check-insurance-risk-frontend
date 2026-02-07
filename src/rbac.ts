export type Role = "SUPER_ADMIN" | "ADMIN" | "CLIENT_ADMIN" | "CLIENT_ANALYST";

const ROLE_PERMS: Record<Role, Set<string>> = {
  SUPER_ADMIN: new Set([
    "entities:read", "entities:create",
    "users:read", "users:create", "users:update", "users:delete",
    "sources:read", "sources:upload", "sources:update", "sources:delete",
    "risk:read", "risk:create", "risk:pdf:download",
    "audit:read",
  ]),
  ADMIN: new Set([
    "entities:read",
    "users:read", "users:create", "users:update",
    "sources:read", "sources:upload", "sources:update", "sources:delete",
    "risk:read", "risk:create", "risk:pdf:download",
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

export function hasPerm(role: string | undefined, perm: string): boolean {
  if (!role) return false;
  const perms = ROLE_PERMS[role as Role];
  if (!perms) return false;
  if (perms.has(perm)) return true;

  // wildcard support: risk:* / sources:*
  const prefix = perm.split(":")[0] + ":*";
  return perms.has(prefix);
}
