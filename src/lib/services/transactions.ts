"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getRecentTransactions(orgId: string, limit = 10) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transactions")
    .select(`
      *,
      staff:staff_accounts(full_name)
    `)
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);
    
  return data || [];
}

export async function checkoutCart(
  orgId: string, 
  warehouseId: string | null, 
  paymentMethod: string, 
  items: any[], 
  subtotal: number, 
  taxAmount: number, 
  totalAmount: number
) {
  const supabase = await createClient();
  
  // 1. Create Transaction record
  const { data: trx, error: trxError } = await supabase
    .from("transactions")
    .insert({
      organization_id: orgId,
      warehouse_id: warehouseId,
      type: "sale",
      payment_method: paymentMethod as any,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      status: "completed"
    })
    .select()
    .single();

  if (trxError || !trx) throw trxError;

  // 2. Create Transaction Items
  const itemsToInsert = items.map(item => ({
    transaction_id: trx.id,
    product_id: item.id,
    product_name: item.name,
    product_price: item.price,
    quantity: item.quantity,
    subtotal: item.price * item.quantity
  }));

  const { error: itemsError } = await supabase.from("transaction_items").insert(itemsToInsert);
  if (itemsError) throw itemsError;

  // 3. Deduct inventory levels for each item (only if warehouseId is set)
  if (warehouseId) {
    for (const item of items) {
      // Fetch current stock level
      const { data: invLevel } = await supabase
        .from("inventory_levels")
        .select("id, quantity")
        .eq("product_id", item.id)
        .eq("warehouse_id", warehouseId)
        .maybeSingle();

      if (invLevel) {
        const newQty = Math.max(0, (invLevel.quantity ?? 0) - item.quantity);
        await supabase
          .from("inventory_levels")
          .update({ quantity: newQty, updated_at: new Date().toISOString() })
          .eq("id", invLevel.id);
      }
    }
  }
  
  revalidatePath("/", "layout");
  revalidatePath("/tenant/[slug]", "layout");
  return trx;
}

export async function getAllTransactions(orgId: string, limit = 50) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transactions")
    .select(`
      *,
      staff:staff_accounts(full_name),
      transaction_items(product_name, quantity, subtotal)
    `)
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);
    
  return data || [];
}

export async function getTransactionStats(orgId: string) {
  const supabase = await createClient();
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfToday = new Date(now.setHours(0, 0, 0, 0)).toISOString();

  const [monthlyData, todayData] = await Promise.all([
    supabase
      .from("transactions")
      .select("total_amount")
      .eq("organization_id", orgId)
      .eq("status", "completed")
      .gte("created_at", startOfMonth),
    supabase
      .from("transactions")
      .select("total_amount")
      .eq("organization_id", orgId)
      .eq("status", "completed")
      .gte("created_at", startOfToday),
  ]);

  const monthlyRevenue = (monthlyData.data ?? []).reduce((s, t) => s + (t.total_amount ?? 0), 0);
  const todayRevenue = (todayData.data ?? []).reduce((s, t) => s + (t.total_amount ?? 0), 0);
  const monthlyCount = monthlyData.data?.length ?? 0;
  const todayCount = todayData.data?.length ?? 0;

  return { monthlyRevenue, todayRevenue, monthlyCount, todayCount };
}
