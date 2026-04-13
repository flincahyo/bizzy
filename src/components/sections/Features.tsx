import { Package, Smartphone, Users, BarChart3, ShieldCheck, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    title: "Warehouse Management",
    description: "Pantau stok barang real-time di berbagai lokasi dengan akurasi tinggi.",
    icon: <Package className="h-6 w-6" />,
    className: "md:col-span-2",
  },
  {
    title: "POS Kasir",
    description: "Transaksi cepat dan mudah langsung dari tablet atau smartphone.",
    icon: <Smartphone className="h-6 w-6" />,
    className: "md:col-span-1",
  },
  {
    title: "Manajemen Staff",
    description: "Atur jadwal, performa, dan otorisasi tim Anda dalam satu dasbor.",
    icon: <Users className="h-6 w-6" />,
    className: "md:col-span-1",
  },
  {
    title: "Laporan Akurat",
    description: "Analisis bisnis mendalam untuk keputusan yang lebih cerdas.",
    icon: <BarChart3 className="h-6 w-6" />,
    className: "md:col-span-2",
  },
];

const Features = () => {
  return (
    <section id="features" className="container mx-auto space-y-16 py-24 md:py-32">
      <div className="mx-auto max-w-[58rem] text-center">
        <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
          Segalanya yang Anda butuhkan untuk Scale Up.
        </h2>
        <p className="mt-4 text-muted-foreground sm:text-lg">
          Bizzy dirancang untuk membantu bisnis kecil hingga tingkat lanjut mencapai efisiensi maksimal tanpa ribet.
        </p>
      </div>

      <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className={feature.className}>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {feature.icon}
              </div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 border-t pt-16 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="font-bold">Keamanan Berlapis</h3>
          <p className="text-sm text-muted-foreground">
            Data Anda terenkripsi aman dengan standar perbankan global.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="font-bold">Responsif & Cepat</h3>
          <p className="text-sm text-muted-foreground">
            Akses bisnis Anda kapan saja, di mana saja dengan kecepatan maksimal.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
            <BarChart3 className="h-5 w-5" />
          </div>
          <h3 className="font-bold">Analisis Real-time</h3>
          <p className="text-sm text-muted-foreground">
            Pantau pertumbuhan bisnis Anda setiap detik dengan grafik yang intuitif.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;
