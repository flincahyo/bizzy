import { Building2, LayoutDashboard, Users, CreditCard, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator, SidebarFooter, SidebarInset } from "@/components/ui/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="none" className="w-64 border-r border-border/60">
        <SidebarHeader className="p-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
              <Building2 size={16} />
            </div>
            <div>
              <p className="font-bold text-sm tracking-tight leading-none">Bizzy Admin</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Super Control Panel</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin">
                      <LayoutDashboard size={14} className="mr-2" />
                      Dashboard
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin/customers">
                      <Users size={14} className="mr-2" />
                      Customers (Tenants)
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="border-t border-border/60 p-4">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground text-sm gap-2 hover:bg-destructive/10 hover:text-destructive">
            <LogOut size={14} /> Keluar Admin
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-muted/10 h-screen overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
