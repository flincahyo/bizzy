"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, LogIn, Edit, Ban } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateTenantSubscription } from "@/lib/actions/superadmin";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppsSubscription } from "@/lib/features";

export function TenantsTable({ tenants }: { tenants: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTenant, setEditingTenant] = useState<any | null>(null);
  const [posTier, setPosTier] = useState<string>("starter");
  const [invTier, setInvTier] = useState<string>("starter");
  const [isPending, startTransition] = useTransition();

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.subdomain_slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (tenant: any) => {
    setEditingTenant(tenant);
    setPosTier(tenant.apps_subscription?.pos?.tier || "starter");
    setInvTier(tenant.apps_subscription?.inventory?.tier || "starter");
  };

  const handleSaveTier = () => {
    if (!editingTenant) return;
    
    startTransition(async () => {
      try {
        await updateTenantSubscription(editingTenant.id, posTier, invTier);
        toast.success("Tier berhasil diupdate!");
        setEditingTenant(null);
      } catch (err: any) {
        toast.error("Gagal update tier: " + err.message);
      }
    });
  };

  const handleImpersonate = (slug: string) => {
    // Navigate to the tenant routing directly. Superadmin bypasses validation.
    const protocol = window.location.protocol;
    const host = window.location.hostname.replace("admin.", ""); // strip admin subdomain
    const port = window.location.port ? ":" + window.location.port : "";
    
    const targetUrl = `${protocol}//${slug}.${host}${port}/`;
    window.open(targetUrl, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Cari nama toko atau subdomain..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="pl-6">Toko (Owner)</TableHead>
                <TableHead>Subdomain</TableHead>
                <TableHead>POS Tier</TableHead>
                <TableHead>Inv Tier</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Tidak ada tenant yang cocok.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTenants.map((client) => {
                  const apps: AppsSubscription = client.apps_subscription;
                  return (
                    <TableRow key={client.id} className="border-border/40 hover:bg-muted/10">
                      <TableCell className="pl-6">
                        <p className="font-semibold">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.owner_email}</p>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{client.subdomain_slug}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase text-[10px]">{apps?.pos?.tier || 'starter'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase text-[10px]">{apps?.inventory?.tier || 'starter'}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(client.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="gap-2 text-sm text-blue-600 focus:text-blue-700 cursor-pointer"
                              onClick={() => handleImpersonate(client.subdomain_slug)}
                            >
                              <LogIn size={14} /> Kunjungi Toko (Impersonate)
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-sm text-emerald-600 focus:text-emerald-700 cursor-pointer"
                              onClick={() => handleEditClick(client)}
                            >
                              <Edit size={14} /> Ubah Paket / Tier
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled className="gap-2 text-sm text-destructive focus:text-destructive cursor-pointer">
                              <Ban size={14} /> Suspend Akun
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Editor Modal */}
      <Dialog open={!!editingTenant} onOpenChange={(open) => !open && setEditingTenant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Paket {editingTenant?.name}</DialogTitle>
            <DialogDescription>Sesuaikan tingkatan fitur untuk aplikasi POS dan Gudang.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Aplikasi Kasir (POS) Tier</Label>
              <Select value={posTier} onValueChange={setPosTier}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter (Basic)</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="pro">Pro (Enterprise)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Aplikasi Gudang (Inventory) Tier</Label>
              <Select value={invTier} onValueChange={setInvTier}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter (1 Gudang)</SelectItem>
                  <SelectItem value="growth">Growth (Multi-Gudang)</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTenant(null)}>Batal</Button>
            <Button onClick={handleSaveTier} disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
