"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { createOrganization } from "./actions";

export default function OnboardingPage() {
  const [orgName, setOrgName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSlugChange = (name: string) => {
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !slug.trim()) {
      toast.error("Nama toko dan slug tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createOrganization(orgName.trim(), slug.trim());
      toast.success("Toko berhasil dibuat! Mengalihkan ke dashboard...");
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "bizzy.sbs";
      setTimeout(() => {
        window.location.href = `https://${result.slug}.${rootDomain}`;
      }, 1500);
    } catch (err: any) {
      toast.error(err.message ?? "Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Building2 className="size-6" />
                </div>
              </div>
              <CardTitle className="text-2xl">Buat Toko Anda</CardTitle>
              <CardDescription>
                Selamat datang! Isi data toko Anda untuk memulai menggunakan Bizzy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="org-name">Nama Toko</Label>
                  <Input
                    id="org-name"
                    placeholder="contoh: Kopi Senja"
                    value={orgName}
                    onChange={(e) => {
                      setOrgName(e.target.value);
                      handleSlugChange(e.target.value);
                    }}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="slug">Alamat Subdomain Toko</Label>
                  <div className="flex items-center rounded-md border overflow-hidden">
                    <Input
                      id="slug"
                      placeholder="kopi-senja"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      required
                    />
                    <span className="px-3 py-2 text-sm text-muted-foreground shrink-0 border-l bg-muted whitespace-nowrap">.bizzy.sbs</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Hanya huruf kecil, angka, dan tanda hubung. Tidak bisa diubah setelah dibuat.
                  </p>
                </div>

                <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Membuat toko...
                    </>
                  ) : (
                    <>
                      Mulai Sekarang
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center text-center">
              <span className="text-xs text-muted-foreground">
                Dengan melanjutkan, Anda setuju dengan Ketentuan Layanan Bizzy.
              </span>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

