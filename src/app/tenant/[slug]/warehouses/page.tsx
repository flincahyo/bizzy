import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Pencil, Trash2, Warehouse as WarehouseIcon, MapPinOff } from "lucide-react";
import { getTenantProfileBySlug } from "@/lib/services/tenant";
import { getWarehouses } from "@/lib/services/products";
import { AddWarehouseDialog } from "@/components/dashboard/AddWarehouseDialog";
import { deleteWarehouse } from "@/lib/actions/dashboard";

interface WarehousesPageProps {
  params: Promise<{ slug: string }>;
}

export default async function WarehousesPage({ params }: WarehousesPageProps) {
  const { slug } = await params;
  
  const profileData = await getTenantProfileBySlug(slug);
  const orgId = profileData?.org?.id;
  
  const warehouses = orgId ? await getWarehouses(orgId) : [];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gudang & Cabang</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola lokasi penyimpanan stok dan cabang bisnis Anda
          </p>
        </div>
        {orgId && <AddWarehouseDialog orgId={orgId} slug={slug} hasWarehouses={warehouses.length > 0} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-border/40 pt-4 mt-4">
        {warehouses.length === 0 && (
           <Card className="border-border/60 shadow-sm flex flex-col items-center justify-center min-h-[220px] text-muted-foreground col-span-full">
              <MapPinOff size={32} className="opacity-20 mb-3" />
              <p className="font-semibold text-sm text-foreground">Belum ada gudang terdaftar</p>
           </Card>
        )}
        
        {warehouses.map((wh) => (
          <Card key={wh.id} className="relative overflow-hidden">
            {wh.is_default && (
              <Badge className="absolute top-2 right-2">Utama</Badge>
            )}
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <WarehouseIcon size={18} className="text-muted-foreground" />
                <CardTitle className="text-base font-semibold">{wh.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin size={15} className="mt-0.5 shrink-0" />
                <p className="leading-snug">{wh.address || 'Alamat belum diatur'}</p>
              </div>
              
              <div className="flex gap-2 pt-4 mt-auto">
                <Button variant="outline" size="sm" className="flex-1">
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
                {!wh.is_default && (
                  <Button variant="outline" size="sm" className="flex-1 text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Hapus
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Placeholder / Upsell for more warehouses */}
        {warehouses.length > 0 && (
          <Card className="border-border/60 border-dashed border-2 shadow-none bg-transparent hover:bg-muted/20 transition-colors cursor-pointer flex items-center justify-center min-h-[220px]">
            <div className="text-center p-6 text-muted-foreground">
              <WarehouseIcon size={32} className="mx-auto mb-3 opacity-50" />
              <p className="font-semibold text-sm text-foreground">Buka Cabang Baru?</p>
              <p className="text-xs mt-1">Tambah lokasi gudang/toko baru minimal paket Pro.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
