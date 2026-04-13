-- ============================================================
--  BIZZY SAAS - MASTER DATABASE SCHEMA
--  PostgreSQL / Supabase
--  All tables use Pooled Multi-Tenancy (organization_id RLS)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- 1. ORGANIZATIONS (The core tenant record)
-- ─────────────────────────────────────────────────────────────
CREATE TYPE subscription_tier AS ENUM ('basic', 'pro', 'enterprise');

CREATE TABLE public.organizations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                TEXT NOT NULL,
  subdomain_slug      TEXT NOT NULL UNIQUE,        -- used as the subdomain (e.g. "toko-abc")
  -- MODULAR SAAS TEIRING (App Specific)
  apps_subscription   JSONB DEFAULT '{"pos": {"tier": "starter", "expires_at": null, "addons": {}}, "inventory": {"tier": "starter", "expires_at": null, "addons": {}}}',
  
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  custom_entitlements JSONB DEFAULT '{}',           -- Backward compatible / org-wide Add-ons
  gateway_customer_id TEXT,                         -- Midtrans/Xendit customer reference
  logo_url            TEXT,
  address             TEXT,
  phone               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Index for slug lookup (used on every subdomain request)
CREATE UNIQUE INDEX idx_organizations_slug ON public.organizations(subdomain_slug);

-- ─────────────────────────────────────────────────────────────
-- 2. PROFILES (Linked 1-to-1 with Supabase auth.users)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT,
  avatar_url      TEXT,
  is_super_admin  BOOLEAN NOT NULL DEFAULT FALSE,    -- Bizzy platform admin
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on new auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- 3. MEMBERSHIPS (Who belongs to which organization, and their role)
-- ─────────────────────────────────────────────────────────────
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'staff', 'cashier', 'warehouse_staff');

CREATE TABLE public.memberships (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  profile_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role            member_role NOT NULL DEFAULT 'staff',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, profile_id)
);

CREATE INDEX idx_memberships_org_id ON public.memberships(organization_id);
CREATE INDEX idx_memberships_profile_id ON public.memberships(profile_id);

-- ─────────────────────────────────────────────────────────────
-- 4. STAFF ACCOUNTS (For username+PIN login - not Supabase Auth)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.staff_accounts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  username        TEXT NOT NULL,
  pin_hash        TEXT NOT NULL,                    -- bcrypt hashed PIN
  full_name       TEXT NOT NULL,
  role            member_role NOT NULL DEFAULT 'cashier',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, username)                 -- username unique per org
);

CREATE INDEX idx_staff_accounts_org_id ON public.staff_accounts(organization_id);

-- ─────────────────────────────────────────────────────────────
-- 5. WAREHOUSES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.warehouses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  address         TEXT,
  is_default      BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_warehouses_org_id ON public.warehouses(organization_id);

-- ─────────────────────────────────────────────────────────────
-- 6. PRODUCT CATEGORIES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.product_categories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_categories_org_id ON public.product_categories(organization_id);

-- ─────────────────────────────────────────────────────────────
-- 7. PRODUCTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  sku             TEXT,
  name            TEXT NOT NULL,
  description     TEXT,
  price           DECIMAL(15, 2) NOT NULL DEFAULT 0,
  cost_price      DECIMAL(15, 2) DEFAULT 0,
  image_url       TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_org_id ON public.products(organization_id);
CREATE INDEX idx_products_sku ON public.products(organization_id, sku);

-- ─────────────────────────────────────────────────────────────
-- 8. INVENTORY LEVELS (Stock per product per warehouse)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.inventory_levels (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_id    UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  quantity        INT NOT NULL DEFAULT 0,
  low_stock_alert INT DEFAULT 10,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, warehouse_id)
);

CREATE INDEX idx_inventory_org_id ON public.inventory_levels(organization_id);
CREATE INDEX idx_inventory_product_id ON public.inventory_levels(product_id);

-- ─────────────────────────────────────────────────────────────
-- 9. TRANSACTIONS (POS Sales & Stock Movements)
-- ─────────────────────────────────────────────────────────────
CREATE TYPE transaction_type AS ENUM ('sale', 'stock_in', 'stock_out', 'adjustment');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'cancelled', 'refunded');
CREATE TYPE payment_method AS ENUM ('cash', 'qris', 'transfer', 'credit_card', 'other');

