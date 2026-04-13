"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Loader2, KeyRound, User, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TenantLoginFormProps {
  orgSlug: string;
  orgName?: string;
}

export function TenantLoginForm({ orgSlug, orgName }: TenantLoginFormProps) {
  const [mode, setMode] = useState<"owner" | "staff">("owner");
  const [isPending, startTransition] = useTransition();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [pinValue, setPinValue] = useState("");

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Gagal memulai proses login");
      setIsGoogleLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = (formData.get("username") as string)?.trim();
    const pin = (formData.get("pin") as string)?.trim();

    if (!username || !pin) return;

    startTransition(async () => {
      try {
        const res = await fetch("/api/staff/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, pin, orgSlug }),
        });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Login gagal. Coba lagi.");
          return;
        }

        toast.success("Login berhasil!");
        setTimeout(() => {
          window.location.href = data.redirectTo || "/pos";
        }, 300);
      } catch {
        toast.error("Gagal menghubungi server. Coba lagi.");
      }
    });
  };

  return (
    <div className="w-full max-w-sm">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Building2 className="size-6" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">{orgName ?? orgSlug}</h1>
        <p className="text-sm text-muted-foreground mt-1">Silakan masuk untuk melanjutkan</p>
      </div>

      {/* Toggle Tabs */}
      <div className="flex rounded-lg bg-muted p-1 mb-6">
        <button
          onClick={() => setMode("owner")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
            mode === "owner"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Pemilik
        </button>
        <button
          onClick={() => setMode("staff")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
            mode === "staff"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Karyawan
        </button>
      </div>

      {/* Owner Login */}
      {mode === "owner" && (
        <div className="space-y-4">
          <Button
            className="w-full"
            variant="outline"
            size="lg"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menghubungkan...</>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Masuk dengan Google
              </>
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Login sebagai pemilik toko <span className="font-semibold">{orgName}</span>
          </p>
        </div>
      )}

      {/* Staff Login */}
      {mode === "staff" && (
        <form onSubmit={handleStaffLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                name="username"
                placeholder="kasir_budi"
                className="pl-9"
                autoComplete="username"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pin">PIN</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="pin"
                name="pin"
                type="password"
                placeholder="••••••"
                maxLength={6}
                className="pl-9 tracking-widest text-lg"
                inputMode="numeric"
                value={pinValue}
                onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">PIN 4–6 digit dari pemilik toko.</p>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</> : "Masuk"}
          </Button>
        </form>
      )}

      <p className="text-center text-xs text-muted-foreground mt-6">
        © {new Date().getFullYear()} Bizzy SaaS. Hak Cipta Dilindungi.
      </p>
    </div>
  );
}
