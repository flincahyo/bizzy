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
  Settings,
  ChevronRight,
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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TenantSidebarProps {
  slug: string;
  orgName?: string;
  tier?: "basic" | "pro" | "enterprise";
  userAvatar?: string;
  userName?: string;
}

const navItems = [
  { title: "Dashboard", href: "", icon: LayoutDashboard, feature: null },
  { title: "POS Kasir", href: "/pos", icon: ShoppingCart, feature: "pos" },
  { title: "Transaksi", href: "/transactions", icon: BarChart3, feature: null },
  { title: "Produk", href: "/products", icon: Package, feature: null },
  { title: "Gudang", href: "/warehouses", icon: Warehouse, feature: null },
  { title: "Staff", href: "/staff", icon: Users, feature: "staff_management" },
  { title: "Laporan", href: "/analytics", icon: BarChart3, feature: "analytics_basic" },
];

const TIER_COLORS = {
  basic: "bg-slate-100 text-slate-700",
  pro: "bg-indigo-100 text-indigo-700",
  enterprise: "bg-amber-100 text-amber-700",
};

export function TenantSidebar({
  slug,
  orgName = "Bisnis Saya",
  tier = "basic",
  userAvatar,
  userName = "Owner",
}: TenantSidebarProps) {
  const pathname = usePathname();
  const base = `/tenant/${slug}`;

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60">
      {/* Header: Brand + Org Name */}
      <SidebarHeader className="p-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
            <span className="text-primary-foreground font-bold text-lg font-heading">B</span>
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-sm font-heading leading-none truncate">{orgName}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{slug}.bizzy.id</p>
          </div>
        </div>
        <Badge className={cn("mt-3 w-fit text-xs font-semibold capitalize", TIER_COLORS[tier])}>
          {tier}
        </Badge>
      </SidebarHeader>

      {/* Navigation */}
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
                      render={<Link href={href} />}
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <item.icon className="shrink-0" />
                      <span>{item.title}</span>
                      {isActive && (
                        <ChevronRight className="ml-auto shrink-0 opacity-50" size={14} />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Sistem</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href={`${base}/settings`} />} tooltip="Pengaturan">
                  <Settings className="shrink-0" />
                  <span>Pengaturan</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/" target="_blank" />} tooltip="Landing Page">
                  <Building2 className="shrink-0" />
                  <span>Tentang Bizzy</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer: User info + Logout */}
      <SidebarFooter className="p-3 border-t border-border/60">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="gap-3">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={userAvatar} />
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate">{userName}</span>
                <span className="text-xs text-muted-foreground">Owner</span>
              </div>
              <LogOut className="ml-auto shrink-0 text-muted-foreground" size={16} />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
