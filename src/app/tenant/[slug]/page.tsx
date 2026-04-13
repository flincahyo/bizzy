import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";
import { getTenantProfileBySlug, getTenantDashboardStats } from "@/lib/services/tenant";
import { getRecentTransactions } from "@/lib/services/transactions";

interface DashboardPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { slug } = await params;
  
  // Fetch real data
  const profileData = await getTenantProfileBySlug(slug);
  const orgId = profileData?.org?.id;
  
  if (!orgId) {
    return (
      <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[50vh]">
        <Activity className="animate-pulse mb-4 text-primary" size={48} />
        <h2 className="text-xl font-bold font-heading text-foreground mb-2">Toko Belum Disetup</h2>
        <p>Silakan verifikasi database Anda atau jalankan script Seed Dummy Data terlebih dahulu.</p>
      </div>
    );
  }

  const [statsData, recentTransactions] = await Promise.all([
    getTenantDashboardStats(orgId),
    getRecentTransactions(orgId, 5)
  ]);

  const stats = [
    {
      title: "Total Penjualan",
      value: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(statsData.totalRevenue),
      change: "Real-time",
      trend: "up",
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Transaksi Selesai",
      value: statsData.salesThisMonth.toString(),
      change: "Real-time",
      trend: "up",
      icon: Activity,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Total Karyawan",
      value: statsData.totalStaff.toString(),
      change: "Aktif",
      trend: "up",
      icon: Users,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Total Produk",
      value: statsData.totalProducts.toString(),
      change: "Tersimpan",
      trend: "up",
      icon: Package,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight">
          Selamat Datang 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Berikut ringkasan bisnis <span className="font-semibold text-foreground">{profileData.org.name}</span> terkini.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Placeholder Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Grafik Sinkronisasi</CardTitle>
            <CardDescription>Grafik akan tersedia pada update fitur analitik berikutnya.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 bg-muted/50 rounded-xl flex items-center justify-center border border-dashed">
              <div className="text-center">
                <TrendingUp className="mx-auto text-muted-foreground mb-4" size={32} />
                <p className="text-sm text-muted-foreground">Grafik akan ditampilkan di sini</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Transaksi Terkini
              <Badge variant="secondary">
                {recentTransactions.length} Total
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            {recentTransactions.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <ShoppingCart className="mx-auto mb-2 opacity-20" size={24} />
                <p className="text-xs">Belum ada transaksi</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {recentTransactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center gap-3 p-4 hover:bg-muted/20 transition-colors">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <ShoppingCart size={15} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate capitalize">
                        {tx.payment_method || 'Kasir'}
                        {tx.staff ? ` · ${tx.staff.full_name}` : ''}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate uppercase">
                        {tx.id.substring(0, 8)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold font-mono tracking-tight">
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(tx.total_amount)}
                      </p>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[9px] px-1.5 py-0 mt-1 uppercase tracking-widest font-bold",
                          tx.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                        )}
                      >
                        {tx.status === "completed" ? "Berhasil" : "Gagal"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
