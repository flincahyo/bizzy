import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, ShoppingCart, DollarSign, BarChart3, Package } from "lucide-react";
import { getTenantProfileBySlug } from "@/lib/services/tenant";
import { getTransactionStats, getAllTransactions } from "@/lib/services/transactions";

const formatIDR = (num: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

interface AnalyticsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { slug } = await params;

  const profileData = await getTenantProfileBySlug(slug);
  const orgId = profileData?.org?.id;

  const [stats, transactions] = await Promise.all([
    orgId ? getTransactionStats(orgId) : Promise.resolve({ monthlyRevenue: 0, todayRevenue: 0, monthlyCount: 0, todayCount: 0 }),
    orgId ? getAllTransactions(orgId, 10) : Promise.resolve([]),
  ]);

  // Simple top products aggregation
  const productSales: Record<string, { name: string, qty: number, revenue: number }> = {};
  for (const trx of transactions) {
    for (const item of (trx as any).transaction_items ?? []) {
      if (!productSales[item.product_name]) {
        productSales[item.product_name] = { name: item.product_name, qty: 0, revenue: 0 };
      }
      productSales[item.product_name].qty += item.quantity;
      productSales[item.product_name].revenue += item.subtotal;
    }
  }
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const summaryStats = [
    {
      title: "Pendapatan Bulan Ini",
      value: formatIDR(stats.monthlyRevenue),
      sub: `${stats.monthlyCount} transaksi`,
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Pendapatan Hari Ini",
      value: formatIDR(stats.todayRevenue),
      sub: `${stats.todayCount} transaksi`,
      icon: ShoppingCart,
      trend: "up",
    },
    {
      title: "Rata-rata Transaksi",
      value: stats.monthlyCount > 0 ? formatIDR(stats.monthlyRevenue / stats.monthlyCount) : "Rp 0",
      sub: "per transaksi bulan ini",
      icon: BarChart3,
      trend: "neutral",
    },
    {
      title: "Produk Terjual",
      value: topProducts.reduce((s, p) => s + p.qty, 0).toString(),
      sub: "unit (10 transaksi terakhir)",
      icon: Package,
      trend: "up",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Laporan & Analitik</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ringkasan performa bisnis Anda secara real-time.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {stat.trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                {stat.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                {stat.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
            <CardDescription>Berdasarkan 10 transaksi terakhir</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {topProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Package className="mb-3 h-10 w-10 opacity-20" />
                <p className="text-sm">Belum ada data penjualan produk.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Produk</TableHead>
                    <TableHead className="text-center">Terjual</TableHead>
                    <TableHead className="text-right pr-6">Pendapatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, i) => (
                    <TableRow key={product.name}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-md border bg-muted text-xs font-bold text-muted-foreground">
                            {i + 1}
                          </div>
                          <span className="text-sm font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{product.qty} unit</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6 text-sm font-semibold">
                        {formatIDR(product.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terkini</CardTitle>
            <CardDescription>10 transaksi terakhir</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <ShoppingCart className="mb-3 h-10 w-10 opacity-20" />
                <p className="text-sm">Belum ada transaksi tercatat.</p>
              </div>
            ) : (
              <div className="divide-y">
                {transactions.slice(0, 8).map((trx: any) => (
                  <div key={trx.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="text-sm font-medium font-mono">{trx.id.substring(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {trx.payment_method?.replace(/_/g, " ") || "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatIDR(trx.total_amount)}</p>
                      <Badge
                        variant={trx.status === "completed" ? "secondary" : "destructive"}
                        className={
                          trx.status === "completed"
                            ? "text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                            : "text-[10px]"
                        }
                      >
                        {trx.status === "completed" ? "Sukses" : "Refund"}
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
