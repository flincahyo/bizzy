import { NextRequest, NextResponse } from "next/server";
// import crypto from "crypto";
// import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Standard Midtrans signature validation (commented out until keys are available)
    /*
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const { order_id, status_code, gross_amount, signature_key, transaction_status } = body;
    
    // Hash: SHA512(order_id + status_code + gross_amount + serverKey)
    const hashData = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const expectedHash = crypto.createHash('sha512').update(hashData).digest('hex');
    
    if (expectedHash !== signature_key) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }
    */

    const transactionStatus = body.transaction_status;
    const orderId = body.order_id;
    // Example orderId format: BIZZY-ORGID-TIER-TIMESTAMP
    
    console.log(`[Midtrans Webhook] orderId: ${orderId}, status: ${transactionStatus}`);

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      // 1. Parse orderId to extract Org ID and target Tier
      // 2. Update DB using Supabase Server Client
      // 3. Extend expires_at + 30 days
      console.log(`✅ Subscription paid: ${orderId}`);
    } else if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
      console.log(`❌ Subscription failed: ${orderId}`);
    }

    // Midtrans requires returning a 200 OK immediately
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
