import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";
import { STAFF_DEFAULT_REDIRECT, StaffRole } from "@/lib/staff-session";

const COOKIE_NAME = "bizzy_staff_session";
const SESSION_HOURS = 12;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, pin, orgSlug } = body;

    if (!username || !pin || !orgSlug) {
      return NextResponse.json({ error: "Data login tidak lengkap." }, { status: 400 });
    }

    const admin = createAdminClient();

    // Find org
    const { data: org } = await admin
      .from("organizations")
      .select("id, name")
      .eq("subdomain_slug", orgSlug)
      .single();

    if (!org) {
      return NextResponse.json({ error: "Toko tidak ditemukan." }, { status: 404 });
    }

    // Find staff account
    const { data: staff } = await admin
      .from("staff_accounts")
      .select("id, pin_hash, role, full_name, is_active")
      .eq("organization_id", org.id)
      .eq("username", username)
      .eq("is_active", true)
      .single();

    if (!staff) {
      return NextResponse.json({ error: "Username atau PIN salah." }, { status: 401 });
    }

    // Verify PIN
    const isValid = await bcrypt.compare(pin, staff.pin_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Username atau PIN salah." }, { status: 401 });
    }

    const role = staff.role as StaffRole;
    const redirectTo = STAFF_DEFAULT_REDIRECT[role] || "/pos";

    // Create session token
    const token = crypto.randomUUID() + "-" + crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);

    // Store token in DB (best-effort, fails silently if columns not yet migrated)
    await admin
      .from("staff_accounts")
      .update({ session_token: token, session_expires_at: expiresAt.toISOString() })
      .eq("id", staff.id);

    // Build cookie payload
    const payload = {
      token,
      staffId: staff.id,
      orgId: org.id,
      orgSlug,
      role,
      fullName: staff.full_name,
    };

    // Encode to base64 (Edge Runtime safe: all values are ASCII)
    const cookieValue = btoa(JSON.stringify(payload));

    // Build response and set cookie directly (most reliable method)
    const response = NextResponse.json({ success: true, redirectTo, role });
    response.cookies.set(COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("[staff/login]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
