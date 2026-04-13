import { getAllTenants } from "@/lib/actions/superadmin";
import { TenantsTable } from "@/components/admin/TenantsTable";

export default async function AdminCustomersPage() {
  const tenants = await getAllTenants();

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

      <TenantsTable tenants={tenants} />
    </div>
  );
}
