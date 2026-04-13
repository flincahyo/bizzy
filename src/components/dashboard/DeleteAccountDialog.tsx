"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAccount } from "@/lib/actions/dashboard";
import { createClient } from "@/lib/supabase/client";

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();

  const isConfirmed = confirmText === "HAPUS PERMANEN";

  const handleDelete = () => {
    if (!isConfirmed) return;

    startTransition(async () => {
      try {
        await deleteAccount();
        
        // Also clear local auth state
        const supabase = createClient();
        await supabase.auth.signOut();
        
        toast.success("Akun dan semua data berhasil dihapus permanen.");
        
        // Redirect to homepage
        window.location.href = "/";
      } catch (err: any) {
        toast.error(err.message ?? "Gagal menghapus akun.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <Trash2 size={16} />
          Hapus Akun Anda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <Trash2 size={20} />
            Hapus Akun Permanen
          </DialogTitle>
          <DialogDescription className="text-sm pt-3 pb-2 text-foreground">
            Anda akan menghapus profil Anda dan <b>SEMUA</b> organisasi bisnis yang Anda miliki. Ini secara otomatis akan menghapus:
            <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
              <li>Katalog Produk dan Inventaris</li>
              <li>Riwayat Transaksi dan Laporan Keuangan</li>
              <li>Akses Karyawan dan Staff</li>
              <li>Data Pelanggan (Jika ada)</li>
            </ul>
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 my-2">
          <b>Peringatan:</b> Tindakan ini tidak bisa dibatalkan meskipun Anda menghubungi dukungan kami.
        </div>

        <div className="grid gap-2 mt-4">
          <Label htmlFor="confirm" className="text-sm">
            Ketik <b>HAPUS PERMANEN</b> untuk melanjutkan.
          </Label>
          <Input 
            id="confirm" 
            autoComplete="off"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="HAPUS PERMANEN" 
          />
        </div>

        <DialogFooter className="mt-6 gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Batal
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            disabled={!isConfirmed || isPending}
            onClick={handleDelete}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Hapus Semuanya
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
