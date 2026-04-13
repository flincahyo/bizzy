import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Building2 } from "lucide-react";
import { StaffLoginForm } from "@/components/dashboard/StaffLoginForm";
import { OwnerLoginForm } from "@/components/dashboard/OwnerLoginForm";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "bizzy.sbs";

export default async function LoginPage() {
  const headersList = await headers();
  const forwardedHost = headersList.get("x-forwarded-host");
  const fallback = headersList.get("host") ?? "";
  const hostname = (forwardedHost ?? fallback).split(":")[0];

  // Root domain → redirect landing (all login via subdomain)
  const isRootDomain =
    hostname === ROOT_DOMAIN ||
    hostname === "localhost" ||
    hostname === "127.0.0.1";

  if (isRootDomain) redirect("/");

  // Extract orgSlug from subdomain
  const orgSlug = hostname.replace(`.${ROOT_DOMAIN}`, "");

  // Fetch org display name
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
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <Building2 className="size-6" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">{orgName ?? orgSlug}</h1>
          <p className="text-sm text-muted-foreground mt-1">Silakan masuk untuk melanjutkan</p>
        </div>

        {/* Tabs */}
        <LoginTabs orgSlug={orgSlug} />

        <p className="text-center text-xs text-muted-foreground mt-8">
          © {new Date().getFullYear()} Bizzy SaaS. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  );
}

// Server component wrapper — tab switching done client-side inside each form
function LoginTabs({ orgSlug }: { orgSlug: string }) {
  return (
    <div className="space-y-6">
      {/* Owner section */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Pemilik Toko
        </p>
        <OwnerLoginForm />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">atau</span>
        </div>
      </div>

      {/* Staff section */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Masuk sebagai Karyawan
        </p>
        <StaffLoginForm orgSlug={orgSlug} />
      </div>
    </div>
  );
}
