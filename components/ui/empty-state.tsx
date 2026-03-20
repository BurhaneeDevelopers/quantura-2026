import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  className?: string;
}

export function EmptyState({ icon: Icon, message, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <Icon className="mx-auto h-8 w-8 text-muted-foreground/40" />
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
