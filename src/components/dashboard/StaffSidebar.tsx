"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Package,
  Warehouse,
  BarChart3,
  LogOut,
  Building2,
  ChevronsUpDown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type StaffRole = "cashier" | "warehouse_staff" | "admin";

interface StaffSidebarProps {
  role: StaffRole;
  orgName?: string;
  staffName?: string;
  pendingTransferCount?: number;
}

const ROLE_NAV: Record<StaffRole, { title: string; href: string; icon: any }[]> = {
  cashier: [
    { title: "POS Kasir", href: "/pos", icon: ShoppingCart },
    { title: "Transaksi", href: "/transactions", icon: BarChart3 },
  ],
  warehouse_staff: [
    { title: "Produk", href: "/products", icon: Package },
    { title: "Gudang", href: "/warehouses", icon: Warehouse },
  ],
  admin: [
    { title: "POS Kasir", href: "/pos", icon: ShoppingCart },
    { title: "Transaksi", href: "/transactions", icon: BarChart3 },
    { title: "Produk", href: "/products", icon: Package },
    { title: "Gudang", href: "/warehouses", icon: Warehouse },
  ],
};

const ROLE_LABEL: Record<StaffRole, string> = {
  cashier: "Kasir",
  warehouse_staff: "Staf Gudang",
  admin: "Admin",
};

export function StaffSidebar({ role, orgName = "Toko", staffName, pendingTransferCount = 0 }: StaffSidebarProps) {
  const pathname = usePathname();
  const navItems = ROLE_NAV[role] || [];

  const isSubdomain = typeof window !== "undefined"
    ? !window.location.hostname.includes("localhost") && window.location.hostname.split(".").length >= 3
    : false;

  const getIsActive = (itemHref: string) => {
    return pathname === itemHref || pathname.startsWith(itemHref + "/");
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch {
      toast.error("Gagal logout.");
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Building2 className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-foreground">{orgName}</span>
                    <span className="truncate text-xs capitalize">{ROLE_LABEL[role]}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                align="start"
                side="bottom"
                sideOffset={4}
              >
                <DropdownMenuItem className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <Building2 className="size-4 shrink-0" />
                  </div>
                  <div className="flex flex-col">
                    <span>{orgName}</span>
                    <span className="text-xs text-muted-foreground">{ROLE_LABEL[role]}</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = getIsActive(item.href);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href} prefetch={true}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {staffName?.[0]?.toUpperCase() ?? "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{staffName ?? "Karyawan"}</span>
                    <span className="truncate text-xs">{ROLE_LABEL[role]}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
