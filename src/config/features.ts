/**
 * Bizzy Feature Matrix
 * Single Source of Truth for tier-based feature entitlements.
 * To add a new feature: add to FeatureKey, then update each tier's config.
 */

export type SubscriptionTier = "basic" | "pro" | "enterprise";

export type FeatureKey =
  | "pos"
  | "warehouse_single"
  | "warehouse_multi"
  | "staff_management"
  | "analytics_basic"
  | "analytics_advanced"
  | "api_access"
  | "custom_domain"
  | "priority_support";

export interface TierLimits {
  max_warehouses: number;
  max_staff: number; // -1 = unlimited
  max_products: number; // -1 = unlimited
  features: FeatureKey[];
}

export const TIER_CONFIG: Record<SubscriptionTier, TierLimits> = {
  basic: {
    max_warehouses: 1,
    max_staff: 3,
    max_products: 100,
    features: ["pos", "warehouse_single", "analytics_basic"],
  },
  pro: {
    max_warehouses: 5,
    max_staff: -1,
    max_products: -1,
    features: [
      "pos",
      "warehouse_single",
      "warehouse_multi",
      "staff_management",
      "analytics_basic",
      "analytics_advanced",
    ],
  },
  enterprise: {
    max_warehouses: -1,
    max_staff: -1,
    max_products: -1,
    features: [
      "pos",
      "warehouse_single",
      "warehouse_multi",
      "staff_management",
      "analytics_basic",
      "analytics_advanced",
      "api_access",
      "custom_domain",
      "priority_support",
    ],
  },
};

/**
 * Check if a tier has access to a specific feature.
 * Also merges in custom_entitlements from the organization (JSONB add-ons).
 */
export function hasFeature(
  tier: SubscriptionTier,
  feature: FeatureKey,
  customEntitlements?: Record<string, unknown>
): boolean {
  const tierFeatures = TIER_CONFIG[tier]?.features ?? [];
  if (tierFeatures.includes(feature)) return true;

  // Check custom add-on entitlements (e.g. { extra_features: ["api_access"] })
  const extraFeatures =
    (customEntitlements?.extra_features as FeatureKey[]) ?? [];
  return extraFeatures.includes(feature);
}

export function getTierLimits(
  tier: SubscriptionTier,
  customEntitlements?: Record<string, unknown>
): TierLimits {
  const base = TIER_CONFIG[tier];
  if (!customEntitlements) return base;

  return {
    ...base,
    max_warehouses:
      base.max_warehouses === -1
        ? -1
        : base.max_warehouses +
          ((customEntitlements.extra_warehouses as number) ?? 0),
    max_staff:
      base.max_staff === -1
        ? -1
        : base.max_staff + ((customEntitlements.extra_staff as number) ?? 0),
  };
}
