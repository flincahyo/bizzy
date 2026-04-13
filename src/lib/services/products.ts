import { createClient } from "@/lib/supabase/server";

export async function getProducts(orgId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
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
  const supabase = await createClient();
  const { data } = await supabase.from("warehouses").select("*").eq("organization_id", orgId).order("is_default", { ascending: false });
  return data || [];
}

export async function getStaff(orgId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("staff_accounts").select("*").eq("organization_id", orgId).order("created_at", { ascending: false });
  return data || [];
}
