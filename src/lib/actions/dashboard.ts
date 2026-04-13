"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { INVENTORY_TIERS, POS_TIERS, AppsSubscription, DEFAULT_SUBSCRIPTION } from "@/lib/features";
import bcrypt from "bcryptjs";
import { createStaffSession, setStaffSessionCookie, clearStaffSession, StaffRole, STAFF_DEFAULT_REDIRECT } from "@/lib/staff-session";

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const orgId = formData.get("orgId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const sku = formData.get("sku") as string;
  const price = parseFloat(formData.get("price") as string);
  const costPrice = parseFloat(formData.get("cost_price") as string) || 0;
  const categoryName = formData.get("category") as string;
  const warehouseId = formData.get("warehouse_id") as string;
  const initialStock = parseInt(formData.get("initial_stock") as string) || 0;
  let imageUrl = formData.get("image_url") as string | null;
  const imageFile = formData.get("image_file") as File | null;

  // Check Subscription Limit
  const { data: org } = await supabase.from("organizations").select("apps_subscription").eq("id", orgId).single();
  const sub: AppsSubscription = org?.apps_subscription || DEFAULT_SUBSCRIPTION;
  const inventoryConfig = INVENTORY_TIERS[sub.inventory.tier] || INVENTORY_TIERS.starter;
  
  if (inventoryConfig.maxProducts !== Infinity) {
    const { count } = await supabase.from("products").select("id", { count: "exact" }).eq("organization_id", orgId);
    if ((count || 0) >= inventoryConfig.maxProducts) {
      throw new Error(`Batas Tercapai: Paket Inventory ${sub.inventory.tier} maksimal ${inventoryConfig.maxProducts} Produk. Silahkan Upgrade.`);
    }
  }

  // Handle file upload if provided
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${orgId}/${uuidv4()}.${fileExt}`;
    
    // We use admin client to bypass any storage RLS for simplicity, assuming users are authorized via Server Action logic
    const adminClient = createAdminClient();
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('products')
      .upload(fileName, imageFile, { upsert: true });
      
    if (!uploadError && uploadData) {
      const { data: { publicUrl } } = adminClient.storage.from('products').getPublicUrl(uploadData.path);
      imageUrl = publicUrl;
    } else {
      console.error("Upload error:", uploadError);
    }
  }

  // Fetch or create category
  let categoryId: string | null = null;
  if (categoryName) {
    const { data: existingCat } = await supabase
      .from("product_categories")
      .select("id")
      .eq("organization_id", orgId)
      .ilike("name", categoryName)
      .maybeSingle();

    if (existingCat) {
      categoryId = existingCat.id;
    } else {
      const { data: newCat } = await supabase
        .from("product_categories")
        .insert({ name: categoryName, organization_id: orgId })
        .select("id")
        .single();
      categoryId = newCat?.id ?? null;
    }
  }

  // Create product
  const { data: product, error } = await supabase
    .from("products")
    .insert({ 
      organization_id: orgId, name, description, sku, price, 
      cost_price: costPrice, category_id: categoryId, image_url: imageUrl, is_active: true 
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Set initial inventory if warehouse provided
  if (warehouseId && product) {
    await supabase.from("inventory_levels").insert({
      organization_id: orgId,
      product_id: product.id,
      warehouse_id: warehouseId,
      quantity: initialStock,
      low_stock_alert: 10,
    });
  }

  revalidatePath(`/tenant/${(formData.get("slug") as string)}/products`);
  return { success: true };
}

export async function updateProduct(formData: FormData) {
  const supabase = await createClient();
  const orgId = formData.get("orgId") as string;
  const productId = formData.get("productId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const sku = formData.get("sku") as string;
  const price = parseFloat(formData.get("price") as string);
  const costPrice = parseFloat(formData.get("cost_price") as string) || 0;
  const categoryName = formData.get("category") as string;
  let imageUrl = formData.get("image_url") as string | null;
  const imageFile = formData.get("image_file") as File | null;

  // Handle file upload if provided
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${orgId}/${uuidv4()}.${fileExt}`;
    
    const adminClient = createAdminClient();
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('products')
      .upload(fileName, imageFile, { upsert: true });
      
    if (!uploadError && uploadData) {
      const { data: { publicUrl } } = adminClient.storage.from('products').getPublicUrl(uploadData.path);
      imageUrl = publicUrl;
    } else {
      console.error("Upload error:", uploadError);
    }
  }

  // Fetch or create category
  let categoryId: string | null = null;
  if (categoryName) {
    const { data: existingCat } = await supabase
      .from("product_categories")
      .select("id")
      .eq("organization_id", orgId)
      .ilike("name", categoryName)
      .maybeSingle();

    if (existingCat) {
      categoryId = existingCat.id;
    } else {
      const { data: newCat } = await supabase
        .from("product_categories")
        .insert({ name: categoryName, organization_id: orgId })
        .select("id")
        .single();
      categoryId = newCat?.id ?? null;
    }
  }

  // Update product
  const { error } = await supabase
    .from("products")
    .update({ 
      name, description, sku, price, cost_price: costPrice, 
      category_id: categoryId, image_url: imageUrl, updated_at: new Date().toISOString() 
    })
    .eq("id", productId);

  if (error) throw new Error(error.message);

  revalidatePath(`/tenant/${(formData.get("slug") as string)}/products`);
  return { success: true };
}

