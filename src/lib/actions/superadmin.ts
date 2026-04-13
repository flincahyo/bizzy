"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { DEFAULT_SUBSCRIPTION } from "@/lib/features";

/** Verify the caller is actually a superadmin */
async function verifySuperadmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.is_superadmin !== true) {
    throw new Error("Unauthorized: Superadmin access required");
  }
}

export async function getSuperadminStats() {
  await verifySuperadmin();
  const adminClient = createAdminClient();
  
  // Get active tenants count
  const { count: tenantCount } = await adminClient
    .from("organizations")
    .select("id", { count: "exact" });
    
  // Get total MRR (rough estimate by counting how many are on Growth/Pro)
  // For actual GMV, we sum transaction total_amounts
  const { data: transactions } = await adminClient
    .from("transactions")
    .select("total_amount")
    .eq("status", "completed");
    
  const totalGmv = transactions?.reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0) || 0;
  
  // Total active staff/users
  const { count: staffCount } = await adminClient
    .from("profiles")
    .select("id", { count: "exact" });
    
  return {
    totalTenants: tenantCount || 0,
    totalGmv,
    totalUsers: staffCount || 0
  };
}

export async function getAllTenants() {
  await verifySuperadmin();
  const adminClient = createAdminClient();
  
  // We need organizations and their owners
  const { data: orgs } = await adminClient
    .from("organizations")
    .select(`
      id, name, subdomain_slug, apps_subscription, created_at,
      memberships!inner(profile_id, is_active)
    `)
    .order("created_at", { ascending: false });

  if (!orgs) return [];

  // Get owner profiles
  const profileIds = orgs.map(o => o.memberships?.[0]?.profile_id).filter(Boolean);
  
  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, full_name, email")
    .in("id", profileIds);
    
  const profileMap = new Map(profiles?.map(p => [p.id, p]));

  return orgs.map(org => {
    const ownerId = org.memberships?.[0]?.profile_id;
    const owner = profileMap.get(ownerId);
    
    return {
      id: org.id,
      name: org.name,
      subdomain_slug: org.subdomain_slug,
      apps_subscription: org.apps_subscription || DEFAULT_SUBSCRIPTION,
      created_at: org.created_at,
      owner_name: owner?.full_name || "Unknown",
      owner_email: owner?.email || "Unknown"
    };
  });
}

export async function updateTenantSubscription(orgId: string, posTier: string, inventoryTier: string) {
  await verifySuperadmin();
  const adminClient = createAdminClient();
  
  // Get current sub
  const { data: org } = await adminClient
    .from("organizations")
    .select("apps_subscription")
    .eq("id", orgId)
    .single();
    
  if (!org) throw new Error("Organization not found");
  
  const sub = org.apps_subscription || DEFAULT_SUBSCRIPTION;
  const targetSub = {
    ...sub,
    pos: {
      ...sub.pos,
      tier: posTier as any
    },
    inventory: {
      ...sub.inventory,
      tier: inventoryTier as any
    }
  };
  
  const { error } = await adminClient
    .from("organizations")
    .update({ apps_subscription: targetSub })
    .eq("id", orgId);
    
  if (error) throw new Error(error.message);
  
  revalidatePath("/admin/customers");
  return { success: true };
}
