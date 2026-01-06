export type Role = "ADMIN" | "ANALYST" | string;

export type UserMe = {
  id: number;
  username: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  is_active?: boolean;
};

export type UserRead = {
  id: number;
  username: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  is_active?: boolean;
  created_at?: string | null;
  last_login?: string | null;
};

export type UserCreate = {
  username: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  password: string;
};

export type UserUpdate = Partial<{
  username: string;
  name: string | null;
  email: string | null;
  role: Role;
  is_active: boolean;
}>;

export type InfoSourceRead = {
  id: number;
  name: string;
  description?: string | null;
  created_at?: string | null;
  row_count?: number | null;
};

export type DashboardStats = {
  total_clients?: number;
  total_analyses?: number;
  high_risk?: number;
  medium_risk?: number;
  low_risk?: number;
  critical_risk?: number;
};