export async function deleteProduct(productId: string, slug: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ is_active: false }).eq("id", productId);
  if (error) throw new Error(error.message);
  revalidatePath(`/tenant/${slug}/products`);
}

// ─── WAREHOUSES ──────────────────────────────────────────────────────────────

export async function createWarehouse(formData: FormData) {
  const supabase = await createClient();
  const orgId = formData.get("orgId") as string;
  const slug = formData.get("slug") as string;
  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const isDefault = formData.get("is_default") === "true";

  // Check Subscription Limit
  const { data: org } = await supabase.from("organizations").select("apps_subscription").eq("id", orgId).single();
  const sub: AppsSubscription = org?.apps_subscription || DEFAULT_SUBSCRIPTION;
  const invConfig = INVENTORY_TIERS[sub.inventory.tier] || INVENTORY_TIERS.starter;

  if (invConfig.maxWarehouses !== Infinity) {
    const { count } = await supabase.from("warehouses").select("id", { count: "exact" }).eq("organization_id", orgId).eq("is_active", true);
    if ((count || 0) >= invConfig.maxWarehouses) {
      throw new Error(`Batas Tercapai: Paket Inventory ${sub.inventory.tier} maksimal ${invConfig.maxWarehouses} Gudang. Silahkan Upgrade.`);
    }
  }

  if (isDefault) {
    await supabase.from("warehouses").update({ is_default: false }).eq("organization_id", orgId);
  }

  const { error } = await supabase.from("warehouses").insert({ organization_id: orgId, name, address, is_default: isDefault });
  if (error) throw new Error(error.message);
  revalidatePath(`/tenant/${slug}/warehouses`);
}

export async function deleteWarehouse(warehouseId: string, slug: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("warehouses").update({ is_active: false }).eq("id", warehouseId);
  if (error) throw new Error(error.message);
  revalidatePath(`/tenant/${slug}/warehouses`);
}

// ─── STAFF ────────────────────────────────────────────────────────────────────

export async function createStaff(formData: FormData) {
  const admin = createAdminClient();
  const orgId = formData.get("orgId") as string;
  const slug = formData.get("slug") as string;
  const username = formData.get("username") as string;
  const fullName = formData.get("full_name") as string;
  const role = formData.get("role") as string;
  const pin = formData.get("pin") as string;

  // Check Subscription Limit based on role
  const { data: org } = await admin.from("organizations").select("apps_subscription").eq("id", orgId).single();
  const sub: AppsSubscription = org?.apps_subscription || DEFAULT_SUBSCRIPTION;
  
  if (role === "cashier") {
    const posConfig = POS_TIERS[sub.pos.tier] || POS_TIERS.starter;
    if (posConfig.maxUsers !== Infinity) {
      const { count } = await admin.from("staff_accounts").select("id", { count: "exact" }).eq("organization_id", orgId).eq("role", "cashier").eq("is_active", true);
      if ((count || 0) >= posConfig.maxUsers) {
        throw new Error(`Batas Tercapai: Paket POS ${sub.pos.tier} maksimal ${posConfig.maxUsers} Kasir.`);
      }
    }
  } else {
    // Admin or Warehouse Staff uses Inventory limit
    const invConfig = INVENTORY_TIERS[sub.inventory.tier] || INVENTORY_TIERS.starter;
    if (invConfig.maxUsers !== Infinity) {
      const { count } = await admin.from("staff_accounts").select("id", { count: "exact" }).eq("organization_id", orgId).in("role", ["admin", "warehouse_staff"]).eq("is_active", true);
      if ((count || 0) >= invConfig.maxUsers) {
        throw new Error(`Batas Tercapai: Paket Inventory ${sub.inventory.tier} maksimal ${invConfig.maxUsers} Staff Gudang/Admin.`);
      }
    }
  }

  // Hash PIN with bcrypt
  const pinHash = await bcrypt.hash(pin, 10);

  const { error } = await admin.from("staff_accounts").insert({
    organization_id: orgId,
    username,
    full_name: fullName,
    role,
    pin_hash: pinHash,
    is_active: true,
  });

  if (error) {
    if (error.code === "23505") throw new Error("Username sudah digunakan di toko ini.");
    throw new Error(error.message);
  }

  revalidatePath(`/tenant/${slug}/staff`);
}

