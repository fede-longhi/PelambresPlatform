export type UserRole = 'admin' | 'customer';

export type User = {
  id: string;
  username: string;
  name: string;
  email: string;
  password: string | null;
  image_url: string | null;
  role: UserRole;
  is_active: boolean;
  must_change_password: boolean;
  deleted_at: string | null;
};

/** Safe shape for admin list/detail views — never includes password hash. */
export type UserListItem = Omit<User, 'password'>;

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
