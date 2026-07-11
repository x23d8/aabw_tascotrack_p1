import { Badge } from "@/components/ui/badge";
import type { Classification } from "@/types";
import { cn } from "@/lib/utils";

const styles: Record<Classification, string> = {
  Public: "border-sky-200 bg-sky-50 text-sky-700",
  Internal: "border-slate-200 bg-slate-100 text-slate-700",
  Confidential: "border-amber-200 bg-amber-50 text-amber-800",
  Restricted: "border-rose-200 bg-rose-50 text-rose-700",
};
export function ClassificationBadge({ value, className }: { value: Classification; className?: string }) { return <Badge variant="outline" className={cn(styles[value], className)}>{value}</Badge>; }
