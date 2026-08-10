import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SummaryRow } from "./state";

export function SummaryPanel({
  rows,
  onEdit,
  compact = false,
}: {
  rows: SummaryRow[];
  onEdit?: (step: number) => void;
  compact?: boolean;
}) {
  return (
    <dl className="divide-y divide-border">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 py-2.5">
          <div className="min-w-0">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {row.label}
            </dt>
            <dd className="mt-0.5 break-words text-sm text-foreground">{row.value}</dd>
          </div>
          {onEdit ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 shrink-0 self-start px-2 text-xs"
              onClick={() => onEdit(row.step)}
            >
              <Pencil className="h-3 w-3" aria-hidden="true" />
              <span className={compact ? "sr-only" : ""}>Edit</span>
              <span className="sr-only"> {row.label}</span>
            </Button>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
