import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <p className={cn("text-xs font-semibold uppercase tracking-wider text-muted-foreground", className)}>
      {children}
    </p>
  );
}

interface SectionGroupProps {
  children: React.ReactNode;
  label: string;
  className?: string;
}

export function SectionGroup({ children, label, className }: SectionGroupProps) {
  return (
    <div className={cn("rounded-lg border p-4 space-y-4", className)}>
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  );
}
