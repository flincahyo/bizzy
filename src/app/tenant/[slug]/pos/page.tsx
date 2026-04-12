import { PosTerminal } from "@/components/pos/PosTerminal";

interface PosPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PosPage({ params }: PosPageProps) {
  const { slug } = await params;

  return (
    <div className="h-full">
      <PosTerminal />
    </div>
  );
}
