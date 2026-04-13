"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createOrganization(orgName: string, slug: string) {
  // 1. Get the current authenticated user (via normal session-based server client)
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Anda perlu login sebelum membuat toko.");
  }

  // 2. Use the admin client (service role) to bypass RLS for org creation
  const admin = createAdminClient();

  // 3. Check slug is not taken
  const { data: existing } = await admin
    .from("organizations")
    .select("id")
    .eq("subdomain_slug", slug)
    .maybeSingle();

  if (existing) {
    throw new Error("Slug sudah digunakan oleh toko lain. Coba nama lain.");
  }

  // 4. Create the organization
  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({
      name: orgName,
      subdomain_slug: slug,
      subscription_tier: "basic",
      is_active: true,
    })
    .select()
    .single();

  if (orgError || !org) {
    throw new Error(orgError?.message ?? "Gagal membuat organisasi.");
  }

  // 5. Create owner membership
  const { error: memberError } = await admin
    .from("memberships")
    .insert({
      organization_id: org.id,
      profile_id: user.id,
      role: "owner",
      is_active: true,
    });

  if (memberError) {
    // Rollback: delete the organization if membership failed
    await admin.from("organizations").delete().eq("id", org.id);
    throw new Error("Gagal menambahkan membership: " + memberError.message);
  }

  return { slug: org.subdomain_slug };
}
