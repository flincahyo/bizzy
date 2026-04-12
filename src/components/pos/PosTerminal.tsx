"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, ImageOff, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

// Mock data
const categories = ["Semua", "Minuman", "Makanan", "Snack", "Kopi", "Non-Kopi"];
const mockProducts = [
  { id: "1", name: "Kopi Susu Aren", category: "Kopi", price: 35000, stock: 42, sku: "KSA-01" },
  { id: "2", name: "Matcha Latte", category: "Non-Kopi", price: 38000, stock: 15, sku: "ML-01" },
  { id: "3", name: "Croissant Original", category: "Makanan", price: 28000, stock: 8, sku: "CRO-01" },
  { id: "4", name: "Pisang Goreng", category: "Snack", price: 15000, stock: 20, sku: "PGR-01" },
  { id: "5", name: "Es Teh Manis", category: "Minuman", price: 12000, stock: 150, sku: "ETM-01" },
  { id: "6", name: "Americano", category: "Kopi", price: 25000, stock: 50, sku: "AMR-01" },
  { id: "7", name: "Spaghetti Bolognese", category: "Makanan", price: 45000, stock: 10, sku: "SPG-01" },
  { id: "8", name: "French Fries", category: "Snack", price: 22000, stock: 35, sku: "FFR-01" },
];

interface CartItem {
  product: typeof mockProducts[0];
  quantity: number;
}

export function PosTerminal() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Filter products
  const filteredProducts = mockProducts.filter((p) => {
    const matchesCategory = activeCategory === "Semua" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart actions
  const addToCart = (product: typeof mockProducts[0]) => {
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

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
      {/* LEFT: Products Area */}
      <div className="flex-1 overflow-hidden flex flex-col space-y-4">
        {/* Top Bar: Search and Categories */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 bg-background/50 p-2 rounded-xl border border-border/40">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk..."
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-2 p-1">
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant={activeCategory === cat ? "default" : "secondary"}
                  className="px-4 py-1.5 cursor-pointer text-sm font-medium hover:bg-primary/90 transition-colors"
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
                className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors group flex flex-col h-full"
                onClick={() => addToCart(product)}
              >
                <div className="aspect-[4/3] bg-muted flex items-center justify-center shrink-0">
                  <ImageOff className="text-muted-foreground/30 h-8 w-8 group-hover:scale-110 transition-transform" />
                </div>
                <CardContent className="p-3 flex flex-col flex-1">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">{product.category}</p>
                  <p className="font-semibold text-sm leading-tight flex-1 line-clamp-2" title={product.name}>
                    {product.name}
                  </p>
                  <div className="flex items-end justify-between mt-2 pt-2 border-t border-border/40 shrink-0">
                    <p className="text-primary font-bold text-sm tracking-tight">{formatIDR(product.price)}</p>
                    <div className="bg-primary/10 text-primary h-6 w-6 rounded flex items-center justify-center text-xs opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all font-bold">
                      +
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-20 text-center text-muted-foreground">
                <Search className="mx-auto h-12 w-12 opacity-20 mb-3" />
                <p>Tidak ada produk yang cocok dengan pencarian.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* RIGHT: Cart Panel */}
      <Card className="w-full lg:w-[380px] flex flex-col border-border/60 shrink-0 h-full shadow-lg lg:shadow-none overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-border/40 shrink-0 bg-muted/10 flex items-center justify-between">
          <div>
            <h2 className="font-bold font-heading text-lg">Pesanan Saat Ini</h2>
            <p className="text-xs text-muted-foreground">{cart.length} item dalam keranjang</p>
          </div>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={clearCart} disabled={cart.length === 0} title="Kosongkan">
            <Trash2 size={18} />
          </Button>
        </div>

        {/* Customer Selector (Placeholder) */}
        <div className="p-3 border-b border-border/40 shrink-0 bg-background">
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
        <div className="p-4 border-t border-border/40 shrink-0 bg-background">
          <div className="space-y-1.5 mb-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-medium">{formatIDR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Pajak (11%)</span>
              <span className="font-medium">{formatIDR(tax)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border/40 items-center">
              <span className="font-semibold text-base">Total Bayar</span>
              <span className="font-bold font-heading text-xl text-primary tracking-tight">{formatIDR(total)}</span>
            </div>
          </div>

          <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
            <DialogTrigger 
              render={
                <Button 
                  className="w-full h-14 text-base font-bold shadow-md shadow-primary/20 gap-2" 
                  disabled={cart.length === 0}
                />
              }
            >
              Bayar Pesanan
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading">Pilih Metode Pembayaran</DialogTitle>
                <DialogDescription>
                  Total tagihan untuk {cart.length} item adalah <strong className="text-foreground">{formatIDR(total)}</strong>.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <Button variant="outline" className="h-24 flex flex-col gap-3 border-2 hover:border-primary hover:bg-primary/5 transition-all">
                  <Banknote size={32} className="text-emerald-500" />
                  <span className="font-semibold">Uang Tunai</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-3 border-2 hover:border-primary hover:bg-primary/5 transition-all">
                  <CreditCard size={32} className="text-blue-500" />
                  <span className="font-semibold">QRIS / EDC</span>
                </Button>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsCheckoutOpen(false)}>Batal</Button>
                <Button onClick={() => {
                  alert("Transaksi Berhasil Dimasukkan ke Database!");
                  clearCart();
                  setIsCheckoutOpen(false);
                }}>
                  Konfirmasi Pembayaran
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </div>
  );
}
