export type TAdminUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar: string | null;
  roleId?: string;
  userRole?: {
    id: string;
    roleId: string;
    role?: {
      role_name: string;
      id: string;
    }
  }
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
