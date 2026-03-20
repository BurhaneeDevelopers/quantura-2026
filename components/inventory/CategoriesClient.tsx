"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts, formatCurrency } from "@/lib/store";
import { PRODUCT_CATEGORIES } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { Package, IndianRupee, Boxes } from "lucide-react";

export function CategoriesClient() {
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  const categoryStats = useMemo(() => {
    return PRODUCT_CATEGORIES.map(category => {
      const categoryProducts = products.filter(p => p.category === category);
      const totalValue = categoryProducts.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0);
      const totalStock = categoryProducts.reduce((sum, p) => sum + p.stock, 0);
      const lowStock = categoryProducts.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0).length;
      return { category, count: categoryProducts.length, totalValue, totalStock, lowStock };
    }).filter(stat => stat.count > 0);
  }, [products]);

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0);

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Product Categories"
        subtitle={`${categoryStats.length} active categories with ${totalProducts} products`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Active Categories" value={categoryStats.length} icon={Package} iconColor="text-[#6366f1]" iconBg="bg-[rgba(99,102,241,0.1)]" borderColor="border-l-indigo-500" />
        <MetricCard label="Total Products" value={totalProducts} icon={Boxes} iconColor="text-[#22c55e]" iconBg="bg-[rgba(34,197,94,0.1)]" borderColor="border-l-emerald-500" />
        <MetricCard label="Total Value" value={formatCurrency(totalValue)} icon={IndianRupee} iconColor="text-[#a855f7]" iconBg="bg-[rgba(168,85,247,0.1)]" borderColor="border-l-violet-500" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categoryStats.map(stat => (
          <Card key={stat.category} className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold">{stat.category}</h3>
                <Badge variant="secondary">{stat.count} items</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Stock:</span>
                  <span className="font-medium">{stat.totalStock} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock Value:</span>
                  <span className="font-medium">{formatCurrency(stat.totalValue)}</span>
                </div>
                {stat.lowStock > 0 && (
                  <div className="flex justify-between text-[#f59e0b]">
                    <span>Low Stock Items:</span>
                    <span className="font-medium">{stat.lowStock}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
