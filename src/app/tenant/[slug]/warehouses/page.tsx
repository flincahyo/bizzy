import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MapPin, Package, Pencil, Trash2, Warehouse as WarehouseIcon } from "lucide-react";

// Mock data
const warehouses = [
  { id: "1", name: "Gudang Pusat (Jakarta)", address: "Jl. Sudirman No 123, Jakarta Selatan", capacity: "85%", isDefault: true },
  { id: "2", name: "Cabang Bandung", address: "Jl. Braga No 45, Sumurbandung", capacity: "42%", isDefault: false },
];

interface WarehousesPageProps {
  params: Promise<{ slug: string }>;
}

export default async function WarehousesPage({ params }: WarehousesPageProps) {
  const { slug } = await params;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">Gudang & Cabang</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola lokasi penyimpanan stok dan cabang bisnis Anda
          </p>
        </div>
        <Button className="rounded-xl shadow-md shadow-primary/20 gap-2">
          <Plus size={16} />
          Tambah Gudang
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-border/40 pt-4 mt-4">
        {warehouses.map((wh) => (
          <Card key={wh.id} className="border-border/60 shadow-sm relative overflow-hidden group">
            {wh.isDefault && (
              <div className="absolute top-0 right-0 py-1 px-3 bg-primary text-primary-foreground text-[10px] font-bold rounded-bl-lg">
                UTAMA
              </div>
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
                <p className="leading-snug">{wh.address}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package size={15} className="shrink-0" />
                <p>Kapasitas terpakai: <span className="font-semibold text-foreground">{wh.capacity}</span></p>
              </div>
              
              <div className="flex gap-2 pt-2 border-t border-border/40">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-2 rounded-lg">
                  <Pencil size={13} /> Edit
                </Button>
                {!wh.isDefault && (
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-2 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20">
                    <Trash2 size={13} /> Hapus
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Placeholder / Upsell for more warehouses */}
        <Card className="border-border/60 border-dashed border-2 shadow-none bg-transparent hover:bg-muted/20 transition-colors cursor-pointer flex items-center justify-center min-h-[220px]">
          <div className="text-center p-6 text-muted-foreground">
            <WarehouseIcon size={32} className="mx-auto mb-3 opacity-50" />
            <p className="font-semibold text-sm text-foreground">Buka Cabang Baru?</p>
            <p className="text-xs mt-1">Tambah lokasi gudang/toko baru minimal paket Pro.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
