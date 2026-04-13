"use client";

import { useState } from "react";
import { Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "bizzy.sbs";

export default function FindStorePage() {
  const [slug, setSlug] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
    if (!cleaned) return;
    window.location.href = `https://${cleaned}.${ROOT_DOMAIN}/login`;
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
          <Building2 className="size-6" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Temukan Toko Anda</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Masukkan nama subdomain toko Anda untuk melanjutkan
          </p>
        </div>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Nama Toko (Subdomain)</Label>
            <div className="flex items-center rounded-lg border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary">
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="namatoko"
                className="border-0 focus-visible:ring-0 flex-1"
                required
              />
              <span className="px-3 text-sm text-muted-foreground border-l bg-muted py-2 whitespace-nowrap">
                .{ROOT_DOMAIN}
              </span>
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg">
            Lanjutkan <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center">
          Belum punya toko?{" "}
          <a href="/register" className="underline hover:text-primary">Daftar sekarang</a>
        </p>
      </div>
    </div>
  );
}
