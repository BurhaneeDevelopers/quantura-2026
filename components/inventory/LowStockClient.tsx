"use client";

import { useQuery } from "@tanstack/react-query";
import { getProducts, formatCurrency } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { AlertTriangle, PackageOpen, TrendingDown } from "lucide-react";

export function LowStockClient() {
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Low Stock Alert" subtitle="Products that need reordering" />

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          label="Low Stock"
          value={lowStockProducts.length}
          icon={AlertTriangle}
          iconColor="text-[#f59e0b]"
          iconBg="bg-[rgba(245,158,11,0.1)]"
          borderColor="border-l-amber-500"
          valueColor="text-[#f59e0b]"
        />
        <MetricCard
          label="Out of Stock"
          value={outOfStockProducts.length}
          icon={PackageOpen}
          iconColor="text-[#ef4444]"
          iconBg="bg-[rgba(239,68,68,0.1)]"
          borderColor="border-l-red-500"
          valueColor="text-[#ef4444]"
        />
      </div>

      {lowStockProducts.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <h2 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#f59e0b]" />
                Low Stock Items
              </h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Current Stock</TableHead>
                  <TableHead className="text-center">Threshold</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-[rgba(245,158,11,0.15)] text-[#f59e0b] border border-[rgba(245,158,11,0.3)] hover:bg-[rgba(245,158,11,0.2)]">
                        {product.stock} {product.unit}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm">{product.lowStockThreshold}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(product.sellingPrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {outOfStockProducts.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <h2 className="font-semibold flex items-center gap-2">
                <PackageOpen className="h-4 w-4 text-[#ef4444]" />
                Out of Stock Items
              </h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outOfStockProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(product.sellingPrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {lowStockProducts.length === 0 && outOfStockProducts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingDown className="h-12 w-12 mx-auto text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">All products are well stocked!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
