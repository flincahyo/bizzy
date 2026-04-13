"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart, Package, Warehouse, BarChart3, LogOut, Building2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type StaffRole = "cashier" | "warehouse_staff" | "admin";


interface StaffSidebarProps {
  role: StaffRole;
  orgName?: string;
  staffName?: string;
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

export function StaffSidebar({ role, orgName = "Toko", staffName }: StaffSidebarProps) {
  const pathname = usePathname();
  const navItems = ROLE_NAV[role] || [];

  const isSubdomain = typeof window !== "undefined"
    ? !window.location.hostname.includes("localhost") && window.location.hostname.split(".").length >= 3
    : false;

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
    <div className="flex flex-col h-full w-64 border-r bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Building2 className="size-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold truncate">{orgName}</span>
          <span className="text-xs text-muted-foreground">{ROLE_LABEL[role]}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 pb-2">Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t space-y-2">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold uppercase">
            {staffName?.[0] ?? "S"}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-medium truncate">{staffName ?? "Karyawan"}</span>
            <span className="text-xs text-muted-foreground">{ROLE_LABEL[role]}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </div>
  );
}
