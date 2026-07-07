export type UserRole = 'admin' | 'customer';

export type User = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  password: string | null;
  image_url: string | null;
  google_subject_id: string | null;
  role: UserRole;
  customer_id: string | null;
  is_active: boolean;
  must_change_password: boolean;
  deleted_at: string | null;
};

/** Safe shape for admin list/detail views — never includes password hash. */
export type UserListItem = Omit<User, 'password'>;

export type AdminUserTableRow = UserListItem & {
  hasPlatformAccess: boolean;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
};

export type SetInitialPasswordResult = {
  errors?: {
    newPassword?: string[];
    confirmPassword?: string[];
  };
  message?: string | null;
  success?: boolean;
};
