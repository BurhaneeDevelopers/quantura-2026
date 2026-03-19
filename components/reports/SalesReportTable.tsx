"use client";

import { ReportTable } from "./ReportTable";
import { FileText } from "lucide-react";
import { formatCurrency } from "@/lib/store";
import { format } from "date-fns";
import type { Invoice } from "@/lib/types";
import { ModuleAIAssistant } from "@/components/ModuleAIAssistant";

interface SalesReportTableProps {
  invoices: Invoice[];
}

export function SalesReportTable({ invoices }: SalesReportTableProps) {
  const columns = [
    {
      key: "invoiceDate",
      label: "Date",
      render: (value: unknown) => (
        <span className="font-medium">{format(new Date(value as string), "dd MMM yyyy")}</span>
      ),
    },
    {
      key: "invoiceNumber",
      label: "Invoice No.",
      render: (value: unknown) => (
        <span className="font-mono text-sm bg-[rgba(0,200,255,0.1)] text-[#00c8ff] px-2 py-1 rounded">
          {value as string}
        </span>
      ),
    },
    {
      key: "partyName",
      label: "Customer",
      className: "max-w-[200px] truncate",
    },
    {
      key: "taxableAmount",
      label: "Amount",
      align: "right" as const,
      className: "tabular-nums",
      render: (value: unknown) => formatCurrency(value as number),
    },
    {
      key: "totalGst",
      label: "GST",
      align: "right" as const,
      className: "tabular-nums text-muted-foreground",
      render: (value: unknown) => formatCurrency(value as number),
    },
    {
      key: "grandTotal",
      label: "Total",
      align: "right" as const,
      className: "font-semibold tabular-nums",
      render: (value: unknown) => formatCurrency(value as number),
    },
    {
      key: "amountPaid",
      label: "Paid",
      align: "right" as const,
      className: "tabular-nums text-[#22c55e]",
      render: (value: unknown) => formatCurrency(value as number),
    },
    {
      key: "balance",
      label: "Balance",
      align: "right" as const,
      className: "tabular-nums",
      render: (_: unknown, row: unknown) => {
        const invoice = row as Invoice;
        const balance = invoice.grandTotal - invoice.amountPaid;
        return (
          <span className={balance > 0 ? "text-[#f59e0b] font-medium" : "text-muted-foreground"}>
            {formatCurrency(balance)}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value: unknown) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            value === "paid"
              ? "bg-[rgba(34,197,94,0.15)] text-[#22c55e] ring-1 ring-[rgba(34,197,94,0.3)]"
              : value === "partial"
              ? "bg-[rgba(245,158,11,0.15)] text-[#f59e0b] ring-1 ring-[rgba(245,158,11,0.3)]"
              : "bg-[rgba(239,68,68,0.15)] text-[#ef4444] ring-1 ring-[rgba(239,68,68,0.3)]"
          }`}
        >
          {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
        </span>
      ),
    },
  ];

  return (
    <>
    <ReportTable
      title="Sales Transactions"
      icon={FileText}
      iconColor="bg-emerald-500"
      headerGradient="bg-[#161620]"
      hoverColor="hover:bg-[rgba(255,255,255,0.03)]"
      columns={columns}
      data={invoices as unknown as Record<string, unknown>[]}
      emptyMessage="No sales records found"
    />

    {/* AI Assistant */}
    <ModuleAIAssistant
      moduleName="Sales Report"
      moduleData={{ invoices }}
    />
    </>
  );
}
