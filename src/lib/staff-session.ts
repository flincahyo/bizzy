import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export type StaffRole = "cashier" | "warehouse_staff" | "admin";

export interface StaffSessionPayload {
  staffId: string;
  orgId: string;
  orgSlug: string;
  role: StaffRole;
  fullName: string;
}

const COOKIE_NAME = "bizzy_staff_session";
const SESSION_DURATION_HOURS = 12;

// ─── Create Staff Session ──────────────────────────────────────────────────────
// Called after successful PIN login. Generates a random token, stores it in DB
// and sets an httpOnly cookie scoped to the tenant subdomain.
export async function createStaffSession(payload: StaffSessionPayload): Promise<string> {
  const admin = createAdminClient();

  // Generate a secure random token
  const token = crypto.randomUUID() + "-" + crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

  // Store token in staff_accounts table
  await admin
    .from("staff_accounts")
    .update({
      session_token: token,
      session_expires_at: expiresAt.toISOString(),
    })
    .eq("id", payload.staffId);

  return token;
}

// ─── Set Staff Session Cookie ──────────────────────────────────────────────────
// Called in a Server Action after createStaffSession
export async function setStaffSessionCookie(
  token: string,
  payload: StaffSessionPayload,
  isLocal: boolean
) {
  const cookieStore = await cookies();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

  // Encode payload as base64 using btoa (Edge Runtime compatible)
  const cookieValue = btoa(unescape(encodeURIComponent(
    JSON.stringify({ token, ...payload })
  )));

  cookieStore.set(COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: !isLocal,
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
    // In production, scope to the specific subdomain (e.g. tokokedai.bizzy.sbs)
    // We don't scope to root domain to prevent cross-tenant access
  });
}

// ─── Get Staff Session from Request ───────────────────────────────────────────
// Used in proxy middleware for fast role-based routing
export function getStaffSessionFromRequest(request: NextRequest): StaffSessionPayload | null {
  const cookieValue = request.cookies.get(COOKIE_NAME)?.value;
  if (!cookieValue) return null;

  try {
    // Use atob which is Edge Runtime compatible
    const decoded = JSON.parse(decodeURIComponent(escape(atob(cookieValue))));
    // Basic structure check
    if (!decoded.staffId || !decoded.orgSlug || !decoded.role) return null;
    return decoded as StaffSessionPayload;
  } catch {
    return null;
  }
}

// ─── Verify Staff Session (Server-side deep check) ────────────────────────────
// Used in pages/layouts to verify token against DB (prevents forged cookies)
export async function verifyStaffSession(request?: NextRequest): Promise<StaffSessionPayload | null> {
  let cookieValue: string | undefined;

  if (request) {
    cookieValue = request.cookies.get(COOKIE_NAME)?.value;
  } else {
    const cookieStore = await cookies();
    cookieValue = cookieStore.get(COOKIE_NAME)?.value;
  }

  if (!cookieValue) return null;

  try {
    const decoded = JSON.parse(decodeURIComponent(escape(atob(cookieValue))));
    const { token, staffId } = decoded;

    const admin = createAdminClient();
    const { data: staff } = await admin
      .from("staff_accounts")
      .select("id, role, full_name, organization_id, session_token, session_expires_at, is_active, organizations(subdomain_slug)")
      .eq("id", staffId)
      .eq("session_token", token)
      .eq("is_active", true)
      .single();

    if (!staff) return null;
    if (!staff.session_expires_at) return null;
    if (new Date(staff.session_expires_at) < new Date()) return null;

    const orgSlug = Array.isArray(staff.organizations)
      ? staff.organizations[0]?.subdomain_slug
      : (staff.organizations as any)?.subdomain_slug;

    return {
      staffId: staff.id,
      orgId: staff.organization_id,
      orgSlug,
      role: staff.role as StaffRole,
      fullName: staff.full_name,
    };
  } catch {
    return null;
  }
}

// ─── Clear Staff Session ───────────────────────────────────────────────────────
export async function clearStaffSession(staffId?: string) {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);

  if (staffId) {
    const admin = createAdminClient();
    await admin
      .from("staff_accounts")
      .update({ session_token: null, session_expires_at: null })
      .eq("id", staffId);
  }
}

// ─── Role Permissions ──────────────────────────────────────────────────────────
export const STAFF_ALLOWED_PATHS: Record<StaffRole, string[]> = {
  cashier: ["/pos", "/transactions"],
  warehouse_staff: ["/products", "/warehouses"],
  admin: ["/", "/pos", "/transactions", "/products", "/warehouses", "/staff", "/analytics"],
};

export const STAFF_DEFAULT_REDIRECT: Record<StaffRole, string> = {
  cashier: "/pos",
  warehouse_staff: "/warehouses",
  admin: "/",
};

export function isPathAllowedForRole(pathname: string, role: StaffRole): boolean {
  const allowed = STAFF_ALLOWED_PATHS[role] || [];
  return allowed.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
