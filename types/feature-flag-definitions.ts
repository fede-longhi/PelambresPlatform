export type FeatureFlag = {
  key: string;
  label: string;
  description: string | null;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FeatureFlagListItem = FeatureFlag & {
  allowlistCount: number;
};

export type FeatureFlagAllowlistUser = {
  userId: string;
  username: string;
  email: string;
  name: string;
  role: string;
  imageUrl: string | null;
};
