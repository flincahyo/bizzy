import { createClient } from "@/lib/supabase/server";

export async function getTenantProfileBySlug(slug: string) {
  const supabase = await createClient();
  
  // Get org details
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("*")
    .eq("subdomain_slug", slug)
    .single();

  if (orgError || !org) return null;

  // Get current session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { org, profile: null, isMember: false };

  // Check if user is a member of this specific organization
  const { data: membership } = await supabase
    .from("memberships")
    .select("id")
    .eq("organization_id", org.id)
    .eq("profile_id", user.id)
    .eq("is_active", true)
    .single();

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { org, profile, isMember: !!membership };
}

export async function getTenantDashboardStats(orgId: string) {
  const supabase = await createClient();
  
  // Parallel fetch: Total Revenue, Total Products, Total Staff
  const [trans, prods, staff] = await Promise.all([
    supabase.from("transactions").select("total_amount").eq("organization_id", orgId).eq("status", "completed"),
    supabase.from("products").select("id", { count: "exact" }).eq("organization_id", orgId),
    supabase.from("staff_accounts").select("id", { count: "exact" }).eq("organization_id", orgId)
  ]);

  const totalRevenue = trans.data?.reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0) || 0;
  
  return {
    totalRevenue,
    totalProducts: prods.count || 0,
    totalStaff: staff.count || 0,
    salesThisMonth: trans.data?.length || 0 // simplification
  };
}
