import { createClient } from "@/lib/supabase/server";

export async function createMidtransTransactionProps(
  orgId: string, 
  tierId: "basic" | "pro" | "enterprise", 
  amount: number,
  customerName: string,
  customerEmail: string
) {
  const timestamp = new Date().getTime();
  const orderId = `BIZZY-${orgId}-${tierId}-${timestamp}`;

  // In a real app, you would make an API call to Midtrans Snap API here
  // using process.env.MIDTRANS_SERVER_KEY to get a transaction_token
  
  // Fake token for MVP
  const mockToken = `mock-token-${timestamp}`;

  return {
    orderId,
    token: mockToken,
    amount
  };
}

export async function upgradeSubscription(orgId: string, tierId: "basic" | "pro" | "enterprise") {
  const supabase = await createClient();

  // Extend expiration by 30 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const { error } = await supabase
    .from("organizations")
    .update({ 
      tier: tierId,
      expires_at: expiresAt.toISOString()
    })
    .eq("id", orgId);

  if (error) {
    console.error("Failed to upgrade subscription:", error);
    return false;
  }
  
  return true;
}
