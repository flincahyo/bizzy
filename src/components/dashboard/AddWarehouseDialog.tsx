"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createWarehouse } from "@/lib/actions/dashboard";

interface AddWarehouseDialogProps {
  orgId: string;
  slug: string;
  hasWarehouses: boolean;
}

export function AddWarehouseDialog({ orgId, slug, hasWarehouses }: AddWarehouseDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDefault, setIsDefault] = useState(!hasWarehouses);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("orgId", orgId);
    formData.set("slug", slug);
    formData.set("is_default", isDefault ? "true" : "false");

    startTransition(async () => {
      try {
        await createWarehouse(formData);
        toast.success("Gudang berhasil ditambahkan!");
        setOpen(false);
      } catch (err: any) {
        toast.error(err.message ?? "Gagal menambahkan gudang.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Gudang
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Tambah Gudang Baru</DialogTitle>
          <DialogDescription>
            Daftarkan gudang atau cabang baru untuk mengelola stok secara terpisah.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nama Gudang *</Label>
            <Input id="name" name="name" placeholder="Gudang Utama / Cabang Jakarta" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="address">Alamat</Label>
            <Input id="address" name="address" placeholder="Jl. Sudirman No. 1, Jakarta" />
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="is_default"
              checked={isDefault}
              onCheckedChange={(v) => setIsDefault(!!v)}
            />
            <Label htmlFor="is_default" className="font-normal cursor-pointer">
              Jadikan gudang utama (default)
            </Label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Gudang
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
