export const FEATURE_KEYS = ['store'] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export const FEATURE_KEY_SET = new Set<string>(FEATURE_KEYS);

export function isFeatureKey(value: string): value is FeatureKey {
  return FEATURE_KEY_SET.has(value);
}

/** Public nav/footer hrefs gated by each feature. */
export const FEATURE_ROUTE_PREFIXES: Record<FeatureKey, string[]> = {
  store: ['/store'],
};

export function getFeatureKeyForHref(href: string): FeatureKey | null {
  for (const featureKey of FEATURE_KEYS) {
    const prefixes = FEATURE_ROUTE_PREFIXES[featureKey];
    if (
      prefixes.some(
        (prefix) => href === prefix || href.startsWith(`${prefix}/`)
      )
    ) {
      return featureKey;
    }
  }
  return null;
}

export function isHrefAllowedForFeatures(
  href: string,
  accessibleFeatures: ReadonlySet<FeatureKey> | readonly FeatureKey[]
): boolean {
  const featureKey = getFeatureKeyForHref(href);
  if (!featureKey) {
    return true;
  }

  const accessible =
    accessibleFeatures instanceof Set
      ? accessibleFeatures
      : new Set(accessibleFeatures);

  return accessible.has(featureKey);
}
