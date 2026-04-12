"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-accent/20 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] right-[10%] w-[25%] h-[25%] bg-indigo-200/30 rounded-full blur-[80px]" />
      </div>

      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col space-y-8"
        >
          <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 w-fit">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Baru: Dashboard AI untuk UMKM
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold font-heading leading-[1.1] text-slate-900">
            Business Made <span className="text-primary">Easy.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-xl leading-relaxed">
            Bizzy membantu Anda mengelola inventaris, penjualan, hingga tim dalam satu platform yang elegan. Tinggalkan cara lama, beralih ke masa depan bisnis yang lebih efisien.
          </p>

          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button className="w-full sm:w-auto px-8 py-7 rounded-2xl text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all group">
              Mulai Sekarang
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Button>
            <Button variant="outline" className="w-full sm:w-auto px-8 py-7 rounded-2xl text-lg group">
              <Play className="mr-2 fill-slate-900" size={18} />
              Lihat Demo
            </Button>
          </div>

          <div className="flex items-center space-x-6 pt-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="text-emerald-500" size={18} />
              <span className="text-sm font-medium text-slate-500">Free Trial 14 Hari</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="text-emerald-500" size={18} />
              <span className="text-sm font-medium text-slate-500">Tanpa Kartu Kredit</span>
            </div>
          </div>
        </motion.div>

        {/* Right Preview Image - Placeholder for now with premium frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
        >
          <div className="relative z-10 bg-white/40 backdrop-blur-sm p-4 rounded-[2.5rem] border border-white/50 shadow-2xl">
            <div className="overflow-hidden rounded-[2rem] bg-slate-900 aspect-video relative group">
                {/* Simulated Dashboard UI */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div className="h-6 w-32 bg-white/20 rounded-md" />
                        <div className="flex space-x-2">
                            <div className="h-2 w-2 rounded-full bg-red-400" />
                            <div className="h-2 w-2 rounded-full bg-amber-400" />
                            <div className="h-2 w-2 rounded-full bg-emerald-400" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="h-24 bg-white/10 rounded-xl" />
                        <div className="h-24 bg-white/10 rounded-xl" />
                        <div className="h-24 bg-white/10 rounded-xl" />
                    </div>
                    <div className="h-40 bg-white/5 rounded-xl border border-white/10" />
                </div>
                {/* Overlay Glow */}
                <div className="absolute -inset-10 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-accent/20 rounded-full blur-2xl animate-bounce" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
