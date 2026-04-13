import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Only update for staff users
    if (!user || user.user_metadata?.is_staff !== true) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const admin = createAdminClient();
    await admin
      .from("staff_accounts")
      .update({ last_login_at: new Date().toISOString() })
      .eq("supabase_user_id", user.id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
