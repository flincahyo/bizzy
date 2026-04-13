"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { CheckCircle2, Rocket, ArrowRight } from "lucide-react";

interface UpgradePackageDialogProps {
  moduleType: "pos" | "inventory";
  currentTier: string;
}

export function UpgradePackageDialog({ moduleType, currentTier }: UpgradePackageDialogProps) {
  const [open, setOpen] = useState(false);

  // Hardcode options for MVP popup UI
  const options = moduleType === "pos" ? [
    { tier: "growth", name: "Growth POS", price: "Rp 129.000 / bln", desc: "Transaksi Tanpa Batas, 3 Pengguna" },
    { tier: "pro", name: "Pro POS", price: "Rp 299.000 / bln", desc: "10 Pengguna, Loyalti Pelanggan" }
  ] : [
    { tier: "growth", name: "Growth Inventory", price: "Rp 149.000 / bln", desc: "Produk Tanpa Batas, Manajemen PO" },
    { tier: "pro", name: "Pro Inventory", price: "Rp 349.000 / bln", desc: "Multi Gudang, Laporan Valuasi HPP" }
  ];

  const availableOptions = options.filter(opt => opt.tier !== currentTier);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Upgrade {moduleType === "pos" ? "POS" : "Inventory"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            Pilih Paket Anda
          </DialogTitle>
          <DialogDescription>
            Tingkatkan lisensi {moduleType === "pos" ? "kasir" : "gudang"} Anda untuk membuka kapasitas dan fitur tingkat lanjut.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {availableOptions.map((opt) => (
            <div key={opt.tier} className="flex flex-col border rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors bg-card shadow-sm">
              <div className="p-4 flex items-center justify-between border-b bg-muted/30">
                <div className="flex flex-col">
                  <span className="font-bold text-base">{opt.name}</span>
                  <span className="text-sm font-semibold text-primary">{opt.price}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="p-3 px-4 bg-muted/10 text-xs text-muted-foreground flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                 {opt.desc}
              </div>
            </div>
          ))}
          {availableOptions.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground border rounded-xl bg-muted/20">
              Anda sudah berada di paket tertinggi!
            </div>
          )}
        </div>

        <DialogFooter className="bg-muted/40 -mx-6 -mb-6 p-4 border-t items-center sm:justify-between flex-row">
          <p className="text-xs text-muted-foreground">Pembayaran aman didukung oleh Xendit.</p>
          <Button disabled>Proses Bayar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
