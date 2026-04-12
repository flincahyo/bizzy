"use client";

import React from "react";
import { motion } from "framer-motion";
import { Package, Smartphone, Users, BarChart3, ShieldCheck, Zap } from "lucide-react";

const features = [
  {
    title: "Warehouse Management",
    description: "Pantau stok barang real-time di berbagai lokasi dengan akurasi tinggi.",
    icon: <Package className="text-white" size={24} />,
    color: "bg-blue-500",
    className: "md:col-span-2",
  },
  {
    title: "POS Kasir",
    description: "Transaksi cepat dan mudah langsung dari tablet atau smartphone.",
    icon: <Smartphone className="text-white" size={24} />,
    color: "bg-indigo-500",
    className: "md:col-span-1",
  },
  {
    title: "Manajemen Staff",
    description: "Atur jadwal, performa, dan otorisasi tim Anda dalam satu dasbor.",
    icon: <Users className="text-white" size={24} />,
    color: "bg-purple-500",
    className: "md:col-span-1",
  },
  {
    title: "Laporan Akurat",
    description: "Analisis bisnis mendalam untuk keputusan yang lebih cerdas.",
    icon: <BarChart3 className="text-white" size={24} />,
    color: "bg-amber-500",
    className: "md:col-span-2",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-slate-50/50 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col space-y-4"
          >
            <h2 className="text-indigo-600 font-bold uppercase tracking-widest text-sm">
              Fitur Unggulan
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 leading-tight">
              Segalanya yang Anda butuhkan untuk <span className="text-primary italic">Scale Up.</span>
            </h3>
            <p className="text-lg text-slate-600">
              Bizzy dirancang untuk membantu bisnis kecil hingga tingkat lanjut mencapai efisiensi maksimal tanpa ribet.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={feature.className}
            >
              <div className="group relative h-full bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`${feature.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/10`}>
                  {feature.icon}
                </div>
                <h4 className="text-2xl font-bold font-heading mb-4 text-slate-900 uppercase tracking-tight">
                  {feature.title}
                </h4>
                <p className="text-slate-600 leading-relaxed italic">
                  "{feature.description}"
                </p>
                
                {/* Decorative background element */}
                <div className="absolute bottom-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    {feature.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-slate-100 pt-16">
            <div className="flex items-start space-x-4">
                <div className="bg-emerald-100 p-2 rounded-lg">
                    <ShieldCheck className="text-emerald-600" size={24} />
                </div>
                <div>
                    <h5 className="font-bold text-slate-900 mb-2">Keamanan Berlapis</h5>
                    <p className="text-sm text-slate-500">Data Anda terenkripsi aman dengan standar perbankan global.</p>
                </div>
            </div>
            <div className="flex items-start space-x-4">
                <div className="bg-orange-100 p-2 rounded-lg">
                    <Zap className="text-orange-600" size={24} />
                </div>
                <div>
                    <h5 className="font-bold text-slate-900 mb-2">Responsif & Cepat</h5>
                    <p className="text-sm text-slate-500">Akses bisnis Anda kapan saja, di mana saja dengan kecepatan maksimal.</p>
                </div>
            </div>
            <div className="flex items-start space-x-4">
                <div className="bg-indigo-100 p-2 rounded-lg">
                    <BarChart3 className="text-indigo-600" size={24} />
                </div>
                <div>
                    <h5 className="font-bold text-slate-900 mb-2">Analisis Real-time</h5>
                    <p className="text-sm text-slate-500">Pantau pertumbuhan bisnis Anda setiap detik dengan grafik yang intuitif.</p>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
