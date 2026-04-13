import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { TenantSidebar } from "@/components/dashboard/TenantSidebar";
import { StaffSidebar } from "@/components/dashboard/StaffSidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { ModeToggle } from "@/components/mode-toggle";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";

import { getTenantProfileBySlug } from "@/lib/services/tenant";
import { getPendingTransferOrders } from "@/lib/services/products";

import { AppsSubscription, DEFAULT_SUBSCRIPTION } from "@/lib/features";

type StaffRole = "cashier" | "warehouse_staff" | "admin";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { slug } = await params;
  const headersList = await headers();

  // Detect staff mode via headers set by proxy middleware
  const staffRole = headersList.get("x-staff-role") as StaffRole | null;
  const staffName = headersList.get("x-staff-name") ?? undefined;

  const data = await getTenantProfileBySlug(slug);

  // Org doesn't exist at all → 404
  if (!data) return notFound();

  // For owner access: verify membership
  if (!staffRole && data.profile && !data.isMember) {
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "bizzy.sbs";
    redirect(`https://${rootDomain}/unauthorized`);
  }

  // Provide fallbacks
  const orgName = data?.org?.name || "Toko Setup Required";
  const appsSubscription: AppsSubscription = data?.org?.apps_subscription || DEFAULT_SUBSCRIPTION;
  const userName = data?.profile?.full_name || "Pemilik";
  const avatarUrl = data?.profile?.avatar_url || "";
  const orgId = data?.org?.id;
  
  const pendingTransferOrders = orgId ? await getPendingTransferOrders(orgId) : [];

  // ── Staff Layout ─────────────────────────────────────────────────────────
  if (staffRole) {
    return (
      <SidebarProvider>
        <StaffSidebar role={staffRole} orgName={orgName} staffName={staffName} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>{orgName} / {staffName ?? "Staff Dashboard"}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell orders={pendingTransferOrders} slug={slug} />
              <ModeToggle />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // ── Owner Layout ─────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <TenantSidebar
        slug={slug}
        orgName={orgName}
        appsSubscription={appsSubscription}
        userName={userName}
        userAvatar={avatarUrl}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{orgName} / Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell orders={pendingTransferOrders} slug={slug} />
            <ModeToggle />
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
