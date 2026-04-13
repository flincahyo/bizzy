"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { createTransferOrder } from "@/lib/actions/dashboard";
import { createClient } from "@/lib/supabase/client";

interface RequestTransferDialogProps {
  orgId: string;
  slug: string;
  warehouses: any[];
}

export function RequestTransferDialog({ orgId, slug, warehouses }: RequestTransferDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const [sourceId, setSourceId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [notes, setNotes] = useState("");
  
  const [products, setProducts] = useState<any[]>([]);
  const [items, setItems] = useState<{ productId: string; qty: number }[]>([]);

  useEffect(() => {
    if (open) {
      // Fetch products to populate dropdown
      const fetchProducts = async () => {
        const supabase = createClient();
        const { data } = await supabase.from("products").select("id, name, sku, product_type").eq("organization_id", orgId).eq("is_active", true);
        if (data) setProducts(data);
      };
      fetchProducts();
    }
  }, [open, orgId]);

  const handleAddItem = () => setItems([...items, { productId: "", qty: 1 }]);
  const handleRemoveItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!sourceId || !destinationId) return toast.error("Silakan pilih gudang asal dan tujuan.");
    if (sourceId === destinationId) return toast.error("Gudang asal dan tujuan tidak boleh sama.");
    if (items.length === 0) return toast.error("Minimal tambahkan 1 item produk.");
    if (items.some(i => !i.productId || i.qty <= 0)) return toast.error("Pastikan semua item memiliki produk dan jumlah > 0.");

    const payload = new FormData();
    payload.set("orgId", orgId);
    payload.set("slug", slug);
    payload.set("sourceId", sourceId);
    payload.set("destinationId", destinationId);
    payload.set("notes", notes);
    payload.set("items", JSON.stringify(items));

    startTransition(async () => {
      try {
        await createTransferOrder(payload);
        toast.success("Permintaan mutasi berhasil dibuat!");
        setOpen(false);
        setItems([]);
        setNotes("");
      } catch (err: any) {
        toast.error(err.message ?? "Gagal membuat permintaan.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <ArrowRightLeft className="h-4 w-4" /> Request Mutasi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Permintaan Mutasi (PO)</DialogTitle>
          <DialogDescription>
            Pusat/Gudang produksi akan menerima notifikasi untuk menyetujui dan mengirimkan barang.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minta Dari (Sumber)</Label>
              <Select value={sourceId} onValueChange={setSourceId}>
                <SelectTrigger><SelectValue placeholder="Pilih gudang asal" /></SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kirim Ke (Tujuan)</Label>
              <Select value={destinationId} onValueChange={setDestinationId}>
                <SelectTrigger><SelectValue placeholder="Pilih gudang tujuan" /></SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Item yang Diminta</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="gap-2">
                <Plus className="h-3 w-3" /> Tambah Item
              </Button>
            </div>
            
            {items.length === 0 && (
              <div className="text-center p-4 border border-dashed rounded-md text-sm text-muted-foreground">
                Belum ada item ditambahkan.
              </div>
            )}
            
            {items.map((item, index) => (
               <div key={index} className="flex items-start gap-2 bg-muted/30 p-2 rounded-md">
                 <div className="flex-1">
                   <Select value={item.productId} onValueChange={(val) => handleItemChange(index, "productId", val)}>
                     <SelectTrigger><SelectValue placeholder="Pilih Produk" /></SelectTrigger>
                     <SelectContent>
                       {products.map(p => (
                         <SelectItem key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ''}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="w-24">
                   <Input type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(index, "qty", parseInt(e.target.value))} />
                 </div>
                 <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveItem(index)}>
                   <Trash2 className="h-4 w-4" />
                 </Button>
               </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Catatan (Opsional)</Label>
            <Textarea placeholder="Contoh: Tolong kirim segera untuk stok akhir pekan." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border/40">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Mengirim..." : "Kirim Request"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
