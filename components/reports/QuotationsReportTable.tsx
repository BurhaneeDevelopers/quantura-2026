"use client";

import { ReportTable } from "./ReportTable";
import { FileText } from "lucide-react";
import { formatCurrency } from "@/lib/store";
import { format } from "date-fns";
import type { Invoice } from "@/lib/types";
import { ModuleAIAssistant } from "@/components/ModuleAIAssistant";

interface QuotationsReportTableProps {
  invoices: Invoice[];
}

export function QuotationsReportTable({ invoices }: QuotationsReportTableProps) {
  const columns = [
    {
      key: "invoiceDate",
      label: "Quotation Date",
      render: (value: unknown) => (
        <span className="font-medium">{format(new Date(value as string), "dd/MMM/yyyy")}</span>
      ),
    },
    {
      key: "invoiceNumber",
      label: "Quotation No.",
      render: (value: unknown) => (
        <span className="font-mono text-sm bg-[rgba(0,200,255,0.1)] text-[#00c8ff] px-2 py-1 rounded">
          {value as string}
        </span>
      ),
    },
    {
      key: "partyName",
      label: "Customer Name",
      className: "max-w-[200px] truncate font-medium",
    },
    {
      key: "date",
      label: "Enquiry Date",
      render: (value: unknown) => (
        <span className="text-sm">{format(new Date(value as string), "dd/MMM/yyyy")}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: unknown) => {
        const status = value as string;
        const isConverted = status === "paid" || status === "partial";
        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
              isConverted
                ? "bg-[rgba(34,197,94,0.15)] text-[#22c55e] border border-[rgba(34,197,94,0.3)]"
                : status === "cancelled"
                ? "bg-[rgba(239,68,68,0.15)] text-[#ef4444] border border-[rgba(239,68,68,0.3)]"
                : "bg-[rgba(0,200,255,0.15)] text-[#00c8ff] border border-[rgba(0,200,255,0.3)]"
            }`}
          >
            {isConverted ? "Converted" : status === "cancelled" ? "Cancelled" : "Pending"}
          </span>
        );
      },
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
      label: "Total Amount",
      align: "right" as const,
      className: "font-semibold tabular-nums",
      render: (value: unknown) => formatCurrency(value as number),
    },
  ];

  const totalAmount = invoices.reduce((s, i) => s + i.grandTotal, 0);
  const totalGST = invoices.reduce((s, i) => s + i.totalGst, 0);
  const totalTaxable = invoices.reduce((s, i) => s + i.taxableAmount, 0);

  const summaryRow = invoices.length > 0 ? {
    label: "Total",
    colspan: 5,
    values: [
      formatCurrency(totalTaxable),
      <span key="gst" className="text-muted-foreground">
        {formatCurrency(totalGST)}
      </span>,
      <span key="total" className="font-bold">
        {formatCurrency(totalAmount)}
      </span>,
    ],
  } : undefined;

  return (
    <>
    <ReportTable
      title="Quotations / Estimates Report"
      icon={FileText}
      iconColor="bg-cyan-500"
      headerGradient="bg-[#161620]"
      hoverColor="hover:bg-[rgba(255,255,255,0.03)]"
      columns={columns}
      data={invoices as unknown as Record<string, unknown>[]}
      emptyMessage="No quotations found"
      summaryRow={summaryRow}
      summaryGradient="bg-[rgba(0,200,255,0.06)]"
    />

    {/* AI Assistant */}
    <ModuleAIAssistant
      moduleName="Quotations Report"
      moduleData={{ invoices }}
    />
    </>
  );
}
