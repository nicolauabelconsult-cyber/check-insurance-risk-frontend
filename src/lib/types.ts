export type Role = "SUPER_ADMIN" | "PLATFORM_ADMIN" | "CLIENT_ADMIN" | "CLIENT_ANALYST";

export interface User {
  id: number;
  username: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  entity_id?: number | null;
  is_active?: boolean;
}

export interface TokenOut {
  access_token: string;
  token_type?: string;
}

export interface Entity {
  id: number;
  name: string;
  created_at?: string;
}

export interface InfoSource {
  id: number;
  name: string;
  description?: string | null;
  row_count?: number | null;
  created_at?: string;
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Analysis {
  id: number;
  search_number?: string | number | null;
  entity_id?: number | null;
  subject_name: string;
  risk_score?: number | null;
  risk_level?: RiskLevel | null;
  pep?: boolean | null;
  created_at?: string;
}
