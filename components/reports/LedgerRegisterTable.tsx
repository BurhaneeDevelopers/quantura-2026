"use client";

import { useMemo } from "react";
import { ReportTable } from "./ReportTable";
import { FileText } from "lucide-react";
import { formatCurrency } from "@/lib/store";
import { format } from "date-fns";
import type { Invoice } from "@/lib/types";
import { ModuleAIAssistant } from "@/components/ModuleAIAssistant";

interface LedgerRegisterTableProps {
  invoices: Invoice[];
}

interface LedgerEntry extends Invoice {
  debit: number;
  credit: number;
  balance: number;
}

export function LedgerRegisterTable({ invoices }: LedgerRegisterTableProps) {
  const ledgerEntries = useMemo(() => {
    return invoices.map((inv) => ({
      ...inv,
      debit: inv.grandTotal,
      credit: inv.amountPaid,
      balance: inv.grandTotal - inv.amountPaid,
    }));
  }, [invoices]);

  const columns = [
    {
      key: "invoiceDate",
      label: "Date",
      render: (value: unknown) => (
        <span className="font-medium">{format(new Date(value as string), "dd MMM yyyy")}</span>
      ),
    },
    {
      key: "partyName",
      label: "Particulars",
      className: "max-w-[200px] truncate",
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
      key: "debit",
      label: "Debit",
      align: "right" as const,
      className: "tabular-nums text-[#ef4444]",
      render: (value: unknown) => formatCurrency(value as number),
    },
    {
      key: "credit",
      label: "Credit",
      align: "right" as const,
      className: "tabular-nums text-[#22c55e]",
      render: (value: unknown) => formatCurrency(value as number),
    },
    {
      key: "balance",
      label: "Balance",
      align: "right" as const,
      className: "font-semibold tabular-nums",
      render: (value: unknown) => (
        <span className={(value as number) > 0 ? "text-[#f59e0b]" : "text-muted-foreground"}>
          {formatCurrency(value as number)}
        </span>
      ),
    },
  ];

  const runningBalance = ledgerEntries.reduce((acc, entry) => acc + entry.balance, 0);

  const summaryRow = ledgerEntries.length > 0 ? {
    label: "Total Outstanding",
    colspan: 3,
    values: [
      <span key="debit" className="text-[#ef4444]">
        {formatCurrency(ledgerEntries.reduce((s, e) => s + e.debit, 0))}
      </span>,
      <span key="credit" className="text-[#22c55e]">
        {formatCurrency(ledgerEntries.reduce((s, e) => s + e.credit, 0))}
      </span>,
      <span key="balance" className={runningBalance > 0 ? "text-[#f59e0b]" : "text-muted-foreground"}>
        {formatCurrency(runningBalance)}
      </span>,
    ],
  } : undefined;

  return (
    <>
    <ReportTable
      title="Sales Ledger Register"
      icon={FileText}
      iconColor="bg-amber-500"
      headerGradient="bg-[#161620]"
      hoverColor="hover:bg-[rgba(255,255,255,0.03)]"
      columns={columns}
      data={ledgerEntries as unknown as Record<string, unknown>[]}
      emptyMessage="No ledger entries found"
      summaryRow={summaryRow}
      summaryGradient="bg-[rgba(245,158,11,0.08)]"
    />

    {/* AI Assistant */}
    <ModuleAIAssistant
      moduleName="Ledger Register"
      moduleData={{ invoices, ledgerEntries }}
    />
    </>
  );
}
