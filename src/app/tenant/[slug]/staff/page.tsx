import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserX } from "lucide-react";
import { getTenantProfileBySlug } from "@/lib/services/tenant";
import { getStaff } from "@/lib/services/products";
import { AddStaffDialog } from "@/components/dashboard/AddStaffDialog";
import { DeleteAction } from "@/components/dashboard/DeleteAction";
import { deleteStaff } from "@/lib/actions/dashboard";

const roleConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  cashier: { label: "Kasir", variant: "secondary" },
  warehouse_staff: { label: "Staf Gudang", variant: "outline" },
  admin: { label: "Admin", variant: "default" },
};

interface StaffPageProps {
  params: Promise<{ slug: string }>;
}

export default async function StaffPage({ params }: StaffPageProps) {
  const { slug } = await params;
  
  const profileData = await getTenantProfileBySlug(slug);
  const orgId = profileData?.org?.id;
  
  const staffAccounts = orgId ? await getStaff(orgId) : [];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Karyawan & Akses</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola akun login untuk kasir dan staf gudang (Login tanpa email)
          </p>
        </div>
        {orgId && <AddStaffDialog orgId={orgId} slug={slug} />}
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between bg-muted/30 border-b border-border/30">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              Daftar Akun Karyawan
              <Badge variant="outline" className="text-[10px] font-normal">{staffAccounts.length} Total</Badge>
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Karyawan login dengan Username + PIN di{" "}
              <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">{slug}.bizzy.id/login</span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/60">
                <TableHead className="text-xs font-semibold pl-6 h-10">Profil Karyawan</TableHead>
                <TableHead className="text-xs font-semibold h-10">Username Login</TableHead>
                <TableHead className="text-xs font-semibold h-10">Hak Akses (Role)</TableHead>
                <TableHead className="text-xs font-semibold text-right pr-6 h-10">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    <UserX className="mx-auto opacity-20 mb-2" size={32} />
                    <p className="text-sm">Belum ada karyawan</p>
                  </TableCell>
                </TableRow>
              ) : (
                staffAccounts.map((staff) => {
                  const role = roleConfig[staff.role as keyof typeof roleConfig] || { label: staff.role, variant: "outline" as const };
                  const lastLoginText = staff.last_login_at
                    ? new Date(staff.last_login_at).toLocaleDateString("id-ID")
                    : "Belum pernah login";

                  // Bind server action args — safe to pass as prop to Client Component
                  const boundDelete = deleteStaff.bind(null, staff.id, slug);

                  return (
                    <TableRow key={staff.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{staff.full_name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{staff.full_name}</p>
                            <p className="text-sm text-muted-foreground">Login: {lastLoginText}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{staff.username}</TableCell>
                      <TableCell>
                        <Badge variant={role.variant}>{role.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
                            <MoreHorizontal size={16} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DeleteAction deleteAction={boundDelete} label="Hapus Akses" />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
