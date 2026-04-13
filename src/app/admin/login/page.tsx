"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ShieldCheck, Building2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // In a real app, you would check if data.user is actually a Super Admin
      // using a profile lookup. For MVP, we trust the successful login.
      toast.success("Berhasil masuk. Mengalihkan...");
      
      // Force refresh to bypass proxy cache
      setTimeout(() => {
        window.location.href = "/admin";
      }, 500);
      
    } catch (error: any) {
      toast.error(error.message || "Gagal masuk");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-50">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <ShieldCheck size={28} />
          </div>
          <div className="text-center">
            <span className="font-heading font-black text-2xl tracking-tighter">Bizzy SuperAdmin</span>
            <p className="text-slate-400 text-sm mt-1">Authorized Access Only</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-2xl">
          <CardHeader className="text-center space-y-1 pb-6">
            <CardTitle className="text-xl font-bold font-heading">Secure Login</CardTitle>
            <CardDescription className="text-slate-400">
              Masukkan kredensial administrator Anda.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email Administrator</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@bizzy.id" 
                  className="bg-slate-950 border-slate-800 focus-visible:ring-indigo-500 text-slate-100"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  className="bg-slate-950 border-slate-800 focus-visible:ring-indigo-500 text-slate-100"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="submit"
                className="w-full h-11 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-900/50 mt-6" 
                disabled={isLoading}
              >
                {isLoading ? "Memverifikasi..." : "Akses Dashboard Admin"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="mt-8 text-center text-xs text-slate-500 font-mono">
          System Access Logged • IP Checked • Session Tracked
        </p>
      </div>
    </div>
  );
}
