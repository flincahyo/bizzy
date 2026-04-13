"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { INVENTORY_TIERS, POS_TIERS, AppsSubscription, DEFAULT_SUBSCRIPTION } from "@/lib/features";

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
  const productType = formData.get("product_type") as string || "finished_good";
  const canBeSold = formData.get("can_be_sold") !== "false";

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
      cost_price: costPrice, category_id: categoryId, image_url: imageUrl, is_active: true,
      product_type: productType, can_be_sold: canBeSold
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

  // Create Supabase auth user for staff
  // Email is synthetic: username.orgSlug@staff.bizzy.sbs (never used for real email)
  const { data: orgData } = await admin
    .from("organizations")
    .select("subdomain_slug")
    .eq("id", orgId)
    .single();

  const orgSlug = orgData?.subdomain_slug || orgId;
  const syntheticEmail = `${username}.${orgSlug}@staff.bizzy.sbs`;

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: syntheticEmail,
    password: pin,
    email_confirm: true, // Skip email verification
    user_metadata: {
      is_staff: true,
      role,
      org_slug: orgSlug,
      org_id: orgId,
      full_name: fullName,
      username,
    },
  });

  if (authError) {
    if (authError.message.includes("already registered")) {
      throw new Error("Username sudah digunakan di toko ini.");
    }
    throw new Error(authError.message);
  }

  const { error } = await admin.from("staff_accounts").insert({
    organization_id: orgId,
    username,
    full_name: fullName,
    role,
    supabase_user_id: authData.user.id,
    is_active: true,
  });

  if (error) {
    // Rollback: remove the auth user if DB insert fails
    await admin.auth.admin.deleteUser(authData.user.id);
    if (error.code === "23505") throw new Error("Username sudah digunakan di toko ini.");
    throw new Error(error.message);
  }

  revalidatePath(`/tenant/${slug}/staff`);
}

export async function deleteStaff(staffId: string, slug: string) {
  const admin = createAdminClient();

  // Get supabase_user_id before deleting
  const { data: staff } = await admin
    .from("staff_accounts")
    .select("supabase_user_id")
    .eq("id", staffId)
    .single();

  const { error } = await admin.from("staff_accounts").delete().eq("id", staffId);
  if (error) throw new Error(error.message);

  // Delete Supabase auth user (if exists)
  if (staff?.supabase_user_id) {
    await admin.auth.admin.deleteUser(staff.supabase_user_id);
  }

  revalidatePath(`/tenant/${slug}/staff`);
}

export async function updateStaffPin(staffId: string, newPin: string, slug: string) {
  const admin = createAdminClient();

  const { data: staff } = await admin
    .from("staff_accounts")
    .select("supabase_user_id")
    .eq("id", staffId)
    .single();

  if (staff?.supabase_user_id) {
    const { error } = await admin.auth.admin.updateUserById(staff.supabase_user_id, {
      password: newPin,
    });
    if (error) throw new Error("Gagal mengubah PIN: " + error.message);
  }

  revalidatePath(`/tenant/${slug}/staff`);
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
    // 0. Delete all staff Supabase auth users for these orgs
    // (staff are real Supabase users with synthetic emails — must be cleaned up)
    const { data: staffAccounts } = await adminClient
      .from("staff_accounts")
      .select("supabase_user_id")
      .in("organization_id", orgIds)
      .not("supabase_user_id", "is", null);

    if (staffAccounts && staffAccounts.length > 0) {
      await Promise.all(
        staffAccounts
          .filter((s) => s.supabase_user_id)
          .map((s) => adminClient.auth.admin.deleteUser(s.supabase_user_id!))
      );
    }

    // 1. Delete transactions explicitly first.
    await adminClient.from("transactions").delete().in("organization_id", orgIds);
    
    // 2. Delete inventory explicitly
    await adminClient.from("inventory_levels").delete().in("organization_id", orgIds);
    
    // 3. Delete products explicitly
    await adminClient.from("products").delete().in("organization_id", orgIds);

    // 4. Delete organizations (cascades to staff_accounts, memberships, etc.)
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

// ─── TRANSFER ORDERS (MUTASI STOK) ──────────────────────────────────────────

export async function createTransferOrder(formData: FormData) {
  const supabase = await createClient();
  const orgId = formData.get("orgId") as string;
  const slug = formData.get("slug") as string;
  const sourceId = formData.get("sourceId") as string;
  const destinationId = formData.get("destinationId") as string;
  const notes = formData.get("notes") as string;
  const itemsJson = formData.get("items") as string;
  const items = JSON.parse(itemsJson) as { productId: string; qty: number }[];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  // Get staff account ID mapping for this user
  const { data: staff } = await supabase.from("staff_accounts").select("id").eq("supabase_user_id", user.id).maybeSingle();

  const { data: order, error } = await supabase
    .from("transfer_orders")
    .insert({
      organization_id: orgId,
      source_warehouse_id: sourceId,
      destination_warehouse_id: destinationId,
      notes,
      requested_by: staff?.id || null, // Might be owner, so null is fine if no staff_id matches
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const orderItems = items.map(item => ({
    transfer_order_id: order.id,
    product_id: item.productId,
    quantity_requested: item.qty
  }));

  const { error: itemsError } = await supabase.from("transfer_order_items").insert(orderItems);
  if (itemsError) throw new Error(itemsError.message);

  revalidatePath(`/tenant/${slug}`, 'layout');
  return { success: true };
}

export async function updateTransferOrderStatus(orderId: string, orgId: string, newStatus: string, slug: string) {
  const adminClient = createAdminClient();
  
  // Get order details
  const { data: order } = await adminClient
    .from("transfer_orders")
    .select("*, items:transfer_order_items(*)")
    .eq("id", orderId)
    .single();

  if (!order) throw new Error("Order not found");

  // Update Status
  const { error } = await adminClient.from("transfer_orders").update({ status: newStatus }).eq("id", orderId);
  if (error) throw new Error(error.message);

  // Stock Movement Logic
  if (newStatus === "shipped") {
    // Deduct from Source Warehouse
    for (const item of order.items) {
       // We should upsert or decrement
       const { data: inv } = await adminClient.from("inventory_levels")
         .select("id, quantity")
         .eq("warehouse_id", order.source_warehouse_id)
         .eq("product_id", item.product_id)
         .maybeSingle();
       
       if (inv) {
         await adminClient.from("inventory_levels").update({ quantity: (inv.quantity || 0) - item.quantity_requested }).eq("id", inv.id);
       } else {
         // Create negative stock record (rare but possible if source didn't have it explicitly created)
         await adminClient.from("inventory_levels").insert({
           organization_id: orgId, warehouse_id: order.source_warehouse_id, product_id: item.product_id, quantity: -item.quantity_requested
         });
       }
    }
  } else if (newStatus === "completed") {
    // Add to Destination Warehouse
    for (const item of order.items) {
       const { data: inv } = await adminClient.from("inventory_levels")
         .select("id, quantity")
         .eq("warehouse_id", order.destination_warehouse_id)
         .eq("product_id", item.product_id)
         .maybeSingle();
       
       if (inv) {
         await adminClient.from("inventory_levels").update({ quantity: (inv.quantity || 0) + item.quantity_requested }).eq("id", inv.id);
       } else {
         await adminClient.from("inventory_levels").insert({
           organization_id: orgId, warehouse_id: order.destination_warehouse_id, product_id: item.product_id, quantity: item.quantity_requested
         });
       }
    }
  }

  revalidatePath(`/tenant/${slug}`, 'layout');
  return { success: true };
}
