import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { MapPin, Pencil, Trash2, Warehouse as WarehouseIcon, MapPinOff, ArrowRightLeft, Clock } from "lucide-react";
import { getTenantProfileBySlug } from "@/lib/services/tenant";
import { getWarehouses, getTransferOrders } from "@/lib/services/products";
import { AddWarehouseDialog } from "@/components/dashboard/AddWarehouseDialog";
import { RequestTransferDialog } from "@/components/dashboard/RequestTransferDialog";
import { TransferOrderActions } from "@/components/dashboard/TransferOrderActions";
import { deleteWarehouse } from "@/lib/actions/dashboard";

interface WarehousesPageProps {
  params: Promise<{ slug: string }>;
}

function getStatusBadge(status: string) {
  switch(status) {
    case 'pending': return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3"/> Menunggu</Badge>;
    case 'processing': return <Badge variant="default" className="bg-blue-500">Diproses</Badge>;
    case 'shipped': return <Badge variant="default" className="bg-orange-500">Dikirim</Badge>;
    case 'completed': return <Badge variant="default" className="bg-green-600">Terima</Badge>;
    case 'rejected': return <Badge variant="destructive">Ditolak</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

export default async function WarehousesPage({ params }: WarehousesPageProps) {
  const { slug } = await params;
  
  const profileData = await getTenantProfileBySlug(slug);
  const orgId = profileData?.org?.id;
  
  const [warehouses, transferOrders] = await Promise.all([
    orgId ? getWarehouses(orgId) : [],
    orgId ? getTransferOrders(orgId) : [],
  ]);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gudang & Logistik</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola lokasi cabang dan pergerakan stok antar gudang.
          </p>
        </div>
      </div>

      <Tabs defaultValue="locations" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="locations">Daftar Cabang</TabsTrigger>
          <TabsTrigger value="mutations">Mutasi Stok (PO)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="locations" className="mt-4 space-y-4">
          <div className="flex justify-end">
            {orgId && <AddWarehouseDialog orgId={orgId} slug={slug} hasWarehouses={warehouses.length > 0} />}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-border/40 pt-4">
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
            
            {warehouses.length > 0 && (
              <Card className="border-border/60 border-dashed border-2 shadow-none bg-transparent hover:bg-muted/20 transition-colors flex items-center justify-center min-h-[220px]">
                <div className="text-center p-6 text-muted-foreground">
                  <WarehouseIcon size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="font-semibold text-sm text-foreground">Buka Cabang Baru?</p>
                  <p className="text-xs mt-1">Upgrade ke Growth untuk multi-gudang.</p>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="mutations" className="mt-4 space-y-4">
           <div className="flex justify-end">
             {orgId && <RequestTransferDialog orgId={orgId} slug={slug} warehouses={warehouses} />}
           </div>
           
           <Card className="border-border/60 shadow-sm mt-4">
             <CardHeader className="pb-3 bg-muted/30 border-b border-border/30">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Daftar Permintaan Mutasi (Internal PO)
                  <Badge variant="outline" className="ml-2 text-xs font-normal">{transferOrders.length} Request</Badge>
                </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/60">
                      <TableHead className="text-xs font-semibold pl-6 h-10">Tanggal</TableHead>
                      <TableHead className="text-xs font-semibold h-10">Dari (Gudang)</TableHead>
                      <TableHead className="text-xs font-semibold h-10">Ke (Tujuan)</TableHead>
                      <TableHead className="text-xs font-semibold h-10">Jumlah Item</TableHead>
                      <TableHead className="text-xs font-semibold h-10">Status</TableHead>
                      <TableHead className="text-xs font-semibold w-32 h-10">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transferOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          <ArrowRightLeft className="mx-auto opacity-20 mb-2" size={32} />
                          <p className="text-sm">Belum ada aktivitas mutasi stok</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      transferOrders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="pl-6 text-sm">
                            {new Date(order.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell className="font-medium text-sm">{order.source?.name}</TableCell>
                          <TableCell className="font-medium text-sm">{order.destination?.name}</TableCell>
                          <TableCell className="text-sm">{order.items?.length || 0} Macam Barang</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>
                            {orgId && (
                              <TransferOrderActions orderId={order.id} orgId={orgId} slug={slug} status={order.status} />
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
             </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
