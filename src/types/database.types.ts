export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  referred_by: string | null;
  invite_code: string;
  pack_type: 'starter' | 'gold' | null;
  status: 'pending' | 'active' | 'rejected';
  current_level: number;
  created_at: string;
  whatsapp?: string;
};

export type Group = {
  id: string;
  owner_id: string;
  code: string;
  group_number: number;
  created_at: string;
  members?: number;
  verified_members?: number;
};

export type Invite = {
  id: string;
  group_id: string;
  inviter_id: string;
  referred_user_id: string | null;
  owner_confirmed: boolean;
  created_at: string;
};

export type UserWithGroupDetails = User & {
  groups: Group[];
  members: number;
  verified_members: number;
};

export type AdminDashboardStats = {
  totalUsers: number;
  pendingVerifications: number;
  activeUsers: number;
  totalGroups: number;
};