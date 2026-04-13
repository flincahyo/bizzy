"use client";

import { cn } from "@/lib/utils";
import React, { useState, useMemo, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, ImageOff, User, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { checkoutCart } from "@/lib/services/transactions";
import { toast } from "sonner";

interface PosTerminalProps {
  initialProducts: any[];
  orgId: string;
  warehouseId?: string;
}

export function PosTerminal({ initialProducts = [], orgId, warehouseId }: PosTerminalProps) {
  // Extract unique categories dynamically from products
  const categoriesObjects = Array.from(new Set(initialProducts.map(p => p.category?.name).filter(Boolean)));
  const categories = ["Semua", ...categoriesObjects];
  
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{product: any, quantity: number}[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Filter products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      const cat = p.category?.name || "Uncategorized";
      const matchesCategory = activeCategory === "Semua" || cat === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [initialProducts, activeCategory, searchQuery]);

  // Cart actions
  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.product.id === productId) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter((item) => item.quantity > 0);
    });
  };

  const clearCart = () => setCart([]);

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.11; // 11% PPN
  const total = subtotal + tax;

  const formatIDR = (num: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  const handleCheckout = (method: string) => {
    if (!orgId) {
      toast.error("Error: Organization ID not found");
      return;
    }
    
    startTransition(async () => {
      try {
        await checkoutCart(
          orgId,
          warehouseId || null as any,
          method,
          cart.map(c => ({ id: c.product.id, name: c.product.name, price: c.product.price, quantity: c.quantity })),
          subtotal,
          tax,
          total
        );
        
        toast.success(`Transaksi Berhasil via ${method.toUpperCase()}!`);
        clearCart();
        setIsCheckoutOpen(false);
      } catch (err: any) {
        toast.error("Gagal memproses transaksi: " + err.message);
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
      {/* LEFT: Products Area */}
      <div className="flex-1 overflow-hidden flex flex-col space-y-4">
        {/* Top Bar: Search and Categories */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-2">
              {categories.map((cat: any) => (
                <Badge
                  key={cat}
                  variant={activeCategory === cat ? "default" : "secondary"}
                  className="cursor-pointer capitalize"
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>
        </div>

        {/* Product Grid */}
        <ScrollArea className="flex-1 pr-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 pb-6">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="overflow-hidden cursor-pointer hover:border-primary"
                onClick={() => addToCart(product)}
              >
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageOff className="text-muted-foreground" size={24} />
                  )}
                </div>
                <CardContent className="p-4">
                  <Badge variant="outline" className="mb-2">
                    {product.category?.name || "Lainnya"}
                  </Badge>
                  <p className="font-semibold leading-tight line-clamp-2 mb-2">
                    {product.name}
                  </p>
                  <p className="font-medium text-primary">{formatIDR(product.price)}</p>
                </CardContent>
              </Card>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-20 text-center text-muted-foreground">
                <Search className="mx-auto h-12 w-12 opacity-20 mb-3" />
                <p>Tidak ada produk yang tersedia.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* RIGHT: Cart Panel */}
      <Card className="w-full lg:w-[380px] flex flex-col shrink-0 h-full overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b shrink-0 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Pesanan Saat Ini</h2>
            <p className="text-xs text-muted-foreground">{cart.length} item dalam keranjang</p>
          </div>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={clearCart} disabled={cart.length === 0} title="Kosongkan">
            <Trash2 size={18} />
          </Button>
        </div>

        {/* Customer Selector (Placeholder) */}
        <div className="p-3 border-b shrink-0">
          <Button variant="outline" className="w-full justify-start text-muted-foreground gap-2 font-normal">
            <User size={16} /> Tambah Data Pelanggan (Opsional)
          </Button>
        </div>
        
        {/* Cart Items List */}
        <ScrollArea className="flex-1">
          <div className="p-4 flex flex-col gap-4">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl opacity-50">🛒</span>
                </div>
                <p className="font-medium">Keranjang masih kosong</p>
                <p className="text-xs mt-1">Pilih produk di sebelah kiri untuk menambahkan ke pesanan.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="flex gap-3 items-start group">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" title={item.product.name}>{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">{formatIDR(item.product.price)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="font-bold text-sm">{formatIDR(item.product.price * item.quantity)}</p>
                    <div className="flex items-center gap-1 bg-muted rounded-md p-0.5 border border-border/50">
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-[4px]" onClick={() => updateQuantity(item.product.id, -1)}>
                        <Minus size={12} />
                      </Button>
                      <span className="text-xs font-semibold w-6 text-center tabular-nums">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-[4px]" onClick={() => updateQuantity(item.product.id, 1)}>
                        <Plus size={12} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Sticky Bottom Summary & Checkout */}
        <div className="p-4 border-t shrink-0">
          <div className="space-y-1.5 mb-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-medium">{formatIDR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Pajak (11%)</span>
              <span className="font-medium">{formatIDR(tax)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t items-center">
              <span className="font-semibold text-base">Total Bayar</span>
              <span className="font-bold text-xl">{formatIDR(total)}</span>
            </div>
          </div>

          <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
            <DialogTrigger asChild>
              <Button disabled={cart.length === 0} className="w-full">
                Bayar Pesanan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
                <DialogDescription>
                  Total tagihan untuk {cart.length} item adalah <strong className="text-foreground">{formatIDR(total)}</strong>.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <Button 
                  disabled={isPending}
                  variant="outline" 
                  onClick={() => handleCheckout("cash")}
                  className="h-24 flex flex-col gap-3 border-2 hover:border-primary hover:bg-primary/5 transition-all text-emerald-500"
                >
                  {isPending ? <Loader2 className="animate-spin" size={32} /> : <Banknote size={32} />}
                  <span className="font-semibold text-foreground">Uang Tunai</span>
                </Button>
                <Button 
                  disabled={isPending}
                  variant="outline" 
                  onClick={() => handleCheckout("qris")}
                  className="h-24 flex flex-col gap-3 border-2 hover:border-primary hover:bg-primary/5 transition-all text-blue-500"
                >
                  {isPending ? <Loader2 className="animate-spin" size={32} /> : <CreditCard size={32} />}
                  <span className="font-semibold text-foreground">QRIS / EDC</span>
                </Button>
              </div>
              <DialogFooter>
                <Button disabled={isPending} variant="ghost" onClick={() => setIsCheckoutOpen(false)}>Batal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </div>
  );
}
