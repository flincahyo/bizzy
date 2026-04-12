import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { TenantSidebar } from "@/components/dashboard/TenantSidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { slug } = await params;

  // In a real scenario, fetch org data from Supabase here using the slug
  // const supabase = await createClient();
  // const { data: org } = await supabase.from("organizations").select().eq("subdomain_slug", slug).single();

  return (
    <SidebarProvider>
      <TenantSidebar
        slug={slug}
        orgName="Toko Demo"
        tier="pro"
        userName="Admin"
      />
      <SidebarInset>
        {/* Top nav bar */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/60 px-4 bg-background/95 backdrop-blur sticky top-0 z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-sm">Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        {/* Page content area */}
        <div className="flex flex-1 flex-col gap-4 p-6 bg-muted/20 min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
