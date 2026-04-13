import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/"; // default redirect

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Query user's organizations
        const { data: memberships } = await supabase
          .from('memberships')
          .select('organization_id, organizations(subdomain_slug)')
          .eq('profile_id', user.id)
          .eq('is_active', true)
          .limit(1);

        let redirectUrl = `${origin}${next}`;
        
        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";

        // If they have a tenant organization, redirect directly to their subdomain
        if (memberships && memberships.length > 0 && memberships[0].organizations) {
           const slug = Array.isArray(memberships[0].organizations) 
               ? memberships[0].organizations[0].subdomain_slug 
               : (memberships[0].organizations as any).subdomain_slug;
           
           if (slug) {
             const protocol = isLocalEnv ? "http://" : "https://";
             const hostDomain = isLocalEnv 
               ? "localhost:3000" 
               : process.env.NEXT_PUBLIC_ROOT_DOMAIN || "bizzy.sbs";
             // Build subdomain URL and return directly — do NOT override hostname
             const subdomainUrl = isLocalEnv
               ? `${protocol}${hostDomain}/tenant/${slug}`
               : `${protocol}${slug}.${hostDomain}`;
             return NextResponse.redirect(subdomainUrl);
           }
        }

        // No tenant found, redirect to onboarding
        if (next === "/") {
           redirectUrl = `${origin}/onboarding`;
        }
        
        if (isLocalEnv) {
          return NextResponse.redirect(redirectUrl);
        } else if (forwardedHost) {
          const urlObj = new URL(redirectUrl);
          urlObj.hostname = forwardedHost;
          urlObj.port = '';
          urlObj.protocol = 'https:';
          return NextResponse.redirect(urlObj.toString());
        } else {
          return NextResponse.redirect(redirectUrl);
        }
      }
    } else {
      console.error("Auth Callback Error:", error.message);
    }
  }

  // Fallback to error page or login if failed
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
