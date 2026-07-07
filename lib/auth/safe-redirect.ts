export function resolveSafeRedirectPath(
  value: FormDataEntryValue | string | null | undefined,
  fallback = '/customer'
): string {
  const trimmed = String(value ?? '').trim();

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  return fallback;
}
