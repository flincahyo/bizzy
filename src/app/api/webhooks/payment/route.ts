import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

/**
 * Midtrans / Xendit Payment Webhook
 * 
 * Order ID format we use: BIZZY-{org_id}-{tier}-{timestamp}
 * Example: BIZZY-550e8400-e29b-pro-1712345678
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, status_code, gross_amount, signature_key, transaction_status } = body;

    // ── Signature Validation (Midtrans standard) ──────────────────────────────
    // Uncomment once MIDTRANS_SERVER_KEY is set in .env.local
    const serverKey = process.env.MIDTRANS_SERVER_KEY ?? "";
    if (serverKey) {
      const hashData = `${order_id}${status_code}${gross_amount}${serverKey}`;
      const expectedHash = crypto.createHash("sha512").update(hashData).digest("hex");
      if (expectedHash !== signature_key) {
        console.warn("[Webhook] Invalid signature — rejected.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }

    console.log(`[Midtrans Webhook] orderId: ${order_id}, status: ${transaction_status}`);

    // ── On Successful Payment ─────────────────────────────────────────────────
    if (transaction_status === "capture" || transaction_status === "settlement") {
      // Parse order_id format: BIZZY-{orgId}-{tier}-{timestamp}
      const parts = (order_id as string).split("-");
      if (parts[0] !== "BIZZY" || parts.length < 4) {
        return NextResponse.json({ error: "Invalid order_id format" }, { status: 400 });
      }

      // Reconstruct UUID: parts 1-5 form the UUID (550e8400-e29b-41d4-a716-446655440000)
      const orgId = parts.slice(1, 6).join("-");
      const tier = parts[6] as "basic" | "pro" | "enterprise";

      // Extend subscription by 30 days from now (or from current expiry if not yet expired)
      const supabase = await createClient();

      const { data: org } = await supabase
        .from("organizations")
        .select("tier_expires_at")
        .eq("id", orgId)
        .single();

      const currentExpiry = org?.tier_expires_at ? new Date(org.tier_expires_at) : new Date();
      const isExpired = currentExpiry < new Date();
      const baseDate = isExpired ? new Date() : currentExpiry;
      const newExpiry = new Date(baseDate);
      newExpiry.setDate(newExpiry.getDate() + 30);

      const { error: updateError } = await supabase
        .from("organizations")
        .update({
          subscription_tier: tier,
          tier_expires_at: newExpiry.toISOString(),
        })
        .eq("id", orgId);

      if (updateError) {
        console.error("[Webhook] DB update failed:", updateError.message);
        return NextResponse.json({ error: "DB update error" }, { status: 500 });
      }

      // Record in billing_invoices
      await supabase.from("billing_invoices").insert({
        organization_id: orgId,
        gateway_invoice_id: order_id,
        amount: parseFloat(gross_amount ?? "0"),
        status: "paid",
      });

      console.log(`✅ Subscription upgraded: org=${orgId}, tier=${tier}, expires=${newExpiry.toISOString()}`);

    } else if (["deny", "cancel", "expire", "failure"].includes(transaction_status)) {
      // Mark invoice as failed if exists
      const supabase = await createClient();
      await supabase
        .from("billing_invoices")
        .update({ status: "failed" })
        .eq("gateway_invoice_id", order_id);

      console.log(`❌ Subscription payment failed: ${order_id}`);
    }

    // Midtrans requires returning 200 OK immediately
    return NextResponse.json({ status: "success" });

  } catch (error) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
