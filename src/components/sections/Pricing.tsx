"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Basic",
    price: "IDR 199k",
    description: "Cocok untuk UMKM pemula yang baru memulai digitalisasi.",
    features: [
      "1 Warehouse",
      "POS Kasir Dasar",
      "Manajemen Stok",
      "Maks. 3 Staff",
      "Laporan Bulanan",
    ],
    cta: "Mulai Gratis",
    popular: false,
  },
  {
    name: "Professional",
    price: "IDR 499k",
    description: "Untuk bisnis yang sedang berkembang dan membutuhkan fitur lengkap.",
    features: [
      "3 Warehouse / Cabang",
      "POS Kasir Lanjutan",
      "Manajemen Staff Unlimitied",
      "Analisis Inventory AI",
      "Laporan Real-time",
      "Integrasi WhatsApp",
    ],
    cta: "Pilih Professional",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Solusi khusus untuk bisnis skala besar dengan kebutuhan kompleks.",
    features: [
      "Cabang Unlimited",
      "API Access & Custom Integrations",
      "Dedicated Manager",
      "On-premise Deployment Opt.",
      "SLA 99.9%",
    ],
    cta: "Hubungi Kami",
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-4xl font-bold font-heading text-slate-900 mb-4">
            Pilih Paket yang Sesuai untuk Bisnis Anda
          </h2>
          <p className="text-slate-600 text-lg">
            Investasikan masa depan bisnis Anda dengan biaya yang transparan dan terukur.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-8 rounded-[2.5rem] border ${
                plan.popular
                  ? "border-primary shadow-2xl shadow-primary/10 bg-slate-50"
                  : "border-slate-100 shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                  Paling Populer
                </div>
              )}

              <div className="mb-8">
                <h4 className="text-xl font-bold font-heading text-slate-900 mb-2 uppercase tracking-tight">
                  {plan.name}
                </h4>
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-bold text-slate-900 leading-none">
                    {plan.price}
                  </span>
                  {plan.price !== "Custom" && (
                    <span className="text-slate-500 text-sm font-medium">/bulan</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-4 leading-relaxed italic">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center">
                      <Check className="text-primary" size={12} />
                    </div>
                    <span className="text-sm text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                variant={plan.popular ? "default" : "outline"}
                className={`w-full py-6 rounded-2xl font-bold tracking-tight shadow-lg transition-all ${
                  plan.popular ? "shadow-primary/25" : "shadow-slate-200"
                }`}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
