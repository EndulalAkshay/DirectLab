import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  requested: { label: "Requested", className: "bg-info/10 text-info border-info/20" },
  collector_assigned: { label: "Collector Assigned", className: "bg-warning/10 text-warning border-warning/20" },
  sample_collected: { label: "Sample Collected", className: "bg-accent text-accent-foreground border-accent" },
  testing: { label: "Testing", className: "bg-primary/10 text-primary border-primary/20" },
  report_ready: { label: "Report Ready", className: "bg-success/10 text-success border-success/20" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: "" };
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
