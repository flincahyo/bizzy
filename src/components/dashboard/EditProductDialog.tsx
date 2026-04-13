"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateProduct } from "@/lib/actions/dashboard";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface EditProductDialogProps {
  orgId: string;
  slug: string;
  product: any;
}

export function EditProductDialog({ orgId, slug, product }: EditProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("orgId", orgId);
    formData.set("slug", slug);
    formData.set("productId", product.id);

    startTransition(async () => {
      try {
        await updateProduct(formData);
        toast.success("Produk berhasil diperbarui!");
        setOpen(false);
      } catch (err: any) {
        toast.error(err.message ?? "Gagal memperbarui produk.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Produk</DialogTitle>
          <DialogDescription>
            Ubah detail produk Anda di sini. Klik simpan setelah selesai.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 col-span-2">
              <Label htmlFor="name">Nama Produk *</Label>
              <Input id="name" name="name" defaultValue={product.name} required />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="sku">SKU / Kode (Opsional)</Label>
              <Input id="sku" name="sku" defaultValue={product.sku || ""} />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Kategori (Opsional)</Label>
              <Input id="category" name="category" defaultValue={product.category?.name || ""} />
            </div>

            <div className="col-span-2 flex flex-col gap-2 mt-2">
              <Label htmlFor="image_file">Update Gambar Produk (Opsional)</Label>
              <Input id="image_file" name="image_file" type="file" accept="image/*" />
              <input type="hidden" name="image_url" value={product.image_url || ""} />
              {product.image_url && <p className="text-xs text-muted-foreground">Biarkan kosong jika tidak ingin mengubah gambar saat ini.</p>}
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <Label htmlFor="price">Harga Jual (Rp) *</Label>
              <Input id="price" name="price" type="number" min="0" defaultValue={product.price} required />
            </div>
            
            <div className="flex flex-col gap-2 mt-2">
              <Label htmlFor="cost_price">Harga Modal (Rp)</Label>
              <Input id="cost_price" name="cost_price" type="number" min="0" defaultValue={product.cost_price || 0} />
            </div>

            <div className="flex flex-col gap-2 col-span-2 mt-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea id="description" name="description" defaultValue={product.description || ""} rows={3} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
