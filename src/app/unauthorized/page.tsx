import Link from "next/link";
import { ShieldX, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "bizzy.sbs";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[30rem] w-[40rem] rounded-full bg-destructive/10 blur-3xl opacity-60" />
      </div>

      <div className="flex flex-col items-center gap-6 max-w-md">
        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 shadow-lg">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Akses Ditolak</h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Anda tidak memiliki izin untuk mengakses toko ini.
            Pastikan Anda login dengan akun yang terdaftar sebagai anggota toko ini.
          </p>
        </div>

        {/* Error code */}
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-2 text-sm text-muted-foreground font-mono">
          Error 403 — Forbidden
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full sm:flex-row sm:justify-center">
          <Button variant="outline" asChild>
            <a href={`https://${rootDomain}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </a>
          </Button>
          <Button variant="destructive" asChild>
            <a href={`https://${rootDomain}/login`}>
              <LogOut className="mr-2 h-4 w-4" />
              Login ke Akun Lain
            </a>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Butuh bantuan?{" "}
          <Link href={`https://${rootDomain}#contact`} className="underline hover:text-primary">
            Hubungi Dukungan Bizzy
          </Link>
        </p>
      </div>
    </div>
  );
}
