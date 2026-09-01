import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  getPricingGroups,
  priceGroupLabels,
  type VehicleDetail,
} from "@/content/vehicle-details";

export function VehiclePricing({ detail }: { detail: VehicleDetail }) {
  const groups = getPricingGroups(detail);
  const [tab, setTab] = useState(groups[0]?.group ?? "local");
  const [rateType, setRateType] = useState<"inclusive" | "exclusive">("inclusive");
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Rates for this vehicle are shared on enquiry.
      </p>
    );
  }

  const isAirport = tab === "airport";
  const effectiveRateType = isAirport ? "exclusive" : rateType;

  // Determine if line is inclusive or exclusive
  const isLineInclusive = (label: string, group: string) => {
    if (group === "airport") return false; // Airport transfer is All Exclusive
    const lower = label.toLowerCase();
    return lower.includes("package") || lower.includes("pickup") || lower.includes("base");
  };

  return (
    <div className="space-y-4">
      {/* Rate Type Selection - Mutually Exclusive (Radio) */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/80 bg-muted/40 p-3 text-xs sm:text-sm">
        <span className="font-semibold text-foreground">Select Rate Type:</span>
        
        {!isAirport ? (
          <label
            className={`flex items-center gap-2 cursor-pointer select-none rounded-lg px-3 py-1.5 transition-all border ${
              effectiveRateType === "inclusive"
                ? "border-primary bg-primary/10 font-bold text-foreground shadow-xs"
                : "border-border/60 hover:bg-background/80 text-muted-foreground"
            }`}
            onClick={() => setRateType("inclusive")}
          >
            <input
              type="radio"
              name="pricingRateType"
              checked={effectiveRateType === "inclusive"}
              onChange={() => setRateType("inclusive")}
              className="accent-primary h-3.5 w-3.5"
            />
            <span>All Inclusive</span>
          </label>
        ) : null}

        <label
          className={`flex items-center gap-2 cursor-pointer select-none rounded-lg px-3 py-1.5 transition-all border ${
            effectiveRateType === "exclusive"
              ? "border-primary bg-primary/10 font-bold text-foreground shadow-xs"
              : "border-border/60 hover:bg-background/80 text-muted-foreground"
          }`}
          onClick={() => setRateType("exclusive")}
        >
          <input
            type="radio"
            name="pricingRateType"
            checked={effectiveRateType === "exclusive"}
            onChange={() => setRateType("exclusive")}
            className="accent-primary h-3.5 w-3.5"
          />
          <span>All Exclusive</span>
        </label>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as typeof tab);
          if (value === "airport") {
            setRateType("exclusive");
          }
        }}
      >
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          {groups.map((group) => (
            <TabsTrigger key={group.group} value={group.group} className="text-xs sm:text-sm">
              {priceGroupLabels[group.group]}
            </TabsTrigger>
          ))}
        </TabsList>

        {groups.map((group) => {
          const isLocalGroup = group.group === "local";
          const isPackageLine = (label: string) => label.toLowerCase().includes("package");

          const packageLines = isLocalGroup ? group.lines.filter((l) => isPackageLine(l.label)) : [];
          const extraChargesLines = isLocalGroup ? group.lines.filter((l) => !isPackageLine(l.label)) : [];
          const otherTabLines = !isLocalGroup ? group.lines : [];

          return (
            <TabsContent key={group.group} value={group.group} className="mt-4 space-y-3">
              {/* Local Package Tab */}
              {isLocalGroup && (
                <div className="space-y-3">
                  {/* In Inclusive Mode: Show Package Selection */}
                  {effectiveRateType === "inclusive" && packageLines.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground mb-1.5">Select Package:</p>
                      <ul className="grid gap-2">
                        {packageLines.map((line) => (
                          <li key={line.id}>
                            <label
                              className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 cursor-pointer transition-all shadow-xs ${
                                selectedPackage === line.id
                                  ? "border-primary bg-primary/10"
                                  : "border-border bg-card hover:border-primary/50"
                              }`}
                              onClick={() =>
                                setSelectedPackage(selectedPackage === line.id ? null : line.id)
                              }
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={selectedPackage === line.id}
                                  onChange={() =>
                                    setSelectedPackage(selectedPackage === line.id ? null : line.id)
                                  }
                                  className="accent-primary h-4 w-4 shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-foreground">{line.label}</p>
                                  {line.note ? (
                                    <p className="mt-0.5 text-xs text-muted-foreground">{line.note}</p>
                                  ) : null}
                                </div>
                              </div>
                              {line.visible && line.value ? (
                                <p className="shrink-0 text-sm font-bold text-primary">{line.value}</p>
                              ) : (
                                <Badge variant="secondary" className="shrink-0">
                                  {line.enquiryLabel}
                                </Badge>
                              )}
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Extra per hour, Extra per km, and Driver Allowance (Always visible in Local Package) */}
                  {extraChargesLines.length > 0 && (
                    <ul className="grid gap-2 pt-1">
                      {extraChargesLines.map((line) => (
                        <li
                          key={line.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/80 bg-card p-3.5 shadow-xs hover:border-primary/40 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-foreground">{line.label}</p>
                            {line.note ? (
                              <p className="mt-0.5 text-xs text-muted-foreground">{line.note}</p>
                            ) : null}
                          </div>
                          {line.visible && line.value ? (
                            <p className="shrink-0 text-sm sm:text-base font-extrabold text-amber-600 dark:text-amber-500">
                              {line.value}
                            </p>
                          ) : (
                            <Badge variant="secondary" className="shrink-0">
                              {line.enquiryLabel}
                            </Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Other Tabs (Outstation, Airport transfer, Extras & allowances) */}
              {!isLocalGroup && (
                <ul className="grid gap-2">
                  {otherTabLines.map((line) => (
                    <li
                      key={line.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/80 bg-card p-3.5 shadow-xs hover:border-primary/40 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground">{line.label}</p>
                        {line.note ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">{line.note}</p>
                        ) : null}
                      </div>
                      {line.visible && line.value ? (
                        <p className="shrink-0 text-sm sm:text-base font-extrabold text-amber-600 dark:text-amber-500">
                          {line.value}
                        </p>
                      ) : (
                        <Badge variant="secondary" className="shrink-0">
                          {line.enquiryLabel}
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