CREATE TABLE public.transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  warehouse_id    UUID REFERENCES public.warehouses(id),
  staff_id        UUID REFERENCES public.staff_accounts(id),
  type            transaction_type NOT NULL DEFAULT 'sale',
  status          transaction_status NOT NULL DEFAULT 'completed',
  payment_method  payment_method,
  subtotal        DECIMAL(15, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15, 2) DEFAULT 0,
  tax_amount      DECIMAL(15, 2) DEFAULT 0,
  total_amount    DECIMAL(15, 2) NOT NULL DEFAULT 0,
  notes           TEXT,
  receipt_number  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_org_id ON public.transactions(organization_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(organization_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- 10. TRANSACTION ITEMS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.transaction_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id  UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES public.products(id),
  product_name    TEXT NOT NULL,                   -- snapshot at time of sale
  product_price   DECIMAL(15, 2) NOT NULL,          -- snapshot at time of sale
  quantity        INT NOT NULL,
  discount        DECIMAL(15, 2) DEFAULT 0,
  subtotal        DECIMAL(15, 2) NOT NULL
);

CREATE INDEX idx_transaction_items_transaction_id ON public.transaction_items(transaction_id);

-- ─────────────────────────────────────────────────────────────
-- 11. BILLING INVOICES (Payment Gateway Foundation)
-- ─────────────────────────────────────────────────────────────
CREATE TYPE invoice_status AS ENUM ('pending', 'paid', 'failed', 'expired');

CREATE TABLE public.billing_invoices (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id     UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  gateway_invoice_id  TEXT,                          -- Midtrans/Xendit order_id
  payment_url         TEXT,                          -- Snap redirect URL
  amount              DECIMAL(15, 2) NOT NULL,
  tier_purchased      subscription_tier NOT NULL,
  months_duration     INT NOT NULL DEFAULT 1,
  status              invoice_status NOT NULL DEFAULT 'pending',
  paid_at             TIMESTAMPTZ,
  expires_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_billing_invoices_org_id ON public.billing_invoices(organization_id);

-- ─────────────────────────────────────────────────────────────
-- 12. ROW-LEVEL SECURITY (RLS POLICIES)
-- ─────────────────────────────────────────────────────────────

-- Helper function: get the organization_id for the currently logged-in user
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS UUID AS $$
  SELECT organization_id
  FROM public.memberships
  WHERE profile_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.organizations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_accounts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_levels   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_invoices   ENABLE ROW LEVEL SECURITY;

-- ORGANIZATIONS
CREATE POLICY "Users can view their own organization"
  ON public.organizations FOR SELECT
  USING (id = public.get_my_org_id());

CREATE POLICY "Owners can update their organization"
  ON public.organizations FOR UPDATE
  USING (id = public.get_my_org_id());

-- PROFILES
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- MEMBERSHIPS
CREATE POLICY "Users can view memberships of their org"
  ON public.memberships FOR SELECT
  USING (organization_id = public.get_my_org_id());

-- STAFF ACCOUNTS
CREATE POLICY "Members can view staff in their org"
  ON public.staff_accounts FOR SELECT
  USING (organization_id = public.get_my_org_id());

CREATE POLICY "Members can manage staff in their org"
  ON public.staff_accounts FOR ALL
  USING (organization_id = public.get_my_org_id());

-- WAREHOUSES
CREATE POLICY "Members can view warehouses in their org"
  ON public.warehouses FOR SELECT
  USING (organization_id = public.get_my_org_id());

CREATE POLICY "Admins can manage warehouses in their org"
  ON public.warehouses FOR ALL
  USING (organization_id = public.get_my_org_id());

-- PRODUCT CATEGORIES
CREATE POLICY "Members can view product categories in their org"
  ON public.product_categories FOR SELECT
  USING (organization_id = public.get_my_org_id());

CREATE POLICY "Admins can manage product categories in their org"
  ON public.product_categories FOR ALL
  USING (organization_id = public.get_my_org_id());

-- PRODUCTS
CREATE POLICY "Members can view products in their org"
  ON public.products FOR SELECT
  USING (organization_id = public.get_my_org_id());

CREATE POLICY "Admins can manage products in their org"
  ON public.products FOR ALL
  USING (organization_id = public.get_my_org_id());

-- INVENTORY LEVELS
CREATE POLICY "Members can view inventory in their org"
  ON public.inventory_levels FOR SELECT
  USING (organization_id = public.get_my_org_id());

CREATE POLICY "Members can manage inventory in their org"
  ON public.inventory_levels FOR ALL
  USING (organization_id = public.get_my_org_id());

-- TRANSACTIONS
CREATE POLICY "Members can view transactions in their org"
  ON public.transactions FOR SELECT
  USING (organization_id = public.get_my_org_id());

CREATE POLICY "Members can create transactions in their org"
  ON public.transactions FOR INSERT
  WITH CHECK (organization_id = public.get_my_org_id());

-- TRANSACTION ITEMS (inherit from parent transaction)
CREATE POLICY "Members can view transaction items in their org"
  ON public.transaction_items FOR SELECT
  USING (
    transaction_id IN (
      SELECT id FROM public.transactions
      WHERE organization_id = public.get_my_org_id()
    )
  );

CREATE POLICY "Members can create transaction items in their org"
  ON public.transaction_items FOR INSERT
  WITH CHECK (
    transaction_id IN (
      SELECT id FROM public.transactions
      WHERE organization_id = public.get_my_org_id()
    )
  );

-- BILLING INVOICES
CREATE POLICY "Members can view their billing invoices"
  ON public.billing_invoices FOR SELECT
  USING (organization_id = public.get_my_org_id());
