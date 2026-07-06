const LOGGED_IN_PUBLIC_PREFIXES = [
  '/education',
  '/quote-request',
  '/tools',
  '/print-guide',
  '/course-slides',
] as const;

export function isLoggedInPublicRoute(pathname: string): boolean {
  if (pathname === '/') {
    return true;
  }

  return LOGGED_IN_PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function shouldRedirectLoggedInUserFromAuthEntry(pathname: string): boolean {
  if (pathname.startsWith('/login/forgot-password')) {
    return false;
  }

  if (pathname.startsWith('/login/reset-password')) {
    return false;
  }

  if (pathname.startsWith('/login/select-role')) {
    return false;
  }

  if (pathname === '/register' || pathname === '/register/') {
    return true;
  }

  if (pathname === '/login' || pathname === '/login/') {
    return true;
  }

  return false;
}

export function getPortalPathForRole(role: 'admin' | 'customer'): string {
  return role === 'customer' ? '/customer' : '/admin';
}
