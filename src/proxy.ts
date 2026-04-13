import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getStaffSessionFromRequest, isPathAllowedForRole, STAFF_DEFAULT_REDIRECT, StaffRole } from "@/lib/staff-session";


const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "bizzy.id";

// Subdomains that are NOT tenant slugs - they are system routes
const RESERVED_SUBDOMAINS = new Set(["www", "app", "admin", "api", "status"]);

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get("host") ?? "";

  // Strip port for local dev (e.g. "localhost:3000" -> "localhost")
  const hostname = host.split(":")[0];

  // ─── Subdomain Detection ────────────────────────────────────────────────
  // In production:  toko.bizzy.id  → slug = "toko"
  // In local dev:   localhost       → no slug (root domain)

  let tenantSlug: string | null = null;

  if (hostname !== "localhost" && hostname !== ROOT_DOMAIN) {
    // Check it's a subdomain of our root domain
    if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
      const sub = hostname.replace(`.${ROOT_DOMAIN}`, "");
      if (!RESERVED_SUBDOMAINS.has(sub)) {
        tenantSlug = sub;
      }
    } else if (hostname.endsWith(".localhost")) {
      // Support for local development (e.g. toko.localhost:3000)
      const sub = hostname.replace(".localhost", "");
      if (!RESERVED_SUBDOMAINS.has(sub)) {
        tenantSlug = sub;
      }
    }
  }

  // ─── Supabase Auth Session Refresh ──────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            const isProd = process.env.NODE_ENV === "production";
            // Important: In local dev, setting domain: 'localhost' breaks subdomains.
            // Leaving it undefined ensures the browser applies it to the exact originating host perfectly.
            const cookieOptions = isProd 
                ? { ...options, domain: `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}` }
                : { ...options };
                
            supabaseResponse.cookies.set(name, value, cookieOptions);
          });
        },
      },
    }
  );

  // Refresh expired auth sessions
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ─── Tenant Route Rewriting ──────────────────────────────────────────────
  if (tenantSlug) {
    // Exclude auth/api paths from tenant rewriting
    if (
      url.pathname === "/login" ||
      url.pathname === "/unauthorized" ||
      url.pathname.startsWith("/auth/") ||
      url.pathname.startsWith("/api/")
    ) {
      return supabaseResponse;
    }

    // ── OAuth Code Interceptor (Subdomain) ────────────────────────────────
    // Supabase may redirect ?code= to the root of the subdomain instead of /auth/callback
    // Catch it and forward to the proper handler
    const oauthCode = url.searchParams.get("code");
    if (oauthCode && url.pathname === "/") {
      const callbackUrl = url.clone();
      callbackUrl.pathname = "/auth/callback";
      return NextResponse.redirect(callbackUrl);
    }

    // ── Staff Session — CHECK FIRST ───────────────────────────────────────
    // Staff session takes priority over Supabase owner session.
    // This prevents owner browser session from overriding a staff login.
    const staffSession = getStaffSessionFromRequest(request);

    if (staffSession) {
      // Verify the staff session belongs to THIS subdomain
      if (staffSession.orgSlug !== tenantSlug) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        return NextResponse.redirect(loginUrl);
      }

      const role = staffSession.role as StaffRole;
      const currentPath = url.pathname === "/" ? "/" : url.pathname;

      if (!isPathAllowedForRole(currentPath, role)) {
        const defaultPath = STAFF_DEFAULT_REDIRECT[role] || "/pos";
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = defaultPath;
        return NextResponse.redirect(redirectUrl);
      }

      const staffPath = `/tenant/${tenantSlug}${url.pathname === "/" ? "" : url.pathname}`;
      url.pathname = staffPath || `/tenant/${tenantSlug}`;
      const staffHeaders = new Headers(request.headers);
      staffHeaders.set("x-staff-role", role);
      staffHeaders.set("x-staff-id", staffSession.staffId);
      staffHeaders.set("x-staff-name", staffSession.fullName);
      const staffRewrite = NextResponse.rewrite(url, {
        request: { headers: staffHeaders },
      });
      supabaseResponse.cookies.getAll().forEach((cookie) =>
        staffRewrite.cookies.set(cookie.name, cookie.value)
      );
      return staffRewrite;
    }

    // ── Owner Session (Supabase Auth) — FALLBACK ─────────────────────────
    if (user) {
      const ownerPath = `/tenant/${tenantSlug}${url.pathname === "/" ? "" : url.pathname}`;
      url.pathname = ownerPath || `/tenant/${tenantSlug}`;
      const ownerRewrite = NextResponse.rewrite(url);
      supabaseResponse.cookies.getAll().forEach((cookie) =>
        ownerRewrite.cookies.set(cookie.name, cookie.value)
      );
      return ownerRewrite;
    }


    // ── No Session → Redirect to tenant login ──────────────────────────────
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // ─── System Route Rewriting (Admin) ────────────────────────────────────
  const isAdminSubdomain = hostname === `admin.${ROOT_DOMAIN}` || hostname === "admin.localhost";
  
  if (isAdminSubdomain) {
    // If they visit admin.bizzy.id, internally map it to /admin
    if (url.pathname === "/") {
      url.pathname = "/admin";
    } else if (!url.pathname.startsWith("/admin")) {
      url.pathname = `/admin${url.pathname}`;
    }

    const rewriteResponse = NextResponse.rewrite(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      rewriteResponse.cookies.set(cookie.name, cookie.value);
    });
    
    // Protect Admin Routes (except /admin/login)
    const isAdminLogin = url.pathname === "/admin/login";
    if (!user && !isAdminLogin) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    return rewriteResponse;
  }

  // ─── Protect Tenant Dashboard Routes ────────────────────────────────────
  const isTenantDashboard = url.pathname.startsWith("/tenant/");
  if (isTenantDashboard && !user) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ─── OAuth Code Interceptor ───────────────────────────────────────────────
  // Supabase sometimes redirects ?code= back to Site URL (/) instead of /auth/callback
  // Catch it here and forward the code to the proper handler
  const oauthCode = url.searchParams.get("code");
  if (oauthCode && url.pathname === "/") {
    const callbackUrl = url.clone();
    callbackUrl.pathname = "/auth/callback";
    return NextResponse.redirect(callbackUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
