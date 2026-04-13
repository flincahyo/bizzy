import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Package, MoreHorizontal, Pencil, ImageOff } from "lucide-react";
import { getTenantProfileBySlug } from "@/lib/services/tenant";
import { getProducts, getWarehouses } from "@/lib/services/products";
import { AddProductDialog } from "@/components/dashboard/AddProductDialog";
import { EditProductDialog } from "@/components/dashboard/EditProductDialog";
import { DeleteAction } from "@/components/dashboard/DeleteAction";
import { deleteProduct } from "@/lib/actions/dashboard";

function getStockStatus(qty: number, lowWatermark = 10): { label: string; variant: "default" | "secondary" | "destructive" } {
  if (qty <= 0) return { label: "Habis", variant: "destructive" };
  if (qty <= lowWatermark) return { label: "Stok Rendah", variant: "secondary" };
  return { label: "Aktif", variant: "default" };
}

interface ProductsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { slug } = await params;
  
  const profileData = await getTenantProfileBySlug(slug);
  const orgId = profileData?.org?.id;
  
  const [products, warehouses] = await Promise.all([
    orgId ? getProducts(orgId) : [],
    orgId ? getWarehouses(orgId) : [],
  ]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produk</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola katalog produk bisnis Anda
          </p>
        </div>
        {orgId && <AddProductDialog orgId={orgId} slug={slug} warehouses={warehouses} />}
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3 bg-muted/30 border-b border-border/30">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            Semua Produk
            <Badge variant="outline" className="ml-2 text-xs font-normal">{products.length} Total</Badge>
          </CardTitle>
          <CardDescription className="text-xs">Klik aksi untuk mengedit atau menghapus produk.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/60">
                <TableHead className="text-xs font-semibold pl-6 h-10">Produk</TableHead>
                <TableHead className="text-xs font-semibold h-10">SKU</TableHead>
                <TableHead className="text-xs font-semibold h-10">Kategori</TableHead>
                <TableHead className="text-xs font-semibold h-10">Harga Jual</TableHead>
                <TableHead className="text-xs font-semibold h-10">Stok (Semua Gudang)</TableHead>
                <TableHead className="text-xs font-semibold h-10">Status</TableHead>
                <TableHead className="text-xs font-semibold w-16 h-10">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <Package className="mx-auto opacity-20 mb-2" size={32} />
                    <p className="text-sm">Belum ada data produk</p>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const totalStock = product.inventory_levels?.reduce(
                    (sum: number, inv: any) => sum + (inv.quantity || 0), 0
                  ) || 0;
                  const status = getStockStatus(totalStock);

                  // Bind creates a serializable reference — safe to pass to Client Components
                  const boundDelete = deleteProduct.bind(null, product.id, slug);

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <ImageOff size={16} className="text-muted-foreground" />
                            )}
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.sku || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category?.name || "Lainnya"}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(product.price)}
                      </TableCell>
                      <TableCell>{totalStock} unit</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="pr-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
                            <MoreHorizontal size={16} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <EditProductDialog orgId={orgId} slug={slug} product={product} />
                            <DeleteAction deleteAction={boundDelete} label="Hapus Produk" />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
