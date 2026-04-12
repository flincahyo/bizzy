import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Package, Plus, Search, MoreHorizontal, Pencil, Trash2, ImageOff } from "lucide-react";

// Mock data - will be replaced with Supabase queries
const products = [
  { id: "1", name: "Kopi Susu Aren", category: "Minuman", price: 35000, stock: 120, sku: "KSA-001", status: "active" },
  { id: "2", name: "Croissant Original", category: "Makanan", price: 28000, stock: 8, sku: "CRO-001", status: "low_stock" },
  { id: "3", name: "Matcha Latte", category: "Minuman", price: 38000, stock: 95, sku: "MLC-001", status: "active" },
  { id: "4", name: "Pisang Goreng", category: "Makanan", price: 15000, stock: 0, sku: "PGR-001", status: "out_of_stock" },
  { id: "5", name: "Es Teh Manis", category: "Minuman", price: 8000, stock: 200, sku: "ETM-001", status: "active" },
];

const statusConfig = {
  active: { label: "Aktif", className: "bg-emerald-100 text-emerald-700" },
  low_stock: { label: "Stok Rendah", className: "bg-amber-100 text-amber-700" },
  out_of_stock: { label: "Habis", className: "bg-rose-100 text-rose-700" },
};

interface ProductsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { slug } = await params;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">Produk</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola katalog produk bisnis Anda
          </p>
        </div>
        <Button className="rounded-xl shadow-md shadow-primary/20 gap-2">
          <Plus size={16} />
          Tambah Produk
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari produk..." className="pl-9 rounded-lg h-9 text-sm" />
        </div>
      </div>

      {/* Product Table */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Semua Produk
            <Badge variant="secondary" className="ml-2 text-xs">{products.length}</Badge>
          </CardTitle>
          <CardDescription className="text-xs">Klik aksi untuk mengedit atau menghapus produk.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/60">
                <TableHead className="text-xs font-semibold pl-6">Produk</TableHead>
                <TableHead className="text-xs font-semibold">SKU</TableHead>
                <TableHead className="text-xs font-semibold">Kategori</TableHead>
                <TableHead className="text-xs font-semibold">Harga Jual</TableHead>
                <TableHead className="text-xs font-semibold">Stok</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold w-16">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const status = statusConfig[product.status as keyof typeof statusConfig];
                return (
                  <TableRow key={product.id} className="border-border/40 hover:bg-muted/30">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                          <ImageOff size={14} className="text-muted-foreground/50" />
                        </div>
                        <span className="text-sm font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{product.sku}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs rounded-md font-normal">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(product.price)}
                    </TableCell>
                    <TableCell className="text-sm">{product.stock}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.className}`}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreHorizontal size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem className="gap-2 text-sm rounded-lg">
                            <Pencil size={13} /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-sm rounded-lg text-destructive focus:text-destructive">
                            <Trash2 size={13} /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
