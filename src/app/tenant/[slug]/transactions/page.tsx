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
import { ShoppingCart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTenantProfileBySlug } from "@/lib/services/tenant";
import { getAllTransactions } from "@/lib/services/transactions";

const formatIDR = (num: number) => 
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

const formatDate = (iso: string) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
};

interface TransactionsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TransactionsPage({ params }: TransactionsPageProps) {
  const { slug } = await params;

  const profileData = await getTenantProfileBySlug(slug);
  const orgId = profileData?.org?.id;
  const transactions = orgId ? await getAllTransactions(orgId, 100) : [];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Transaksi</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Lihat semua histori penjualan dari semua kasir.
          </p>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Semua Transaksi</CardTitle>
          <CardDescription className="text-xs">Daftar {transactions.length} transaksi terbaru.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <ShoppingCart className="mb-3 h-12 w-12 opacity-20" />
              <p className="text-sm">Belum ada transaksi. Mulai berjualan via POS Kasir!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">ID Transaksi</TableHead>
                  <TableHead>Tanggal & Waktu</TableHead>
                  <TableHead>Kasir</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Total Nilai</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((trx: any) => (
                  <TableRow key={trx.id}>
                    <TableCell className="pl-6">
                      <span className="font-mono font-medium text-sm">{trx.id.substring(0, 8).toUpperCase()}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(trx.created_at)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {trx.staff?.full_name || "Kasir"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-normal capitalize">
                        {trx.payment_method?.replace(/_/g, " ") || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-semibold">
                      {formatIDR(trx.total_amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={trx.status === "completed" ? "secondary" : "destructive"} 
                        className={trx.status === "completed" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}
                      >
                        {trx.status === "completed" ? "Sukses" : "Refund"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs">
                        <ExternalLink size={14} /> Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
