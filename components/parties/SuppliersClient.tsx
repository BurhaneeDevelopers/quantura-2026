"use client";

import { useQuery } from "@tanstack/react-query";
import { getParties, formatCurrency } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { Users, TrendingDown } from "lucide-react";

export function SuppliersClient() {
  const { data: parties = [] } = useQuery({
    queryKey: ["parties"],
    queryFn: () => getParties(),
  });

  const suppliers = parties.filter(p => p.type === "supplier");
  const totalPayables = suppliers.reduce((sum, s) => sum + (s.balance < 0 ? Math.abs(s.balance) : 0), 0);

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Suppliers" subtitle={`${suppliers.length} suppliers`} />

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard label="Total Suppliers" value={suppliers.length} icon={Users} iconColor="text-[#a855f7]" iconBg="bg-[rgba(168,85,247,0.1)]" borderColor="border-l-violet-500" />
        <MetricCard label="Payables" value={formatCurrency(totalPayables)} icon={TrendingDown} iconColor="text-[#ef4444]" iconBg="bg-[rgba(239,68,68,0.1)]" borderColor="border-l-red-500" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>City</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">No suppliers found</TableCell>
                </TableRow>
              ) : (
                suppliers.map(supplier => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <p className="font-medium">{supplier.name}</p>
                      {supplier.gstin && <p className="text-xs text-muted-foreground">{supplier.gstin}</p>}
                    </TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.city || "-"}</TableCell>
                    <TableCell className="text-right">
                      {supplier.balance < 0 ? (
                        <Badge variant="destructive">{formatCurrency(Math.abs(supplier.balance))}</Badge>
                      ) : supplier.balance > 0 ? (
                        <Badge className="bg-[rgba(34,197,94,0.15)] text-[#22c55e] border border-[rgba(34,197,94,0.3)]">{formatCurrency(supplier.balance)}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
