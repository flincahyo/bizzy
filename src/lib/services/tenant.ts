import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const getTenantProfileBySlug = cache(async (slug: string) => {
  // Use admin client for org lookup so RLS doesn't block staff users
  // (staff are Supabase users but are NOT in the memberships table)
  const admin = createAdminClient();
  const { data: org, error: orgError } = await admin
    .from("organizations")
    .select("*")
    .eq("subdomain_slug", slug)
    .single();

  if (orgError || !org) return null;

  // Use user client for session-aware queries
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { org, profile: null, isMember: false };

  const isSuperadmin = user.user_metadata?.is_superadmin === true;
  if (isSuperadmin) {
    // Supermin can bypass everything. Give them full owner access
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    return { org, profile, isMember: true };
  }

  // Staff users (is_staff: true in metadata) are not in memberships — skip that check
  const isStaff = user.user_metadata?.is_staff === true;
  if (isStaff) {
    return { org, profile: null, isMember: false };
  }

  // Owner: check membership in this specific organization
  const { data: membership } = await supabase
    .from("memberships")
    .select("id")
    .eq("organization_id", org.id)
    .eq("profile_id", user.id)
    .eq("is_active", true)
    .single();

  // Get owner profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { org, profile, isMember: !!membership };
});

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
