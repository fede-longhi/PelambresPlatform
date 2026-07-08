type PlatformAccessUser = {
  password?: string | null;
  google_subject_id?: string | null;
  is_active?: boolean;
};

export function userHasAuthCredentials(user: PlatformAccessUser): boolean {
  const hasPassword = Boolean(user.password && user.password.trim() !== '');
  const hasGoogle = Boolean(user.google_subject_id && user.google_subject_id.trim() !== '');

  return hasPassword || hasGoogle;
}

export function userCanAccessPlatform(user: PlatformAccessUser): boolean {
  if (user.is_active === false) {
    return false;
  }

  return userHasAuthCredentials(user);
}
