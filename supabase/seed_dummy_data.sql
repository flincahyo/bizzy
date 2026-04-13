-- =========================================================
-- BIZZY SAAS - DUMMY DATA SEEDER
-- WARNING: Run this only once after you have successfully 
-- logged in via Google OAuth on localhost:3000/login
-- =========================================================

DO $$
DECLARE
  v_user_id UUID;
  v_org_id UUID;
  v_warehouse_1 UUID;
  v_warehouse_2 UUID;
  v_cat_drink UUID;
  v_cat_food UUID;
  v_prod_coffee UUID;
  v_prod_tea UUID;
  v_prod_croissant UUID;
  v_trans_id UUID;
BEGIN
  -- 1. Grab the first registered user from auth.users
  SELECT id INTO v_user_id FROM auth.users ORDER BY created_at DESC LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Tidak ada user ditemukan. Silakan login via Google terlebih dahulu di localhost:3000/login';
  END IF;

  -- 2. Create the Demo Organization (subdomain: 'demo')
  INSERT INTO public.organizations (name, subdomain_slug, subscription_tier)
  VALUES ('Toko Kopi Senja', 'demo', 'pro')
  RETURNING id INTO v_org_id;

  -- 3. Link the User as the Owner of this Organization
  INSERT INTO public.memberships (organization_id, profile_id, role)
  VALUES (v_org_id, v_user_id, 'owner');

  -- 4. Create Warehouses for this organization
  INSERT INTO public.warehouses (organization_id, name, is_default)
  VALUES (v_org_id, 'Gudang Utama (Pusat)', TRUE)
  RETURNING id INTO v_warehouse_1;

  INSERT INTO public.warehouses (organization_id, name, is_default)
  VALUES (v_org_id, 'Cabang Sudirman', FALSE)
  RETURNING id INTO v_warehouse_2;

  -- 5. Create Product Categories
  INSERT INTO public.product_categories (organization_id, name)
  VALUES (v_org_id, 'Minuman Dingin') RETURNING id INTO v_cat_drink;

  INSERT INTO public.product_categories (organization_id, name)
  VALUES (v_org_id, 'Pastry & Roti') RETURNING id INTO v_cat_food;

  -- 6. Create Dummy Products
  INSERT INTO public.products (organization_id, category_id, sku, name, description, price, cost_price)
  VALUES (v_org_id, v_cat_drink, 'IC-001', 'Iced Caramel Macchiato', 'Kopi susu dingin dengan caramel', 35000, 15000)
  RETURNING id INTO v_prod_coffee;

  INSERT INTO public.products (organization_id, category_id, sku, name, description, price, cost_price)
  VALUES (v_org_id, v_cat_drink, 'MT-002', 'Matcha Latte', 'Green tea latte dengan susu segar', 30000, 12000)
  RETURNING id INTO v_prod_tea;

  INSERT INTO public.products (organization_id, category_id, sku, name, description, price, cost_price)
  VALUES (v_org_id, v_cat_food, 'PS-001', 'Butter Croissant', 'Croissant renyah dengan mentega premium', 25000, 10000)
  RETURNING id INTO v_prod_croissant;

  -- 7. Add Inventory Levels for those products in Gudang Utama
  INSERT INTO public.inventory_levels (organization_id, product_id, warehouse_id, quantity)
  VALUES (v_org_id, v_prod_coffee, v_warehouse_1, 150);

  INSERT INTO public.inventory_levels (organization_id, product_id, warehouse_id, quantity)
  VALUES (v_org_id, v_prod_tea, v_warehouse_1, 80);

  INSERT INTO public.inventory_levels (organization_id, product_id, warehouse_id, quantity)
  VALUES (v_org_id, v_prod_croissant, v_warehouse_1, 45);

  -- 8. Create a Dummy Cashier Staff Account
  INSERT INTO public.staff_accounts (organization_id, username, pin_hash, full_name, role)
  -- '123456' hashed with bcrypt for dummy purposes
  VALUES (v_org_id, 'kasir1', '$2a$12$N9Zc3...dummy...', 'Budi Kasir', 'cashier');

  -- 9. Create a Sample Transaction
  INSERT INTO public.transactions (organization_id, warehouse_id, type, payment_method, subtotal, tax_amount, total_amount)
  VALUES (v_org_id, v_warehouse_1, 'sale', 'qris', 90000, 9900, 99900)
  RETURNING id INTO v_trans_id;

  -- 10. Add Items to the Sample Transaction
  INSERT INTO public.transaction_items (transaction_id, product_id, product_name, product_price, quantity, subtotal)
  VALUES (v_trans_id, v_prod_coffee, 'Iced Caramel Macchiato', 35000, 2, 70000);

  INSERT INTO public.transaction_items (transaction_id, product_id, product_name, product_price, quantity, subtotal)
  VALUES (v_trans_id, v_prod_croissant, 'Butter Croissant', 20000, 1, 20000);

END $$;
