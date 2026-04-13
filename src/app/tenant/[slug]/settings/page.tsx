import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Building2, CreditCard, User, Sparkles, CheckCircle2, Warehouse } from "lucide-react";
import { getTenantProfileBySlug } from "@/lib/services/tenant";
import { createClient } from "@/lib/supabase/server";
import { updateOrgSettings } from "@/lib/actions/dashboard";
import { DeleteAccountDialog } from "@/components/dashboard/DeleteAccountDialog";
import { UpgradePackageDialog } from "@/components/dashboard/UpgradePackageDialog";
import { AppsSubscription, DEFAULT_SUBSCRIPTION } from "@/lib/features";

interface SettingsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { slug } = await params;

  const profileData = await getTenantProfileBySlug(slug);
  const org = profileData?.org;
  const orgId = org?.id ?? "";

  // Get current user profile
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get billing invoices
  const { data: invoices } = await supabase
    .from("billing_invoices")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(5);

  const appsSubscription: AppsSubscription = org?.apps_subscription || DEFAULT_SUBSCRIPTION;
  const posTier = appsSubscription.pos.tier;
  const invTier = appsSubscription.inventory.tier;

  const posTierLabels: Record<string, string> = { starter: "Starter", growth: "Growth", pro: "Pro" };
  const invTierLabels: Record<string, string> = { starter: "Starter", growth: "Growth", pro: "Pro" };
  const posPrices: Record<string, string> = { starter: "Gratis", growth: "Rp 129.000/bln", pro: "Rp 299.000/bln" };
  const invPrices: Record<string, string> = { starter: "Gratis", growth: "Rp 149.000/bln", pro: "Rp 349.000/bln" };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Kelola profil bisnis, langganan paket, dan konfigurasi sistem.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general" className="gap-2">
            <Building2 size={14} /> Profil Bisnis
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard size={14} /> Langganan
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <User size={14} /> Akun Owner
          </TabsTrigger>
        </TabsList>
        
        {/* ─── General Tab ─────────────────────────────────────────── */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Bisnis</CardTitle>
              <CardDescription>
                Detail ini akan ditampilkan pada struk belanja (POS) dan faktur.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <form id="settings-form" action={updateOrgSettings}>
                <input type="hidden" name="orgId" value={orgId} />
                <input type="hidden" name="slug" value={slug} />
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nama Bisnis</Label>
                    <Input id="name" name="name" defaultValue={org?.name ?? ""} className="max-w-md" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subdomain">Subdomain URL (Tidak bisa diubah)</Label>
                    <div className="flex items-center gap-2 max-w-md">
                      <Input id="subdomain" value={slug} disabled className="bg-muted text-muted-foreground flex-1" />
                      <span className="text-sm font-mono text-muted-foreground bg-muted px-3 py-2 rounded-md border">
                        .bizzy.id
                      </span>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Nomor Telepon Bisnis</Label>
                    <Input id="phone" name="phone" defaultValue={(org as any)?.phone ?? ""} placeholder="0812-3456-7890" className="max-w-md" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Alamat Lengkap</Label>
                    <Textarea id="address" name="address" defaultValue={(org as any)?.address ?? ""} placeholder="Masukkan alamat lengkap bisnis Anda..." className="max-w-md min-h-[100px]" />
                  </div>
                </div>
                <div className="pt-5">
                  <Button type="submit">Simpan Perubahan</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Billing Tab ─────────────────────────────────────────── */}
        <TabsContent value="billing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* POS Subscription Card */}
            <Card className="relative overflow-hidden border-primary/20">
              <div className="absolute -top-10 -right-10 text-primary/5 rotate-12">
                <Sparkles size={140} />
              </div>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Bizzy POS (Kasir)
                  <Badge className="pointer-events-none capitalize">{posTierLabels[posTier]}</Badge>
                </CardTitle>
                <CardDescription>
                  {posTier === "starter" ? "Paket kasir dasar (Maks. 100 Trx & 1 Kasir)." : "Langganan kasir aktif."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 border flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Biaya Layanan</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Per bulan</p>
                  </div>
                  <p className="font-bold text-lg">{posPrices[posTier]}</p>
                </div>
              </CardContent>
              <CardFooter className="gap-3 pt-0 text-sm">
                <UpgradePackageDialog moduleType="pos" currentTier={posTier} />
              </CardFooter>
            </Card>

            {/* Inventory Subscription Card */}
            <Card className="relative overflow-hidden border-primary/20">
              <div className="absolute -top-10 -right-10 text-primary/5 rotate-12">
                <Warehouse size={140} />
              </div>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Bizzy Inventory
                  <Badge className="pointer-events-none capitalize">{invTierLabels[invTier]}</Badge>
                </CardTitle>
                <CardDescription>
                  {invTier === "starter" ? "Paket gudang dasar (Maks. 50 Item & 1 Gudang)." : "Langganan gudang aktif."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 border flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Biaya Layanan</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Per bulan</p>
                  </div>
                  <p className="font-bold text-lg">{invPrices[invTier]}</p>
                </div>
              </CardContent>
              <CardFooter className="gap-3 pt-0 text-sm">
                <UpgradePackageDialog moduleType="inventory" currentTier={invTier} />
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Riwayat Tagihan</CardTitle>
            </CardHeader>
            <CardContent>
              {!invoices || invoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="mx-auto mb-3 opacity-20" size={32} />
                  <p className="text-sm">Belum ada riwayat tagihan.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium font-mono">{inv.gateway_invoice_id}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(inv.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(inv.amount)}
                        </p>
                        <Badge variant={inv.status === "paid" ? "secondary" : "destructive"} className={inv.status === "paid" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px]" : "text-[10px]"}>
                          {inv.status === "paid" ? "Lunas" : inv.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Account Tab ─────────────────────────────────────────── */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Akun Owner</CardTitle>
              <CardDescription>Informasi login utama yang didaftarkan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-2">
                <Label>Metode Login</Label>
                <div className="flex items-center gap-2 bg-muted/50 w-fit px-4 py-2 rounded-lg border">
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center p-0.5">
                    <svg viewBox="0 0 24 24" className="w-full h-full"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path></svg>
                  </div>
                  <span className="text-sm font-medium">Google SSO ({user?.email ?? "-"})</span>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Email Terdaftar</Label>
                <Input value={user?.email ?? "-"} disabled className="max-w-md bg-muted text-muted-foreground" />
              </div>
              <div className="grid gap-2">
                <Label>ID Akun</Label>
                <Input value={user?.id ?? "-"} disabled className="max-w-md bg-muted text-muted-foreground font-mono text-xs" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-5 border-destructive/20 bg-destructive/5 sm:bg-transparent">
            <CardHeader>
              <CardTitle className="text-lg text-destructive">Hapus Akun & Data</CardTitle>
              <CardDescription>
                Tindakan ini permanen dan tidak dapat dibatalkan. Menghapus akun akan <b>menghapus seluruh bisnis Anda beserta semua data di dalamnya</b>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeleteAccountDialog />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
