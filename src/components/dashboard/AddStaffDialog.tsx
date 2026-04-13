"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createStaff } from "@/lib/actions/dashboard";

interface AddStaffDialogProps {
  orgId: string;
  slug: string;
}

export function AddStaffDialog({ orgId, slug }: AddStaffDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState("cashier");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("orgId", orgId);
    formData.set("slug", slug);
    formData.set("role", role);

    startTransition(async () => {
      try {
        await createStaff(formData);
        toast.success("Akun karyawan berhasil dibuat!");
        setOpen(false);
        (e.target as HTMLFormElement).reset();
      } catch (err: any) {
        toast.error(err.message ?? "Gagal membuat akun karyawan.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Karyawan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Tambah Akun Karyawan</DialogTitle>
          <DialogDescription>
            Buat akun login Username + PIN untuk kasir atau staf gudang.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="full_name">Nama Lengkap *</Label>
            <Input id="full_name" name="full_name" placeholder="Budi Santoso" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Username Login *</Label>
            <Input id="username" name="username" placeholder="kasir_budi" required />
            <p className="text-xs text-muted-foreground">Tidak bisa mengandung spasi. Unik per toko.</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="pin">PIN Login *</Label>
            <Input id="pin" name="pin" type="password" placeholder="••••••" maxLength={6} required />
            <p className="text-xs text-muted-foreground">4–6 digit angka. Jaga kerahasiannya.</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Role / Jabatan *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cashier">Kasir</SelectItem>
                <SelectItem value="warehouse_staff">Staf Gudang</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buat Akun
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
