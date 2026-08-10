import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getPricingGroups,
  priceGroupLabels,
  type VehicleDetail,
} from "@/content/vehicle-details";

export function VehiclePricing({ detail }: { detail: VehicleDetail }) {
  const groups = getPricingGroups(detail);
  const [tab, setTab] = useState(groups[0]?.group ?? "local");
  const [showInclusive, setShowInclusive] = useState(true);
  const [showExclusive, setShowExclusive] = useState(true);

  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Rates for this vehicle are shared on enquiry.
      </p>
    );
  }

  // Determine if line is inclusive or exclusive
  const isLineInclusive = (label: string) => {
    const lower = label.toLowerCase();
    return lower.includes("package") || lower.includes("pickup") || lower.includes("base");
  };

  return (
    <div className="space-y-4">
      {/* Rate Type Selection Checkboxes */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border/80 bg-muted/40 p-3.5 text-xs sm:text-sm">
        <span className="font-semibold text-foreground">Select Rate Type:</span>
        
        <label className="flex items-center gap-2 cursor-pointer select-none rounded-lg px-2.5 py-1.5 transition-colors hover:bg-background/80">
          <Checkbox
            checked={showInclusive}
            onCheckedChange={(checked) => {
              const val = !!checked;
              if (!val && !showExclusive) return; // Keep at least one checked
              setShowInclusive(val);
            }}
          />
          <span className="font-medium text-foreground">All inclusive</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none rounded-lg px-2.5 py-1.5 transition-colors hover:bg-background/80">
          <Checkbox
            checked={showExclusive}
            onCheckedChange={(checked) => {
              const val = !!checked;
              if (!val && !showInclusive) return; // Keep at least one checked
              setShowExclusive(val);
            }}
          />
          <span className="font-medium text-foreground">All Exclusive</span>
        </label>
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          {groups.map((group) => (
            <TabsTrigger key={group.group} value={group.group} className="text-xs sm:text-sm">
              {priceGroupLabels[group.group]}
            </TabsTrigger>
          ))}
        </TabsList>

        {groups.map((group) => {
          const filteredLines = group.lines.filter((line) => {
            const inclusive = isLineInclusive(line.label);
            if (inclusive && !showInclusive) return false;
            if (!inclusive && !showExclusive) return false;
            return true;
          });

          return (
            <TabsContent key={group.group} value={group.group} className="mt-4">
              {filteredLines.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No rates match the selected filter. Please enable All Inclusive or All Exclusive.
                </p>
              ) : (
                <ul className="grid gap-2">
                  {filteredLines.map((line) => {
                    const inclusive = isLineInclusive(line.label);
                    return (
                      <li
                        key={line.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card p-3 shadow-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{line.label}</p>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 font-medium ${
                                inclusive
                                  ? "border-emerald-500/30 text-emerald-700 bg-emerald-500/10 dark:text-emerald-400"
                                  : "border-amber-500/30 text-amber-700 bg-amber-500/10 dark:text-amber-400"
                              }`}
                            >
                              {inclusive ? "All Inclusive" : "Exclusive Extra"}
                            </Badge>
                          </div>
                          {line.note ? (
                            <p className="mt-0.5 text-xs text-muted-foreground">{line.note}</p>
                          ) : null}
                        </div>
                        {line.visible && line.value ? (
                          <p className="shrink-0 text-sm font-bold text-primary">{line.value}</p>
                        ) : (
                          <Badge variant="secondary" className="shrink-0">
                            {line.enquiryLabel}
                          </Badge>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

