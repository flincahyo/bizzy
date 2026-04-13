import { Button } from "@/components/ui/button";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden py-24 text-center md:py-32">
      {/* Subtle Animated Background */}
      <div className="absolute inset-0 -z-10 bg-background overflow-hidden">
        <style>{`
          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(40px, -60px) scale(1.05); }
            66% { transform: translate(-30px, 30px) scale(0.95); }
          }
          .animate-float-1 { animation: float 15s ease-in-out infinite; }
          .animate-float-2 { animation: float 18s ease-in-out infinite; animation-delay: -5s; }
          .animate-float-3 { animation: float 20s ease-in-out infinite; animation-delay: -10s; }
        `}</style>

        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2">
          <div className="animate-float-1 h-[24rem] w-[40rem] rounded-full bg-primary/40 blur-3xl opacity-100" />
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4">
          <div className="animate-float-2 h-[30rem] w-[30rem] rounded-full bg-indigo-500/40 blur-3xl opacity-100" />
        </div>
        <div className="absolute left-0 bottom-1/4 translate-y-1/4 -translate-x-1/4">
          <div className="animate-float-3 h-[25rem] w-[25rem] rounded-full bg-blue-500/40 blur-3xl opacity-100" />
        </div>

        {/* Gradient fade to prevent harsh cutoff at the bottom section transition */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container mx-auto flex flex-col items-center space-y-10 relative z-10">
        <div className="flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur-sm px-3 py-1 text-sm font-medium shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          Baru: Dashboard AI untuk UMKM
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Business Made <span className="text-primary">Easy.</span>
          </h1>
          <p className="mx-auto max-w-[700px] text-lg text-muted-foreground sm:text-xl">
            Bizzy membantu Anda mengelola inventaris, penjualan, hingga tim dalam satu platform yang elegan. Tinggalkan cara lama, beralih ke masa depan bisnis yang lebih efisien.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20">
            <Link href="/login">
              Mulai Sekarang
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base bg-background/50 backdrop-blur-md hover:bg-background">
            <Link href="#features">
              <Play className="mr-2 h-4 w-4" />
              Lihat Fitur
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-center gap-6 pt-4 text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Free Trial 14 Hari</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Tanpa Kartu Kredit</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
