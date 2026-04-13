import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CreditCard, Building2, TrendingUp, Sparkles } from "lucide-react";

const stats = [
  {
    title: "Total Tenants (Customers)",
    value: "2", // Hardcoded MVP
    change: "+2 this month",
    icon: Building2,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Monthly Recurring Revenue (MRR)",
    value: "Rp 398.000",
    change: "+199.000 this month",
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Total Active Users (Staff)",
    value: "14",
    change: "+4 this week",
    icon: Users,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
];

export default function AdminDashboardPage() {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Placeholder Charts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">MRR Growth</CardTitle>
            <CardDescription>Estimated recurring revenue over time</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center border-t border-border/40 bg-muted/10">
            <span className="text-muted-foreground text-sm font-medium">Chart Area Placeholder</span>
          </CardContent>
        </Card>
        
        <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent relative overflow-hidden">
          <div className="absolute -top-10 -right-10 text-indigo-500/10 rotate-12">
            <Sparkles size={120} />
          </div>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Frequently used super admin tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 relative z-10">
            <div className="p-3 bg-background rounded-lg border border-border/50 text-sm font-medium hover:border-primary/50 cursor-pointer transition-colors shadow-sm">
              <span className="flex items-center gap-2"><CreditCard size={16} /> Simulate Subscription Payment</span>
            </div>
            <div className="p-3 bg-background rounded-lg border border-border/50 text-sm font-medium hover:border-primary/50 cursor-pointer transition-colors shadow-sm">
              <span className="flex items-center gap-2"><Users size={16} /> Invite New Client Manually</span>
            </div>
            <div className="p-3 bg-background rounded-lg border border-border/50 text-sm font-medium hover:border-primary/50 cursor-pointer transition-colors shadow-sm">
              <span className="flex items-center gap-2"><Building2 size={16} /> Broadcast System Notice</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
