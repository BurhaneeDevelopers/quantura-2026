"use client";

import { useQuery } from "@tanstack/react-query";
import { getInvoices, formatCurrency } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText, IndianRupee } from "lucide-react";
import { useState } from "react";
import { ModuleAIAssistant } from "@/components/ModuleAIAssistant";
import { PageHeader } from "@/components/ui/page-header";

export function PurchasesClient() {
  const [search, setSearch] = useState("");

  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices", "purchase"],
    queryFn: () => getInvoices("purchase"),
  });

  const filtered = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.partyName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPurchases = invoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
  const totalPending = totalPurchases - totalPaid;

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Purchases" subtitle={`${invoices.length} purchase orders`} />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Purchases", value: formatCurrency(totalPurchases), icon: FileText, color: "#a855f7", bg: "rgba(168,85,247,0.1)", border: "border-l-violet-500" },
          { label: "Paid", value: formatCurrency(totalPaid), icon: IndianRupee, color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "border-l-emerald-500" },
          { label: "Pending", value: formatCurrency(totalPending), icon: Search, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "border-l-amber-500" },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <Card key={label} className={`card-hover border-l-4 ${border}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-xl p-2.5" style={{ background: bg }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-xl font-bold mt-1" style={label !== "Total Purchases" ? { color } : undefined}>{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by invoice no. or supplier..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Payment</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center">
                    <FileText className="mx-auto h-8 w-8 text-muted-foreground/40" />
                    <p className="mt-2 text-sm text-muted-foreground">No purchases found</p>
                  </TableCell>
                </TableRow>
              ) : filtered.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                  <TableCell className="font-mono text-xs">{inv.invoiceNumber}</TableCell>
                  <TableCell className="text-sm">{new Date(inv.date).toLocaleDateString("en-IN")}</TableCell>
                  <TableCell className="text-sm font-medium">{inv.partyName}</TableCell>
                  <TableCell className="text-center text-sm">{inv.items.length}</TableCell>
                  <TableCell className="text-right text-sm font-medium">{formatCurrency(inv.grandTotal)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs capitalize">{inv.paymentMode.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={inv.status === "paid" ? "default" : "secondary"} className="text-xs capitalize">
                      {inv.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ModuleAIAssistant moduleName="Purchases" moduleData={{ invoices }} />
    </div>
  );
}
