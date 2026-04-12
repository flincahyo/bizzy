import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";

const stats = [
  {
    title: "Total Penjualan Hari Ini",
    value: "Rp 4.200.000",
    change: "+12.5%",
    trend: "up",
    icon: ShoppingCart,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Transaksi",
    value: "42",
    change: "+8.1%",
    trend: "up",
    icon: Activity,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    title: "Produk Stok Rendah",
    value: "7",
    change: "-2",
    trend: "down",
    icon: Package,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    title: "Total Produk",
    value: "148",
    change: "+3",
    trend: "up",
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

const recentTransactions = [
  { id: "TRX-0042", product: "Kopi Susu Aren", time: "10:42", amount: "Rp 35.000", status: "completed" },
  { id: "TRX-0041", product: "Croissant + Latte", time: "10:18", amount: "Rp 62.000", status: "completed" },
  { id: "TRX-0040", product: "Es Teh Manis x3", time: "09:55", amount: "Rp 24.000", status: "completed" },
  { id: "TRX-0039", product: "Matcha Latte", time: "09:30", amount: "Rp 38.000", status: "refunded" },
  { id: "TRX-0038", product: "Pisang Goreng x5", time: "09:12", amount: "Rp 25.000", status: "completed" },
];

interface DashboardPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { slug } = await params;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight">
          Selamat Datang 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Berikut ringkasan bisnis <span className="font-semibold text-foreground">{slug}</span> hari ini.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1.5">{stat.title}</p>
                  <p className="text-2xl font-bold font-heading tracking-tight">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === "up" ? (
                      <ArrowUpRight size={13} className="text-emerald-500" />
                    ) : (
                      <ArrowDownRight size={13} className="text-rose-500" />
                    )}
                    <span className={`text-xs font-semibold ${stat.trend === "up" ? "text-emerald-500" : "text-rose-500"}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs kemarin</span>
                  </div>
                </div>
                <div className={`${stat.bg} p-2.5 rounded-xl`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Placeholder Chart */}
        <Card className="lg:col-span-2 border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Grafik Penjualan (7 Hari)</CardTitle>
            <CardDescription>Total penjualan harian Anda dalam seminggu terakhir.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 bg-muted/40 rounded-xl flex items-center justify-center border-2 border-dashed border-border/50">
              <div className="text-center">
                <TrendingUp className="mx-auto text-muted-foreground/50 mb-3" size={32} />
                <p className="text-xs text-muted-foreground">Grafik akan ditampilkan di sini</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Transaksi Terkini</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center shrink-0">
                  <ShoppingCart size={15} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{tx.product}</p>
                  <p className="text-[10px] text-muted-foreground">{tx.time} · {tx.id}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold">{tx.amount}</p>
                  <Badge
                    variant={tx.status === "completed" ? "secondary" : "destructive"}
                    className="text-[10px] px-1.5 py-0 mt-0.5"
                  >
                    {tx.status === "completed" ? "Lunas" : "Refund"}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
