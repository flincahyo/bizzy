import { PosTerminal } from "@/components/pos/PosTerminal";
import { getTenantProfileBySlug } from "@/lib/services/tenant";
import { getProducts } from "@/lib/services/products";

interface PosPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PosPage({ params }: PosPageProps) {
  const { slug } = await params;
  
  const profileData = await getTenantProfileBySlug(slug);
  const orgId = profileData?.org?.id;
  
  let products = orgId ? await getProducts(orgId) : [];
  products = products.filter((p: any) => p.product_type === 'finished_good' || p.can_be_sold === true);

  return (
    <div className="h-full">
      <PosTerminal initialProducts={products} orgId={orgId} warehouseId={profileData?.org?.warehouses?.[0]?.id || null} />
    </div>
  );
}
