import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Building2, CreditCard, User, Sparkles, CheckCircle2 } from "lucide-react";

interface SettingsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { slug } = await params;

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Kelola profil bisnis, langganan paket, dan konfigurasi sistem.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-muted/50 border border-border/40 mb-4 h-11">
          <TabsTrigger value="general" className="gap-2 data-[state=active]:shadow-sm rounded-lg">
            <Building2 size={14} /> Profil Bisnis
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2 data-[state=active]:shadow-sm rounded-lg">
            <CreditCard size={14} /> Langganan & Tagihan
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2 data-[state=active]:shadow-sm rounded-lg">
            <User size={14} /> Akun Owner
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Informasi Bisnis</CardTitle>
              <CardDescription>
                Detail ini akan ditampilkan pada struk belanja (POS) dan faktur.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-2">
                <Label htmlFor="orgName">Nama Bisnis</Label>
                <Input id="orgName" defaultValue="Bisnis Saya" className="max-w-md bg-muted/30" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subdomain">Subdomain URL (Tidak bisa diubah)</Label>
                <div className="flex items-center gap-2 max-w-md">
                  <Input id="subdomain" value={slug} disabled className="bg-muted text-muted-foreground flex-1" />
                  <span className="text-sm font-mono text-muted-foreground bg-muted px-3 py-2 rounded-md border border-border/50">
                    .bizzy.id
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">Hubungi support jika ingin mengganti nama subdomain.</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Nomor Telepon Bisnis</Label>
                <Input id="phone" placeholder="0812-3456-7890" className="max-w-md bg-muted/30" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Alamat Lengkap</Label>
                <Textarea id="address" placeholder="Masukkan alamat lengkap bisnis Anda..." className="max-w-md bg-muted/30 min-h-[100px]" />
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/40 bg-muted/10 py-4">
              <Button className="shadow-md shadow-primary/20">Simpan Perubahan</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card className="border-indigo-500/30 shadow-sm bg-gradient-to-br from-indigo-500/5 to-transparent relative overflow-hidden">
            <div className="absolute -top-10 -right-10 text-indigo-500/10 rotate-12">
              <Sparkles size={120} />
            </div>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Paket Anda Saat Ini
                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 py-0.5 pointer-events-none">PRO</Badge>
              </CardTitle>
              <CardDescription>
                Anda sedang dalam masa percobaan aktif.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={16} className="text-indigo-500" />
                  <span>Maksimal 5 Gudang/Cabang</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={16} className="text-indigo-500" />
                  <span>Akun Staff Tanpa Batas</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={16} className="text-indigo-500" />
                  <span>Laporan Penjualan Lanjutan (Analytics)</span>
                </div>
              </div>
              <div className="bg-background rounded-lg p-4 border border-indigo-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Jatuh Tempo Berikutnya</p>
                  <p className="text-xs text-muted-foreground mt-0.5">14 Mei 2026</p>
                </div>
                <p className="font-bold text-lg font-heading">Rp 199.000 <span className="text-xs font-normal text-muted-foreground font-sans">/bln</span></p>
              </div>
            </CardContent>
            <CardFooter className="gap-3 pt-2">
              <Button className="shadow-md shadow-primary/20">Perbarui Paket</Button>
              <Button variant="outline" className="bg-white">Bandingkan Paket Lain</Button>
            </CardFooter>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Riwayat Tagihan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Belum ada riwayat tagihan.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Akun Owner</CardTitle>
              <CardDescription>
                Informasi login utama yang didaftarkan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-2">
                <Label>Metode Login</Label>
                <div className="flex items-center gap-2 bg-muted/50 w-fit px-4 py-2 rounded-lg border border-border/50">
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center p-0.5">
                    <svg viewBox="0 0 24 24" className="w-full h-full"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path></svg>
                  </div>
                  <span className="text-sm font-medium">Google SSO (owner@example.com)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
