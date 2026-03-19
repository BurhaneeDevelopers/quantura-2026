"use client";

import { useMemo } from "react";
import { ReportTable } from "./ReportTable";
import { IndianRupee } from "lucide-react";
import { formatCurrency } from "@/lib/store";
import { format } from "date-fns";
import type { Invoice } from "@/lib/types";
import { ModuleAIAssistant } from "@/components/ModuleAIAssistant";

interface ReceivablesReportTableProps {
  invoices: Invoice[];
}

interface ReceivableEntry {
  id: string;
  customerName: string;
  invoiceNumber: string;
  invoiceDate: string;
  orderDate: string;
  receivableAmount: number;
  received: number;
  chequeNo: string;
  chequeDate: string;
  dueAmount: number;
}

export function ReceivablesReportTable({ invoices }: ReceivablesReportTableProps) {
  const receivableEntries = useMemo(() => {
    return invoices
      .filter(inv => inv.grandTotal > inv.amountPaid)
      .map((inv) => ({
        id: inv.id,
        customerName: inv.partyName,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.invoiceDate,
        orderDate: inv.date,
        receivableAmount: inv.grandTotal,
        received: inv.amountPaid,
        chequeNo: "",
        chequeDate: "",
        dueAmount: inv.grandTotal - inv.amountPaid,
      }));
  }, [invoices]);

  const columns = [
    {
      key: "customerName",
      label: "Customer Name",
      className: "font-medium",
    },
    {
      key: "invoiceNumber",
      label: "Invoice No.",
      render: (value: unknown) => (
        <span className="font-mono text-sm bg-[rgba(245,158,11,0.1)] text-[#f59e0b] px-2 py-1 rounded">
          {value as string}
        </span>
      ),
    },
    {
      key: "orderDate",
      label: "Order Date",
      render: (value: unknown) => (
        <span className="text-sm">{format(new Date(value as string), "dd/MMM/yyyy")}</span>
      ),
    },
    {
      key: "invoiceDate",
      label: "Invoice Date",
      render: (value: unknown) => (
        <span className="text-sm">{format(new Date(value as string), "dd/MMM/yyyy")}</span>
      ),
    },
    {
      key: "receivableAmount",
      label: "Receivable Amt.",
      align: "right" as const,
      className: "tabular-nums font-semibold",
      render: (value: unknown) => formatCurrency(value as number),
    },
    {
      key: "received",
      label: "Received",
      align: "right" as const,
      className: "tabular-nums text-[#22c55e]",
      render: (value: unknown) => formatCurrency(value as number),
    },
    {
      key: "dueAmount",
      label: "Due Amount",
      align: "right" as const,
      className: "tabular-nums font-semibold text-[#ef4444]",
      render: (value: unknown) => formatCurrency(value as number),
    },
    {
      key: "chequeNo",
      label: "Cheque No.",
      className: "text-sm text-muted-foreground",
    },
    {
      key: "chequeDate",
      label: "Cheque Date",
      className: "text-sm text-muted-foreground",
    },
  ];

  const totalReceivable = receivableEntries.reduce((s, e) => s + e.receivableAmount, 0);
  const totalReceived = receivableEntries.reduce((s, e) => s + e.received, 0);
  const totalDue = receivableEntries.reduce((s, e) => s + e.dueAmount, 0);

  const summaryRow = receivableEntries.length > 0 ? {
    label: "Total Pending Receivables",
    colspan: 4,
    values: [
      formatCurrency(totalReceivable),
      <span key="received" className="text-[#22c55e]">
        {formatCurrency(totalReceived)}
      </span>,
      <span key="due" className="text-[#ef4444] font-bold">
        {formatCurrency(totalDue)}
      </span>,
      "",
      "",
    ],
  } : undefined;

  return (
    <>
    <ReportTable
      title="Receivables Report"
      icon={IndianRupee}
      iconColor="bg-orange-500"
      headerGradient="bg-[#161620]"
      hoverColor="hover:bg-[rgba(255,255,255,0.03)]"
      columns={columns}
      data={receivableEntries as unknown as Record<string, unknown>[]}
      emptyMessage="No pending receivables"
      summaryRow={summaryRow}
      summaryGradient="bg-[rgba(239,68,68,0.08)]"
    />

    {/* AI Assistant */}
    <ModuleAIAssistant
      moduleName="Receivables Report"
      moduleData={{ invoices, receivableEntries }}
    />
    </>
  );
}
