import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { TenantSidebar } from "@/components/dashboard/TenantSidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { ModeToggle } from "@/components/mode-toggle";
import { redirect, notFound } from "next/navigation";

import { getTenantProfileBySlug } from "@/lib/services/tenant";

import { AppsSubscription, DEFAULT_SUBSCRIPTION } from "@/lib/features";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { slug } = await params;

  const data = await getTenantProfileBySlug(slug);

  // Org doesn't exist at all → 404
  if (!data) return notFound();

  // User is logged in but NOT a member of this org → 403
  if (data.profile && !data.isMember) {
    redirect("/unauthorized");
  }

  // Provide fallbacks
  const orgName = data?.org?.name || "Toko Setup Required";
  const appsSubscription: AppsSubscription = data?.org?.apps_subscription || DEFAULT_SUBSCRIPTION;
  const userName = data?.profile?.full_name || "Pemilik";
  const avatarUrl = data?.profile?.avatar_url || "";

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
          <div className="flex items-center gap-2">
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
