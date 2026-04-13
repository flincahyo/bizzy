"use client";

import { useTransition } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteActionProps {
  /** Pass a BOUND server action: e.g. deleteProduct.bind(null, id, slug) */
  deleteAction: () => Promise<void>;
  label?: string;
}

export function DeleteAction({ deleteAction, label = "Hapus" }: DeleteActionProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenuItem
      className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
      disabled={isPending}
      onSelect={(e) => {
        e.preventDefault();
        startTransition(async () => {
          try {
            await deleteAction();
            toast.success("Berhasil dihapus.");
          } catch (err: any) {
            toast.error(err.message ?? "Gagal menghapus.");
          }
        });
      }}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isPending ? "Menghapus..." : label}
    </DropdownMenuItem>
  );
}
