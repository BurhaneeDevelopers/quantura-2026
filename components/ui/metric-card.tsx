import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  borderColor?: string;
  valueColor?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  borderColor,
  valueColor,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("card-hover", borderColor && `border-l-4 ${borderColor}`, className)}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("rounded-xl p-2.5", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className={cn("text-xl font-bold mt-1", valueColor)}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
