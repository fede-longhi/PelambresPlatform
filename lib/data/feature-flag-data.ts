import sql from '@/lib/db';
import {
  FEATURE_KEYS,
  isFeatureKey,
  type FeatureKey,
} from '@/lib/consts/feature-flag-consts';
import type {
  FeatureFlag,
  FeatureFlagAllowlistUser,
  FeatureFlagListItem,
} from '@/types/feature-flag-definitions';

const FEATURE_FLAG_COLUMNS = sql`
  key,
  label,
  description,
  is_enabled as "isEnabled",
  created_at as "createdAt",
  updated_at as "updatedAt"
`;

export async function fetchFeatureFlags(): Promise<FeatureFlagListItem[]> {
  try {
    const rows = await sql<FeatureFlagListItem[]>`
      SELECT
        ${FEATURE_FLAG_COLUMNS},
        (
          SELECT COUNT(*)::int
          FROM feature_flag_users ffu
          WHERE ffu.feature_key = feature_flags.key
        ) as "allowlistCount"
      FROM feature_flags
      ORDER BY label ASC
    `;
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch feature flags.');
  }
}

export async function fetchFeatureFlagByKey(
  key: string
): Promise<FeatureFlag | undefined> {
  try {
    const rows = await sql<FeatureFlag[]>`
      SELECT ${FEATURE_FLAG_COLUMNS}
      FROM feature_flags
      WHERE key = ${key}
      LIMIT 1
    `;
    return rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch feature flag.');
  }
}

export async function fetchFeatureFlagAllowlist(
  featureKey: string
): Promise<FeatureFlagAllowlistUser[]> {
  try {
    return await sql<FeatureFlagAllowlistUser[]>`
      SELECT
        u.id as "userId",
        u.username,
        u.email,
        u.name,
        u.role,
        u.image_url as "imageUrl"
      FROM feature_flag_users ffu
      INNER JOIN users u ON u.id = ffu.user_id
      WHERE ffu.feature_key = ${featureKey}
        AND u.deleted_at IS NULL
      ORDER BY u.name ASC, u.email ASC
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch feature allowlist.');
  }
}

export async function isUserOnFeatureAllowlist(
  featureKey: FeatureKey,
  userId: string
): Promise<boolean> {
  try {
    const rows = await sql<{ exists: boolean }[]>`
      SELECT EXISTS(
        SELECT 1
        FROM feature_flag_users
        WHERE feature_key = ${featureKey}
          AND user_id = ${userId}
      ) as exists
    `;
    return rows[0]?.exists ?? false;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to check feature allowlist.');
  }
}

/**
 * Returns whether a caller may see a public feature.
 * - Globally enabled → everyone
 * - Otherwise → allowlisted users only
 * - Admins always (preview / ops)
 */
export async function canAccessFeature(
  featureKey: FeatureKey,
  options: {
    userId?: string | null;
    isAdmin?: boolean;
  } = {}
): Promise<boolean> {
  if (options.isAdmin) {
    return true;
  }

  const flag = await fetchFeatureFlagByKey(featureKey);
  if (!flag) {
    return false;
  }

  if (flag.isEnabled) {
    return true;
  }

  if (!options.userId) {
    return false;
  }

  return isUserOnFeatureAllowlist(featureKey, options.userId);
}

export async function fetchAccessibleFeatureKeys(options: {
  userId?: string | null;
  isAdmin?: boolean;
}): Promise<FeatureKey[]> {
  if (options.isAdmin) {
    return [...FEATURE_KEYS];
  }

  try {
    const featureKeys = [...FEATURE_KEYS];

    if (!options.userId) {
      const flags = await sql<{ key: string }[]>`
        SELECT key
        FROM feature_flags
        WHERE key = ANY(${featureKeys})
          AND is_enabled = true
      `;
      return flags.map((row) => row.key).filter(isFeatureKey);
    }

    const userId = options.userId;
    const flags = await sql<{ key: string }[]>`
      SELECT ff.key
      FROM feature_flags ff
      WHERE ff.key = ANY(${featureKeys})
        AND (
          ff.is_enabled = true
          OR EXISTS (
            SELECT 1
            FROM feature_flag_users ffu
            WHERE ffu.feature_key = ff.key
              AND ffu.user_id = ${userId}
          )
        )
    `;

    return flags.map((row) => row.key).filter(isFeatureKey);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to resolve accessible features.');
  }
}
