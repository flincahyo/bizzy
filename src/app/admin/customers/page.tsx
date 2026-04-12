"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Search, MoreHorizontal, ShieldAlert, ArrowUpRight, Ban } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

// Mock Data
const clients = [
  { id: "org_1", name: "Toko Demo", subdomain: "demo", tier: "pro", users: 5, expires: "2026-05-14", status: "active" },
  { id: "org_2", name: "Warkop 99", subdomain: "warkop", tier: "basic", users: 2, expires: "2026-04-20", status: "active" },
  { id: "org_3", name: "Serena Spa", subdomain: "serena", tier: "enterprise", users: 15, expires: "2026-12-31", status: "active" },
  { id: "org_4", name: "Toko Kelontong", subdomain: "kelontong", tier: "basic", users: 1, expires: "2026-03-01", status: "suspended" },
];

export default function AdminCustomersPage() {
  const [simulateLoading, setSimulateLoading] = useState<string | null>(null);

  const handleSimulatePayment = async (orgId: string, tier: string) => {
    setSimulateLoading(orgId);
    try {
      const res = await fetch("/api/admin/simulate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, tierId: tier === "basic" ? "pro" : "enterprise" }),
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(`Success simulated payment for ${orgId}`);
      } else {
        toast.error(data.error || "Simulation failed");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setSimulateLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">Customers (Tenants)</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage all organizations, subscriptions, and access levels.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, subdomain, or org ID..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="pl-6">Organization</TableHead>
                <TableHead>Subdomain</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} className="border-border/40 hover:bg-muted/10">
                  <TableCell className="pl-6 font-medium">{client.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{client.subdomain}.bizzy.id</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase text-[10px]">{client.tier}</Badge>
                  </TableCell>
                  <TableCell>{client.users}</TableCell>
                  <TableCell className="text-sm font-medium">{client.expires}</TableCell>
                  <TableCell>
                    <Badge variant={client.status === "active" ? "secondary" : "destructive"}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                        <MoreHorizontal size={14} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="gap-2 text-sm text-emerald-600 focus:text-emerald-700"
                          onClick={() => handleSimulatePayment(client.id, client.tier)}
                          disabled={simulateLoading === client.id}
                        >
                          <ArrowUpRight size={14} /> {simulateLoading === client.id ? "Simulating..." : "Simulate Subscription Upgrade"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-sm text-yellow-600 focus:text-yellow-700">
                          <ShieldAlert size={14} /> Add Custom Entitlement
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-sm text-destructive focus:text-destructive">
                          <Ban size={14} /> Suspend Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