export async function deleteStaff(staffId: string, slug: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("staff_accounts").update({ is_active: false, session_token: null, session_expires_at: null }).eq("id", staffId);
  if (error) throw new Error(error.message);
  revalidatePath(`/tenant/${slug}/staff`);
}

export async function updateStaffPin(staffId: string, newPin: string, slug: string) {
  const admin = createAdminClient();
  const pinHash = await bcrypt.hash(newPin, 10);
  // Revoke existing sessions on PIN change
  const { error } = await admin.from("staff_accounts")
    .update({ pin_hash: pinHash, session_token: null, session_expires_at: null })
    .eq("id", staffId);
  if (error) throw new Error(error.message);
  revalidatePath(`/tenant/${slug}/staff`);
}

// ─── STAFF LOGIN ───────────────────────────────────────────────────────────────

export async function staffLogin(formData: FormData): Promise<{ role: StaffRole; redirectTo: string }> {
  const admin = createAdminClient();
  const username = formData.get("username") as string;
  const pin = formData.get("pin") as string;
  const orgSlug = formData.get("orgSlug") as string;

  if (!username || !pin || !orgSlug) throw new Error("Data login tidak lengkap.");

  // Find org by slug
  const { data: org } = await admin.from("organizations").select("id, name").eq("subdomain_slug", orgSlug).single();
  if (!org) throw new Error("Toko tidak ditemukan.");

  // Find staff account
  const { data: staff } = await admin
    .from("staff_accounts")
    .select("id, pin_hash, role, full_name, is_active")
    .eq("organization_id", org.id)
    .eq("username", username)
    .eq("is_active", true)
    .single();

  if (!staff) throw new Error("Username atau PIN salah.");

  // Verify PIN
  const isValid = await bcrypt.compare(pin, staff.pin_hash);
  if (!isValid) throw new Error("Username atau PIN salah.");

  const role = staff.role as StaffRole;
  const payload = {
    staffId: staff.id,
    orgId: org.id,
    orgSlug,
    role,
    fullName: staff.full_name,
  };

  // Create session token in DB
  const token = await createStaffSession(payload);

  // Set cookie
  const isLocal = process.env.NODE_ENV === "development";
  await setStaffSessionCookie(token, payload, isLocal);

  const redirectTo = STAFF_DEFAULT_REDIRECT[role] || "/";
  return { role, redirectTo };
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

export async function updateOrgSettings(formData: FormData) {
  const supabase = await createClient();
  const orgId = formData.get("orgId") as string;
  const slug = formData.get("slug") as string;
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;

  const { error } = await supabase
    .from("organizations")
    .update({ name, phone, address, updated_at: new Date().toISOString() })
    .eq("id", orgId);

  if (error) throw new Error(error.message);
  revalidatePath(`/tenant/${slug}/settings`);
}

export async function deleteAccount() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Akses ditolak. Silahkan login kembali.");

  // Get all organizations owned by this user
  const { data: memberships } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("profile_id", user.id)
    .eq("role", "owner");

  const orgIds = memberships?.map(m => m.organization_id) || [];

  if (orgIds.length > 0) {
    // 1. Delete transactions explicitly first. This cascades to transaction_items.
    // By removing transaction_items first, products can be deleted safely without foreign key violations.
    await adminClient.from("transactions").delete().in("organization_id", orgIds);
    
    // 2. Delete inventory explicitly
    await adminClient.from("inventory_levels").delete().in("organization_id", orgIds);
    
    // 3. Delete products explicitly
    await adminClient.from("products").delete().in("organization_id", orgIds);

    // 4. Finally, delete organizations
    const { error: orgError } = await adminClient
      .from("organizations")
      .delete()
      .in("id", orgIds);
    if (orgError) throw new Error("Gagal menghapus data organisasi: " + orgError.message);
  }

  // Delete the user from Supabase Auth. This will cascade delete their profile and memberships.
  const { error: authError } = await adminClient.auth.admin.deleteUser(user.id);
  if (authError) throw new Error("Gagal menghapus akun: " + authError.message);

  return { success: true };
}
