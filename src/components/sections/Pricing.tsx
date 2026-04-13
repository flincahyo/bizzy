"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const posPlans = [
  {
    name: "Starter",
    price: "Rp 0",
    period: "/bulan",
    description: "Untuk usaha mikro yang baru uji coba",
    features: [
      "Hingga 100 Transaksi / Bulan",
      "1 Pengguna (Owner/Kasir)",
      "Pembayaran Digital Dasar",
      "Laporan Penjualan Harian",
    ],
    cta: "Mulai Gratis",
    popular: false,
  },
  {
    name: "Growth",
    price: "Rp 129.000",
    period: "/bulan",
    description: "Titik harga penentu untuk usaha yang mulai jalan",
    features: [
      "Transaksi Penjualan Tanpa Batas",
      "3 Pengguna (Shift Kasir/Admin)",
      "Manajemen Pelanggan & Diskon",
      "Laporan Analisis & Ekspor Data",
    ],
    cta: "Pilih Growth",
    popular: true,
  },
  {
    name: "Pro",
    price: "Rp 299.000",
    period: "/bulan",
    description: "Untuk bisnis matang yang butuh kontrol ekstra",
    features: [
      "Semua fitur Growth",
      "Manajemen 2 Cabang Toko",
      "10 Pengguna Khusus",
      "Program Loyalitas & Poin",
      "API & Prioritas Support",
    ],
    cta: "Pilih Pro",
    popular: false,
  },
];

const inventoryPlans = [
  {
    name: "Starter",
    price: "Rp 0",
    period: "/bulan",
    description: "Agar warung kecil tidak perlu pakai buku tulis lagi",
    features: [
      "Maksimal 50 Jenis Produk/Item",
      "1 Lokasi Gudang",
      "Stok Masuk & Keluar Lengkap",
      "Notifikasi Stok Menipis",
    ],
    cta: "Mulai Gratis",
    popular: false,
  },
  {
    name: "Growth",
    price: "Rp 149.000",
    period: "/bulan",
    description: "Bagi toko yang punya ratusan ragam SKU",
    features: [
      "Produk / SKU Tanpa Batas",
      "3 Pengguna (Staf Gudang)",
      "Manajemen Pembelian (PO)",
      "Audit Trail (Riwayat Stok)",
    ],
    cta: "Pilih Growth",
    popular: true,
  },
  {
    name: "Pro",
    price: "Rp 349.000",
    period: "/bulan",
    description: "Untuk operasional level menengah",
    features: [
      "Semua fitur Growth",
      "Multi Gudang Terpisah (2 Lokasi)",
      "10 Pengguna Khusus",
      "Sistem Batch & HPP / FIFO",
      "Laporan Valuasi Aset Total",
    ],
    cta: "Pilih Pro",
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="container mx-auto py-24 md:py-32">
      <div className="mx-auto max-w-[58rem] text-center mb-12">
        <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
          Solusi Tepat Sesuai Kebutuhan Anda
        </h2>
        <p className="mt-4 text-muted-foreground sm:text-lg">
          Bizzy memisahkan fungsi Kasir dan Gudang agar Anda hanya membayar apa yang bisnis Anda butuhkan saat ini.
        </p>
      </div>

      <Tabs defaultValue="pos" className="mx-auto flex flex-col items-center">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-12 h-14 rounded-full bg-muted/60 p-1 items-center">
          <TabsTrigger value="pos" className="h-full rounded-full flex items-center justify-center text-center text-base data-[state=active]:bg-background data-[state=active]:shadow-sm">Bizzy POS (Kasir)</TabsTrigger>
          <TabsTrigger value="inventory" className="h-full rounded-full flex items-center justify-center text-center text-base data-[state=active]:bg-background data-[state=active]:shadow-sm">Bizzy Inventory (Gudang)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pos" className="w-full mt-0">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {posPlans.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="inventory" className="w-full mt-0">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {inventoryPlans.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
};

function PricingCard({ plan }: { plan: any }) {
  return (
    <Card
      className={`relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-xl ${
        plan.popular
          ? "scale-105 border-primary shadow-2xl shadow-primary/20 z-10"
          : "border-border/50"
      }`}
    >
      {plan.popular && (
        <div className="absolute top-0 right-0">
          <Badge className="rounded-tl-none rounded-br-none rounded-bl-xl rounded-tr-none bg-primary text-primary-foreground px-4 py-1 text-xs font-bold uppercase tracking-wider shadow-sm">
            Paling Laris
          </Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
        <CardDescription className="min-h-[40px] mt-2">
          {plan.description}
        </CardDescription>
        <div className="mt-6 flex items-baseline gap-1">
          <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
          {plan.price !== "Custom" && (
            <span className="text-sm font-medium text-muted-foreground">{plan.period}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 mt-6">
        <ul className="space-y-4">
          {plan.features.map((feature: string) => (
            <li key={feature} className="flex items-center gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-sm leading-tight text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          variant={plan.popular ? "default" : "outline"}
          className="w-full h-12 text-sm font-bold"
        >
          {plan.cta}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default Pricing;
