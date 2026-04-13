"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface NotificationBellProps {
  orders: any[];
  slug: string;
}

export function NotificationBell({ orders, slug }: NotificationBellProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative text-muted-foreground hover:text-foreground outline-none transition-colors mr-2">
        <Bell size={20} />
        {orders.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white z-10 animate-pulse">
            {orders.length}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifikasi ({orders.length})</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {orders.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Tidak ada notifikasi baru
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {orders.map((order) => (
              <DropdownMenuItem key={order.id} asChild>
                <Link href={`/tenant/${slug}/warehouses`} className="flex flex-col gap-1 items-start cursor-pointer p-3">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold">{order.destination?.name}</span>
                    <Badge variant="outline" className="text-[10px]">{order.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Meminta restock barang dari <span className="font-medium text-foreground">{order.source?.name}</span>
                  </p>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {new Date(order.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator />
        <Link href={`/tenant/${slug}/warehouses`} className="block text-center text-xs text-primary p-2 hover:underline">
          Lihat Semua Logistik
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
