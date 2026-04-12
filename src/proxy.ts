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
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
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
    // Rewrite /any-path -> /tenant/[slug]/any-path internally
    // Browser URL stays as toko.bizzy.id/any-path (unchanged)
    const newPath = `/tenant/${tenantSlug}${url.pathname}`;
    url.pathname = newPath;

    const rewriteResponse = NextResponse.rewrite(url);

    // Copy over the supabase session cookies to the rewrite response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      rewriteResponse.cookies.set(cookie.name, cookie.value);
    });

    return rewriteResponse;
  }

  // ─── Protect Tenant Dashboard Routes ────────────────────────────────────
  const isTenantDashboard = url.pathname.startsWith("/tenant/");
  if (isTenantDashboard && !user) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
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
