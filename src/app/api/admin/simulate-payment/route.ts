import { NextRequest, NextResponse } from "next/server";
import { upgradeSubscription } from "@/lib/services/billing";

// Note: In production, this MUST be protected by an auth guard checking for super_admin
export async function POST(req: NextRequest) {
  try {
    const { orgId, tierId } = await req.json();

    if (!orgId || !tierId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const success = await upgradeSubscription(orgId, tierId);

    if (success) {
      return NextResponse.json({ status: "success", message: `Org ${orgId} upgraded to ${tierId}` });
    } else {
      return NextResponse.json({ error: "Failed to upgrade" }, { status: 500 });
    }
  } catch (error) {
    console.error("Simulation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
