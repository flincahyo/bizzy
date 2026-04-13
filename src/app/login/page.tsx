import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { OwnerLoginForm } from "@/components/dashboard/OwnerLoginForm";
import { StaffLoginForm } from "@/components/dashboard/StaffLoginForm";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "bizzy.sbs";

export default async function LoginPage() {
  const headersList = await headers();

  // In Vercel production, the real user-facing domain comes via x-forwarded-host
  // This matches the same logic used in proxy.ts
  const forwardedHost = headersList.get("x-forwarded-host");
  const hostHeader = headersList.get("host") ?? "";
  const host = forwardedHost ?? hostHeader;
  const hostname = host.split(":")[0];

  // Detect if this login page is accessed from a tenant subdomain
  const isTenantSubdomain =
    hostname !== "localhost" &&
    hostname !== ROOT_DOMAIN &&
    hostname.endsWith(`.${ROOT_DOMAIN}`);

  const orgSlug = isTenantSubdomain
    ? hostname.replace(`.${ROOT_DOMAIN}`, "")
    : null;

  // Fetch org name if on subdomain
  let orgName: string | undefined;
  if (orgSlug) {
    const admin = createAdminClient();
    const { data: org } = await admin
      .from("organizations")
      .select("name")
      .eq("subdomain_slug", orgSlug)
      .single();
    orgName = org?.name;
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      {isTenantSubdomain && orgSlug ? (
        // ── Staff Login (Subdomain) ──────────────────────────────────────────
        <div className="flex flex-col items-center gap-6">
          <StaffLoginForm orgSlug={orgSlug} orgName={orgName} />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Bizzy SaaS. Hak Cipta Dilindungi.
          </p>
        </div>
      ) : (
        // ── Owner Login (Root Domain) ────────────────────────────────────────
        <div className="w-full max-w-sm flex flex-col gap-6">
          <OwnerLoginForm />
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Bizzy SaaS. Hak Cipta Dilindungi.
          </p>
        </div>
      )}
    </div>
  );
}
