"use client";

import { useState, useTransition } from "react";
import { staffLogin } from "@/lib/actions/dashboard";
import { toast } from "sonner";
import { Loader2, KeyRound, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StaffLoginFormProps {
  orgSlug: string;
  orgName?: string;
}

export function StaffLoginForm({ orgSlug, orgName }: StaffLoginFormProps) {
  const [isPending, startTransition] = useTransition();
  const [pinValue, setPinValue] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("orgSlug", orgSlug);

    startTransition(async () => {
      try {
        const { redirectTo } = await staffLogin(formData);
        toast.success("Login berhasil! Mengarahkan...");
        // Use window.location for hard redirect (session cookie needs to be read fresh)
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 500);
      } catch (err: any) {
        toast.error(err.message ?? "Login gagal. Coba lagi.");
      }
    });
  };

  return (
    <Card className="w-full max-w-sm shadow-xl border">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <KeyRound className="size-6" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Masuk sebagai Karyawan</CardTitle>
        <CardDescription>
          {orgName ? (
            <span>Login ke toko <span className="font-semibold text-foreground">{orgName}</span></span>
          ) : (
            "Masukkan username dan PIN Anda"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <p className="text-xs text-muted-foreground">PIN 4–6 digit yang diberikan oleh pemilik toko.</p>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</>
            ) : (
              "Masuk"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
