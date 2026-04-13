"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createProduct } from "@/lib/actions/dashboard";

interface AddProductDialogProps {
  orgId: string;
  slug: string;
  warehouses: { id: string; name: string }[];
}

export function AddProductDialog({ orgId, slug, warehouses }: AddProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [productType, setProductType] = useState("finished_good");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    form.set("orgId", orgId);
    form.set("slug", slug);
    form.set("warehouse_id", warehouseId);
    form.set("product_type", productType);
    if (productType === "raw_material") {
      form.set("price", "0");
      form.set("can_be_sold", "false");
    } else {
      form.set("can_be_sold", "true");
    }

    startTransition(async () => {
      try {
        await createProduct(form);
        toast.success("Produk berhasil ditambahkan!");
        setOpen(false);
      } catch (err: any) {
        toast.error(err.message ?? "Gagal menambahkan produk.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Produk
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Produk Baru</DialogTitle>
          <DialogDescription>
            Isi detail produk. Stok awal akan dicatat di gudang yang dipilih.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nama Produk/Item *</Label>
              <Input id="name" name="name" placeholder="Roti Cokelat" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Tipe Item</Label>
              <Select value={productType} onValueChange={setProductType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finished_good">Barang Jual (Kasir)</SelectItem>
                  <SelectItem value="raw_material">Bahan Baku (Gudang)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {productType === "finished_good" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="price">Harga Jual (IDR) *</Label>
                <Input id="price" name="price" type="number" placeholder="25000" required min="0" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="cost_price">Harga Modal (IDR)</Label>
              <Input id="cost_price" name="cost_price" type="number" placeholder="12000" min="0" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sku">SKU / Kode Produk</Label>
              <Input id="sku" name="sku" placeholder="KP-001" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Kategori</Label>
              <Input id="category" name="category" placeholder="Minuman" />
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="image_file">Gambar Icon (Opsional)</Label>
              <Input id="image_file" name="image_file" type="file" accept="image/*" />
            </div>
            {warehouses.length > 0 && (
              <>
                <div className="flex flex-col gap-2">
                  <Label>Gudang</Label>
                  <Select value={warehouseId} onValueChange={setWarehouseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih gudang" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="initial_stock">Stok Awal</Label>
                  <Input id="initial_stock" name="initial_stock" type="number" placeholder="0" min="0" />
                </div>
              </>
            )}
            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea id="description" name="description" placeholder="Deskripsi produk..." className="min-h-[80px]" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Produk
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
