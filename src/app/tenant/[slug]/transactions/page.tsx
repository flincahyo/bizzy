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
import { Search, MapPin, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const transactions = [
  { id: "TRX-1045", date: "Hari Ini, 14:30", customer: "Umum", items: 3, total: 115000, method: "QRIS", status: "completed", cashier: "Budi Santoso" },
  { id: "TRX-1044", date: "Hari Ini, 13:15", customer: "Umum", items: 1, total: 35000, method: "Tunai", status: "completed", cashier: "Rina Kumala" },
  { id: "TRX-1043", date: "Hari Ini, 11:20", customer: "Pak Anas", items: 5, total: 245000, method: "Kartu Debit", status: "completed", cashier: "Budi Santoso" },
  { id: "TRX-1042", date: "Hari Ini, 09:45", customer: "Umum", items: 2, total: 55000, method: "Tunai", status: "refunded", cashier: "Budi Santoso" },
  { id: "TRX-1041", date: "Kemarin, 19:30", customer: "Ibu Lani", items: 4, total: 180000, method: "QRIS", status: "completed", cashier: "Rina Kumala" },
];

const formatIDR = (num: number) => 
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

interface TransactionsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TransactionsPage({ params }: TransactionsPageProps) {
  const { slug } = await params;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">Riwayat Transaksi</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Lihat semua histori penjualan dan cetak ulang struk.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari ID transaksi..." className="pl-9 rounded-lg h-9 text-sm" />
        </div>
        <Button variant="outline" className="h-9 gap-2">
          Filter Tanggal
        </Button>
      </div>

      {/* Table */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Semua Transaksi</CardTitle>
          <CardDescription className="text-xs">Daftar transaksi terbaru dari semua kasir.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/60">
                <TableHead className="text-xs font-semibold pl-6">ID Transaksi</TableHead>
                <TableHead className="text-xs font-semibold">Tanggal & Waktu</TableHead>
                <TableHead className="text-xs font-semibold">Kasir</TableHead>
                <TableHead className="text-xs font-semibold">Metode</TableHead>
                <TableHead className="text-xs font-semibold">Total Nilai</TableHead>
                <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                <TableHead className="text-xs font-semibold text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((trx) => (
                <TableRow key={trx.id} className="border-border/40 hover:bg-muted/30">
                  <TableCell className="pl-6">
                    <span className="font-mono font-medium text-sm">{trx.id}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{trx.date}</TableCell>
                  <TableCell className="text-sm">{trx.cashier}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-normal">
                      {trx.method}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-semibold">{formatIDR(trx.total)}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}
