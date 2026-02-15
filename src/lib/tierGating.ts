const TIER_LEVELS: Record<string, number> = {
  basic: 0,
  pro: 1,
  enterprise: 2,
};

export type SubscriptionTier = "basic" | "pro" | "enterprise";

export function hasTierAccess(
  userTier: SubscriptionTier | string,
  requiredTier: SubscriptionTier
): boolean {
  const userLevel = TIER_LEVELS[userTier] ?? 0;
  const requiredLevel = TIER_LEVELS[requiredTier] ?? 0;
  return userLevel >= requiredLevel;
}

export type FeatureKey =
  | "profile_preview"
  | "reviews"
  | "quotes"
  | "post_jobs"
  | "ad_booking"
  | "fb_post"
  | "analytics";

const FEATURE_TIER_MAP: Record<FeatureKey, SubscriptionTier> = {
  profile_preview: "basic",
  reviews: "basic",
  quotes: "basic",
  post_jobs: "pro",
  ad_booking: "pro",
  fb_post: "pro",
  analytics: "enterprise",
};

export function hasFeatureAccess(
  userTier: SubscriptionTier | string,
  feature: FeatureKey
): boolean {
  const requiredTier = FEATURE_TIER_MAP[feature];
  return hasTierAccess(userTier, requiredTier);
}

export function getRequiredTier(feature: FeatureKey): SubscriptionTier {
  return FEATURE_TIER_MAP[feature];
}
