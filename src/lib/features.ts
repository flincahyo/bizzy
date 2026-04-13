export type PosTier = "starter" | "growth" | "pro";
export type InventoryTier = "starter" | "growth" | "pro";

export interface PosTierLimits {
  tier: PosTier;
  maxTransactionsPerMonth: number;
  maxUsers: number;
  maxBranches: number;
  features: string[];
}

export interface InventoryTierLimits {
  tier: InventoryTier;
  maxProducts: number;
  maxUsers: number;
  maxWarehouses: number;
  features: string[];
}

export const POS_TIERS: Record<PosTier, PosTierLimits> = {
  starter: {
    tier: "starter",
    maxTransactionsPerMonth: 100,
    maxUsers: 1,
    maxBranches: 1,
    features: ["qr_payment", "daily_reports"],
  },
  growth: {
    tier: "growth",
    maxTransactionsPerMonth: Infinity,
    maxUsers: 3,
    maxBranches: 1,
    features: ["qr_payment", "daily_reports", "split_bill", "crm_basic", "monthly_reports"],
  },
  pro: {
    tier: "pro",
    maxTransactionsPerMonth: Infinity,
    maxUsers: 10,
    maxBranches: 2,
    features: ["qr_payment", "daily_reports", "split_bill", "crm_basic", "monthly_reports", "loyalty", "api_access"],
  },
};

export const INVENTORY_TIERS: Record<InventoryTier, InventoryTierLimits> = {
  starter: {
    tier: "starter",
    maxProducts: 50,
    maxUsers: 1, // Will share the org owner + users assigned to warehouse role
    maxWarehouses: 1,
    features: ["stock_tracking", "low_stock_notif"],
  },
  growth: {
    tier: "growth",
    maxProducts: Infinity,
    maxUsers: 3,
    maxWarehouses: 1,
    features: ["stock_tracking", "low_stock_notif", "purchase_orders", "barcode", "audit_trail"],
  },
  pro: {
    tier: "pro",
    maxProducts: Infinity,
    maxUsers: 10,
    maxWarehouses: 2,
    features: ["stock_tracking", "low_stock_notif", "purchase_orders", "barcode", "audit_trail", "batch_expiry", "fifo_valuation"],
  },
};

export interface AppsSubscription {
  pos: {
    tier: PosTier;
    expires_at: string | null;
    addons: {
      extra_users?: number;
      extra_branches?: number;
    };
  };
  inventory: {
    tier: InventoryTier;
    expires_at: string | null;
    addons: {
      extra_users?: number;
      extra_warehouses?: number;
    };
  };
}

export const DEFAULT_SUBSCRIPTION: AppsSubscription = {
  pos: {
    tier: "starter",
    expires_at: null,
    addons: {}
  },
  inventory: {
    tier: "starter",
    expires_at: null,
    addons: {}
  }
};
