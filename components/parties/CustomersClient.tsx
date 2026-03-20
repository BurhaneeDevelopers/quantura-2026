"use client";

import { useQuery } from "@tanstack/react-query";
import { getParties, formatCurrency } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { Users, TrendingUp } from "lucide-react";

export function CustomersClient() {
  const { data: parties = [] } = useQuery({
    queryKey: ["parties"],
    queryFn: () => getParties(),
  });

  const customers = parties.filter(p => p.type === "customer");
  const totalReceivables = customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0);

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Customers" subtitle={`${customers.length} customers`} />

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard label="Total Customers" value={customers.length} icon={Users} iconColor="text-[#00c8ff]" iconBg="bg-[rgba(0,200,255,0.1)]" borderColor="border-l-blue-500" />
        <MetricCard label="Receivables" value={formatCurrency(totalReceivables)} icon={TrendingUp} iconColor="text-[#22c55e]" iconBg="bg-[rgba(34,197,94,0.1)]" borderColor="border-l-emerald-500" />
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
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">No customers found</TableCell>
                </TableRow>
              ) : (
                customers.map(customer => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <p className="font-medium">{customer.name}</p>
                      {customer.gstin && <p className="text-xs text-muted-foreground">{customer.gstin}</p>}
                    </TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.city || "-"}</TableCell>
                    <TableCell className="text-right">
                      {customer.balance > 0 ? (
                        <Badge variant="destructive">{formatCurrency(customer.balance)}</Badge>
                      ) : customer.balance < 0 ? (
                        <Badge className="bg-[rgba(34,197,94,0.15)] text-[#22c55e] border border-[rgba(34,197,94,0.3)]">{formatCurrency(Math.abs(customer.balance))}</Badge>
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
