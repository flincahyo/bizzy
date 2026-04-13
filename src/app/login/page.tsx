import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { TenantLoginForm } from "@/components/dashboard/TenantLoginForm";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "bizzy.sbs";

export default async function LoginPage() {
  const headersList = await headers();

  // Vercel passes the real user-facing domain via x-forwarded-host
  const forwardedHost = headersList.get("x-forwarded-host");
  const fallbackHost = headersList.get("host") ?? "";
  const hostname = (forwardedHost ?? fallbackHost).split(":")[0];

  // If accessed from the root domain → redirect to landing page
  // All logins (owner + staff) happen from the tenant subdomain
  const isRootDomain =
    hostname === ROOT_DOMAIN ||
    hostname === "localhost" ||
    hostname === "127.0.0.1";

  if (isRootDomain) {
    // Redirect to landing page — login only via tenant subdomain
    redirect("/");
  }

  // Extract subdomain slug from hostname: tokokedai.bizzy.sbs → tokokedai
  const orgSlug = hostname.replace(`.${ROOT_DOMAIN}`, "");

  // Fetch org name for display
  let orgName: string | undefined;
  try {
    const admin = createAdminClient();
    const { data: org } = await admin
      .from("organizations")
      .select("name")
      .eq("subdomain_slug", orgSlug)
      .single();
    orgName = org?.name;
  } catch {}

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6">
      <TenantLoginForm orgSlug={orgSlug} orgName={orgName} />
    </div>
  );
}
