import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CreditCard, Building2, TrendingUp, Sparkles } from "lucide-react";
import { getSuperadminStats } from "@/lib/actions/superadmin";

export default async function AdminDashboardPage() {
  const statsData = await getSuperadminStats();
  
  const formatIDR = (num: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  const stats = [
    {
      title: "Total Tenants (Customers)",
      value: statsData.totalTenants.toString(),
      change: "Active tenants on platform",
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Gross Merchandise Value (GMV)",
      value: formatIDR(statsData.totalGmv),
      change: "Lifetime sales volume across tenants",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Total Users (Staffs & Owners)",
      value: statsData.totalUsers.toString(),
      change: "Total registered profiles",
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome to the Super Admin Panel. Monitor Bizzy SaaS platform health here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.bg} p-2.5 rounded-xl`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}
