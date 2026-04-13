"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateTransferOrderStatus } from "@/lib/actions/dashboard";

interface Props {
  orderId: string;
  orgId: string;
  slug: string;
  status: string;
}

export function TransferOrderActions({ orderId, orgId, slug, status }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (newStatus: string, message: string) => {
    startTransition(async () => {
      try {
        await updateTransferOrderStatus(orderId, orgId, newStatus, slug);
        toast.success(message);
      } catch (err: any) {
        toast.error(err.message ?? "Gagal memproses mutasi");
      }
    });
  };

  if (status === "pending") {
    return (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => handleUpdate("processing", "Request sedang diproses")}>Proses</Button>
        <Button size="sm" variant="ghost" className="text-destructive" disabled={isPending} onClick={() => handleUpdate("rejected", "Request ditolak")}>Tolak</Button>
      </div>
    );
  }

  if (status === "processing") {
    return (
      <Button size="sm" disabled={isPending} onClick={() => handleUpdate("shipped", "Barang dikirim (Stok asal otomatis berkurang)")}>
        Kirim Barang
      </Button>
    );
  }

  if (status === "shipped") {
    return (
      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={isPending} onClick={() => handleUpdate("completed", "Barang diterima (Stok tujuan bertambah)")}>
        Terima Barang
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" disabled>Selesai</Button>
  );
}
