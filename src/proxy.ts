import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";


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
    // Exclude auth/api/login paths from tenant rewriting
    if (
      url.pathname === "/login" ||
      url.pathname === "/unauthorized" ||
      url.pathname.startsWith("/auth/") ||
      url.pathname.startsWith("/api/")
    ) {
      return supabaseResponse;
    }

    // ── OAuth Code Interceptor ────────────────────────────────────────────
    const oauthCode = url.searchParams.get("code");
    if (oauthCode && url.pathname === "/") {
      const callbackUrl = url.clone();
      callbackUrl.pathname = "/auth/callback";
      return NextResponse.redirect(callbackUrl);
    }

    // ── No Session → Login ────────────────────────────────────────────────
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    // ── Authenticated: Both Owner and Staff are Supabase users ────────────
    // Staff have is_staff: true in user_metadata (set on createUser)
    const isStaff = user.user_metadata?.is_staff === true;
    const newPath = `/tenant/${tenantSlug}${url.pathname === "/" ? "" : url.pathname}`;
    url.pathname = newPath || `/tenant/${tenantSlug}`;

    if (isStaff) {
      // Verify staff belongs to THIS subdomain
      if (user.user_metadata?.org_slug !== tenantSlug) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        return NextResponse.redirect(loginUrl);
      }

      const role = (user.user_metadata?.role || "cashier") as string;

      // RBAC: block paths not allowed for this role
      const ALLOWED: Record<string, string[]> = {
        cashier: ["/tenant/" + tenantSlug + "/pos", "/tenant/" + tenantSlug + "/transactions"],
        warehouse_staff: ["/tenant/" + tenantSlug + "/products", "/tenant/" + tenantSlug + "/warehouses"],
        admin: ["/tenant/" + tenantSlug], // prefix match covers all
      };
      const DEFAULT: Record<string, string> = { cashier: "/pos", warehouse_staff: "/warehouses", admin: "/" };
      const allowedPaths = ALLOWED[role] || [];
      const isAllowed = role === "admin"
        || allowedPaths.some((p) => url.pathname === p || url.pathname.startsWith(p + "/"));

      if (!isAllowed) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = DEFAULT[role] || "/pos";
        return NextResponse.redirect(redirectUrl);
      }

      // Pass staff role as request header so Server Components can render correct sidebar
      const reqHeaders = new Headers(request.headers);
      reqHeaders.set("x-staff-role", role);
      reqHeaders.set("x-staff-name", user.user_metadata?.full_name || "");
      const staffRewrite = NextResponse.rewrite(url, { request: { headers: reqHeaders } });
      supabaseResponse.cookies.getAll().forEach((c) => staffRewrite.cookies.set(c.name, c.value));
      return staffRewrite;
    }

    // Owner: full access, rewrite and serve
    const ownerRewrite = NextResponse.rewrite(url);
    supabaseResponse.cookies.getAll().forEach((c) => ownerRewrite.cookies.set(c.name, c.value));
    return ownerRewrite;
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
    // Protect Admin Routes (except /admin/login)
    const isAdminLogin = url.pathname === "/admin/login";
    if (!user && !isAdminLogin) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    if (user && !isAdminLogin && user.user_metadata?.is_superadmin !== true) {
      // Authenticated but not a superadmin
      const unauthUrl = request.nextUrl.clone();
      unauthUrl.pathname = "/unauthorized";
      // Ensure we hit the central unauthorized routing or just drop them to their tenant
      return NextResponse.redirect(unauthUrl);
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
