export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "manager" | "rep";
  is_active: boolean;
  created_at: string;
}

export interface Account {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  status: string;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AccountDetail extends Account {
  assignee: User | null;
  contacts: Contact[];
  recent_activities: Activity[];
  notes: Note[];
}

export interface Contact {
  id: string;
  account_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  is_primary: boolean;
  created_by: string;
  created_at: string;
}

export interface Activity {
  id: string;
  type: string;
  subject: string | null;
  description: string | null;
  account_id: string | null;
  contact_id: string | null;
  performed_by: string;
  performed_at: string;
  created_at: string;
}

export interface Note {
  id: string;
  body: string;
  account_id: string | null;
  contact_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  account_id: string | null;
  contact_id: string | null;
  assigned_to: string;
  suggestion_type: string;
  subject: string | null;
  body: string;
  status: string;
  source: string;
  created_at: string;
  reviewed_at: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface DashboardStats {
  total_accounts: number;
  accounts_by_status: Record<string, number>;
  activities_this_week: number;
  pending_follow_ups: number;
}
