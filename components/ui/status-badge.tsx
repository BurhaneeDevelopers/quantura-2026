import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type InvoiceStatus = "paid" | "partial" | "unpaid";

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  paid: "bg-[rgba(34,197,94,0.15)] text-[#22c55e] border border-[rgba(34,197,94,0.3)]",
  partial: "bg-[rgba(245,158,11,0.15)] text-[#f59e0b] border border-[rgba(245,158,11,0.3)]",
  unpaid: "bg-[rgba(239,68,68,0.15)] text-[#ef4444] border border-[rgba(239,68,68,0.3)]",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status as InvoiceStatus] ?? STATUS_STYLES.unpaid;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize", style, className)}>
      {status}
    </span>
  );
}
