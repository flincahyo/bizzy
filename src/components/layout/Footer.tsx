"use client";

import React from "react";
import Link from "next/link";
import { Globe, Mail, Smartphone, FileText } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1 flex flex-col space-y-6">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl font-heading">B</span>
              </div>
              <span className="text-xl font-bold font-heading tracking-tight text-white uppercase italic">
                bizzy
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed italic">
              "Platform manajemen bisnis modern yang fokus pada kemudahan dan pertumbuhan UMKM di Indonesia."
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-primary transition-colors">
                <Globe size={20} />
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                <Mail size={20} />
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                <Smartphone size={20} />
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                <FileText size={20} />
              </Link>
            </div>
          </div>

          {/* Links */}
          <div>
            <h5 className="text-white font-bold mb-6 tracking-wide text-sm uppercase">Produk</h5>
            <ul className="space-y-4 text-sm">
              <li><Link href="#features" className="hover:text-white transition-colors">Fitur Utama</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Harga Paket</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Integrasi API</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Laporan Bisnis</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-6 tracking-wide text-sm uppercase">Perusahaan</h5>
            <ul className="space-y-4 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Tentang Kami</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Karir</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Kontak</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-6 tracking-wide text-sm uppercase">Legal</h5>
            <ul className="space-y-4 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Kebijakan Privasi</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:row items-center justify-between text-xs text-slate-500">
          <p>© 2026 Bizzy Technology Indonesia. Seluruh hak cipta dilindungi.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
             <span className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Semua Sistem Normal</span>
             </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
