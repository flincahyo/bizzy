import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, KeyRound } from "lucide-react";

// Mock data
const staffAccounts = [
  { id: "1", name: "Budi Santoso", username: "kasir_1", role: "kasir", lastLogin: "Hari ini, 08:30" },
  { id: "2", name: "Rina Kumala", username: "kasir_2", role: "kasir", lastLogin: "Kemarin, 14:15" },
  { id: "3", name: "Agus Gudang", username: "gudang_pusat", role: "warehouse_staff", lastLogin: "2 hari lalu" },
];

const roleConfig = {
  kasir: { label: "Kasir", className: "bg-blue-100 text-blue-700" },
  warehouse_staff: { label: "Staf Gudang", className: "bg-emerald-100 text-emerald-700" },
  admin: { label: "Admin", className: "bg-indigo-100 text-indigo-700" },
};

interface StaffPageProps {
  params: Promise<{ slug: string }>;
}

export default async function StaffPage({ params }: StaffPageProps) {
  const { slug } = await params;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">Karyawan & Akses</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola akun login untuk kasir dan staf gudang (Login tanpa email)
          </p>
        </div>
        <Button className="rounded-xl shadow-md shadow-primary/20 gap-2">
          <Plus size={16} />
          Tambah Karyawan
        </Button>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Daftar Akun Karyawan</CardTitle>
            <CardDescription className="text-xs mt-1">
              Karyawan dapat login menggunakan kombinasi Username dan PIN 6 angka di <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">{slug}.bizzy.id/login</span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/60">
                <TableHead className="text-xs font-semibold pl-6">Profil Karyawan</TableHead>
                <TableHead className="text-xs font-semibold">Username Login</TableHead>
                <TableHead className="text-xs font-semibold">Hak Akses (Role)</TableHead>
                <TableHead className="text-xs font-semibold text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffAccounts.map((staff) => {
                const role = roleConfig[staff.role as keyof typeof roleConfig] || { label: staff.role, className: "bg-muted" };
                return (
                  <TableRow key={staff.id} className="border-border/40 hover:bg-muted/30">
                    <TableCell className="pl-6 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 rounded-full border border-border">
                          <AvatarFallback className="bg-muted text-xs font-bold font-heading text-muted-foreground">
                            {staff.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">{staff.name}</p>
                          <p className="text-[10px] text-muted-foreground">Login: {staff.lastLogin}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-muted/50 px-2 py-1 rounded text-muted-foreground">
                          {staff.username}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] px-2 py-0 font-medium ${role.className}`}>
                        {role.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-lg" title="Reset PIN">
                          <KeyRound size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-lg" title="Edit Data">
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive rounded-lg hover:text-destructive hover:bg-destructive/10" title="Hapus Akses">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
