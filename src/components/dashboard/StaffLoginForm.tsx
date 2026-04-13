"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, KeyRound, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface StaffLoginFormProps {
  orgSlug: string;
}

export function StaffLoginForm({ orgSlug }: StaffLoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !pin.trim()) return;
    setIsLoading(true);

    try {
      const supabase = createClient();
      // Synthetic email derived from username + orgSlug (must match what was set during createStaff)
      const syntheticEmail = `${username.trim()}.${orgSlug}@staff.bizzy.sbs`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: syntheticEmail,
        password: pin,
      });

      if (error) {
        toast.error("Username atau PIN salah. Coba lagi.");
        return;
      }

      // Role comes from user_metadata set during staff creation
      const role = data.user?.user_metadata?.role || "cashier";
      const REDIRECTS: Record<string, string> = {
        cashier: "/pos",
        warehouse_staff: "/warehouses",
        admin: "/",
      };

      toast.success("Login berhasil!");
      setTimeout(() => {
        window.location.href = REDIRECTS[role] || "/pos";
      }, 300);
    } catch {
      toast.error("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="staff-username">Username</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="staff-username"
            placeholder="kasir_budi"
            className="pl-9"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="staff-pin">PIN</Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="staff-pin"
            type="password"
            placeholder="••••••"
            maxLength={6}
            inputMode="numeric"
            className="pl-9 tracking-widest text-lg"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">PIN 4–6 digit dari pemilik toko.</p>
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</> : "Masuk"}
      </Button>
    </form>
  );
}
