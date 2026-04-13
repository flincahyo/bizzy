import React from "react";
import Link from "next/link";
import { Globe, Mail, Smartphone, FileText } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-muted/40 py-20">
      <div className="container mx-auto px-6">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand Info */}
          <div className="col-span-1 flex flex-col space-y-6 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-xl font-bold text-primary-foreground">B</span>
              </div>
              <span className="text-xl font-bold uppercase tracking-tight">
                bizzy
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Platform manajemen bisnis modern yang fokus pada kemudahan dan pertumbuhan UMKM di Indonesia.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Globe size={20} />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail size={20} />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Smartphone size={20} />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <FileText size={20} />
              </Link>
            </div>
          </div>

          {/* Links */}
          <div>
            <h5 className="mb-6 text-sm font-bold uppercase tracking-wide">Produk</h5>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-primary transition-colors">Fitur Utama</Link></li>
              <li><Link href="#pricing" className="hover:text-primary transition-colors">Harga Paket</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Integrasi API</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Laporan Bisnis</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="mb-6 text-sm font-bold uppercase tracking-wide">Perusahaan</h5>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Tentang Kami</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Karir</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Kontak</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="mb-6 text-sm font-bold uppercase tracking-wide">Legal</h5>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-8 text-xs text-muted-foreground flex-col md:flex-row gap-4">
          <p>© 2026 Bizzy Technology Indonesia. Seluruh hak cipta dilindungi.</p>
          <div className="flex space-x-6">
             <span className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Semua Sistem Normal</span>
             </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
