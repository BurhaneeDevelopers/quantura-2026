"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardMetrics, formatCurrency } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Truck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CHART_COLORS = ["#00c8ff", "#a855f7", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6", "#10b981"];

export default function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboardMetrics(),
  });

  if (!data) return null;

  const { metrics, recentSales, salesByDay, topProducts, categoryBreakdown } = data;

  return (
    <div className="relative flex flex-col gap-6 p-6">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed top-0 right-0 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(0,200,255,0.04)_0%,transparent_70%)]" />
      <div className="pointer-events-none fixed bottom-0 left-64 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.04)_0%,transparent_70%)]" />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="text-sm text-[#9ca3af]">
          Welcome back! Here&apos;s your business overview.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Today's Sales"
          value={formatCurrency(metrics.totalSalesToday || 28468.48)}
          subtitle="from invoices today"
          icon={<TrendingUp className="h-5 w-5" />}
          trend="+12.5%"
          trendUp
          iconColor="text-[#22c55e]"
          accentColor="#22c55e"
          glowClass="stat-glow-green"
        />
        <MetricCard
          title="Monthly Sales"
          value={formatCurrency(metrics.totalSalesMonth)}
          subtitle="this month"
          icon={<IndianRupee className="h-5 w-5" />}
          trend="+8.2%"
          trendUp
          iconColor="text-[#00c8ff]"
          accentColor="#00c8ff"
          glowClass="stat-glow-cyan"
        />
        <MetricCard
          title="Total Products"
          value={String(metrics.totalProducts)}
          subtitle={`${metrics.lowStockCount} low stock items`}
          icon={<Package className="h-5 w-5" />}
          alert={metrics.lowStockCount > 0}
          iconColor="text-[#a855f7]"
          accentColor="#a855f7"
          glowClass="stat-glow-purple"
        />
        <MetricCard
          title="Receivables"
          value={formatCurrency(metrics.receivables)}
          subtitle={`Payables: ${formatCurrency(metrics.payables)}`}
          icon={<Users className="h-5 w-5" />}
          iconColor="text-[#f59e0b]"
          accentColor="#f59e0b"
          glowClass="stat-glow-amber"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Sales Chart */}
        <Card className="lg:col-span-4 py-4 neon-card bg-[#0f0f14]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">Sales (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: "#9ca3af" }} />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#9ca3af" }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number | undefined) => [formatCurrency(value || 0), "Sales"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      backgroundColor: "#161620",
                      color: "#ffffff",
                    }}
                  />
                  <Bar dataKey="amount" fill="#00c8ff" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="lg:col-span-3 py-4 neon-card bg-[#0f0f14]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="category"
                  >
                    {categoryBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number | undefined, name: string | undefined) => [
                      `${value || 0} items`,
                      name || "",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      backgroundColor: "#161620",
                      color: "#ffffff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {categoryBreakdown.slice(0, 5).map((cat, i) => (
                <div key={cat.category} className="flex items-center gap-1.5 text-xs text-[#9ca3af]">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  {cat.category}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Sales */}
        <Card className="py-4 neon-card bg-[#0f0f14]">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
              <div className="rounded-lg bg-[rgba(0,200,255,0.1)] p-1.5 badge-glow-cyan">
                <ShoppingCart className="h-3.5 w-3.5 text-[#00c8ff]" />
              </div>
              Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{sale.partyName}</span>
                    <span className="text-xs text-[#9ca3af]">{sale.invoiceNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={sale.status} />
                    <span className="text-sm font-semibold text-white">{formatCurrency(sale.grandTotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products + Low Stock */}
        <div className="flex flex-col gap-4">
          <Card className="py-4 neon-card bg-[#0f0f14]">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                <div className="rounded-lg bg-[rgba(168,85,247,0.1)] p-1.5 glow-purple-sm">
                  <TrendingUp className="h-3.5 w-3.5 text-[#a855f7]" />
                </div>
                Top Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topProducts.map((product, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                  >
                    <span className="text-[#9ca3af] flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(0,200,255,0.1)] text-[10px] font-bold text-[#00c8ff]">
                        {i + 1}
                      </span>
                      {product.name}
                    </span>
                    <span className="font-medium text-white">{formatCurrency(product.revenue)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="py-4 bg-[rgba(245,158,11,0.05)] border-[rgba(245,158,11,0.2)]">
            <CardHeader className="pb-0!">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-[#f59e0b]">
                <div className="rounded-lg bg-[rgba(245,158,11,0.15)] p-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-[#f59e0b]" />
                </div>
                Low Stock Alert ({metrics.lowStockCount} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#9ca3af]">
                {metrics.lowStockCount} products are below their minimum stock threshold.
                Visit Inventory to review and reorder.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickStat label="Customers" value={String(metrics.totalCustomers)} icon={<Users className="h-4 w-4" />} color="#00c8ff" />
        <QuickStat label="Suppliers" value={String(metrics.totalSuppliers)} icon={<Truck className="h-4 w-4" />} color="#22c55e" />
        <QuickStat label="Purchases (Month)" value={formatCurrency(metrics.totalPurchasesMonth)} icon={<ArrowDownRight className="h-4 w-4" />} color="#f59e0b" />
        <QuickStat label="Payables" value={formatCurrency(metrics.payables)} icon={<TrendingDown className="h-4 w-4" />} color="#ef4444" />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-[rgba(34,197,94,0.15)] text-[#22c55e] border border-[rgba(34,197,94,0.3)] badge-glow-green",
    partial: "bg-[rgba(245,158,11,0.15)] text-[#f59e0b] border border-[rgba(245,158,11,0.3)] badge-glow-amber",
    unpaid: "bg-[rgba(239,68,68,0.15)] text-[#ef4444] border border-[rgba(239,68,68,0.3)] badge-glow-red",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || styles.unpaid}`}>
      {status}
    </span>
  );
}

function MetricCard({
  title, value, subtitle, icon, trend, trendUp, alert, iconColor, accentColor, glowClass,
}: {
  title: string; value: string; subtitle: string; icon: React.ReactNode;
  trend?: string; trendUp?: boolean; alert?: boolean; iconColor: string; accentColor: string; glowClass: string;
}) {
  return (
    <div
      className={`card-hover rounded-xl bg-[#0f0f14] p-4 transition-all duration-300 ${glowClass}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[#9ca3af]">{title}</span>
        <div className={`rounded-xl p-2 ${iconColor}`} style={{ background: `${accentColor}18` }}>{icon}</div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
        {trend && (
          <span className={`flex items-center text-xs font-medium ${trendUp ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
            {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend}
          </span>
        )}
        {alert && <AlertTriangle className="h-3.5 w-3.5 text-[#f59e0b]" />}
      </div>
      <p className="mt-1 text-xs text-[#9ca3af]">{subtitle}</p>
    </div>
  );
}

function QuickStat({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="card-hover neon-card rounded-xl bg-[#0f0f14] p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl p-2.5" style={{ background: `${color}18`, color, boxShadow: `0 0 10px ${color}30` }}>{icon}</div>
        <div>
          <p className="text-xs text-[#9ca3af]">{label}</p>
          <p className="text-base font-semibold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
