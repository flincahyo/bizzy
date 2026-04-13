import { PosTerminal } from "@/components/pos/PosTerminal";
import { getTenantProfileBySlug } from "@/lib/services/tenant";
import { getProducts, getWarehouses } from "@/lib/services/products";

interface PosPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PosPage({ params }: PosPageProps) {
  const { slug } = await params;
  
  const profileData = await getTenantProfileBySlug(slug);
  const orgId = profileData?.org?.id;
  
  let products = orgId ? await getProducts(orgId) : [];
  products = products.filter((p: any) => p.product_type === 'finished_good' || p.can_be_sold === true);

  let defaultWarehouseId = null;
  if (orgId) {
    const warehouses = await getWarehouses(orgId);
    if (warehouses && warehouses.length > 0) {
      const defaultWh = warehouses.find((w: any) => w.is_default) || warehouses[0];
      defaultWarehouseId = defaultWh.id;
    }
  }

  return (
    <div className="h-full">
      <PosTerminal initialProducts={products} orgId={orgId} warehouseId={defaultWarehouseId} />
    </div>
  );
}
