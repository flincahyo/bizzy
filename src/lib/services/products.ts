import { createAdminClient } from "@/lib/supabase/admin";

// All data reads use the admin client to bypass RLS.
// Access control is enforced at the proxy/layout level (authenticated Supabase session required).

export async function getProducts(orgId: string) {
  const admin = createAdminClient();
  
  const { data, error } = await admin
    .from("products")
    .select(`
      *,
      category:product_categories(name),
      inventory_levels(quantity, warehouse_id)
    `)
    .eq("organization_id", orgId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) console.error("Error fetching products:", error);
  return data || [];
}

export async function getWarehouses(orgId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("warehouses")
    .select("*")
    .eq("organization_id", orgId)
    .order("is_default", { ascending: false });
  return data || [];
}

export async function getStaff(orgId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("staff_accounts")
    .select("*")
    .eq("organization_id", orgId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  return data || [];
}
export async function getTransferOrders(orgId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("transfer_orders")
    .select(`
      *,
      requester:staff_accounts!requested_by(full_name),
      source:warehouses!source_warehouse_id(name),
      destination:warehouses!destination_warehouse_id(name),
      items:transfer_order_items(
        quantity_requested,
        quantity_fulfilled,
        product:products(name, sku)
      )
    `)
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getPendingTransferOrders(orgId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("transfer_orders")
    .select(`
      id, created_at, status, 
      source:warehouses!source_warehouse_id(name),
      destination:warehouses!destination_warehouse_id(name)
    `)
    .eq("organization_id", orgId)
    .in("status", ["pending", "processing"])
    .order("created_at", { ascending: false });
  return data || [];
}
