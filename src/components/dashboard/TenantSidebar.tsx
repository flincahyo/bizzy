"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  Users,
  BarChart3,
  TrendingUp,
  Settings,
  ChevronsUpDown,
  Plus,
  Building2,
  LogOut,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { AppsSubscription, DEFAULT_SUBSCRIPTION } from "@/lib/features";

interface TenantSidebarProps {
  slug: string;
  orgName?: string;
  appsSubscription?: AppsSubscription;
  userAvatar?: string;
  userName?: string;
}

const navItems = [
  { title: "Dashboard", href: "", icon: LayoutDashboard },
  { title: "POS Kasir", href: "/pos", icon: ShoppingCart },
  { title: "Transaksi", href: "/transactions", icon: BarChart3 },
  { title: "Produk", href: "/products", icon: Package },
  { title: "Gudang", href: "/warehouses", icon: Warehouse },
  { title: "Staff", href: "/staff", icon: Users },
  { title: "Laporan", href: "/analytics", icon: TrendingUp },
];

export function TenantSidebar({
  slug,
  orgName = "Bisnis Saya",
  appsSubscription = DEFAULT_SUBSCRIPTION,
  userAvatar,
  userName = "Owner",
}: TenantSidebarProps) {
  const pathname = usePathname();
  const base = `/tenant/${slug}`;

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
                    <span className="truncate text-xs capitalize">POS {appsSubscription.pos.tier} / Inv {appsSubscription.inventory.tier}</span>
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
                  {orgName}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">Add team</div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const href = `${base}${item.href}`;
                const isActive = pathname === href || (item.href !== "" && pathname.startsWith(href));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={href}>
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

        <SidebarGroup>
          <SidebarGroupLabel>Sistem</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Pengaturan">
                  <Link href={`${base}/settings`}>
                    <Settings />
                    <span>Pengaturan</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Landing Page">
                  <Link href="/" target="_blank">
                    <Building2 />
                    <span>Tentang Bizzy</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {(appsSubscription.pos.tier === "starter" || appsSubscription.inventory.tier === "starter") && (
          <div className="mt-auto px-4 py-6">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 bg-primary/10 w-16 h-16 rounded-full blur-xl" />
              <div className="relative z-10 flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Akses Terbatas</span>
                <p className="text-sm text-muted-foreground leading-tight">
                  Anda menggunakan paket Starter. Upgrade untuk membuka lebih banyak kasir & batas produk.
                </p>
                <Link href={`${base}/settings`} className="mt-2 text-xs font-semibold bg-primary text-primary-foreground px-3 py-2 rounded-md text-center hover:bg-primary/90 transition-colors">
                  Upgrade Paket
                </Link>
              </div>
            </div>
          </div>
        )}
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
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback className="rounded-lg">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userName}</span>
                    <span className="truncate text-xs">Owner</span>
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
                <DropdownMenuItem>
                  <Settings />
                  <span>Profil & Keamanan</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={async () => {
                   const { createClient } = await import("@/lib/supabase/client");
                   const supabase = createClient();
                   await supabase.auth.signOut();
                   // Redirect to root domain, not subdomain
                   const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "bizzy.sbs";
                   const isLocal = window.location.hostname === "localhost";
                   window.location.href = isLocal ? "/login" : `https://${rootDomain}/login`;
                }}>
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
