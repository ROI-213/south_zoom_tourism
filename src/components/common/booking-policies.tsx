import { useState } from "react";
import { ShieldCheck, Info, CheckSquare, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function BookingPoliciesCard({
  title = "Trip & Booking Policies",
  className = "",
}: {
  title?: string;
  className?: string;
}) {
  const [rateType, setRateType] = useState<"exclusive" | "inclusive">("inclusive");

  return (
    <div className={`rounded-2xl border-2 border-primary/20 bg-card p-5 shadow-sm space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
          <h3 className="text-base font-bold text-foreground">{title}</h3>
        </div>
        <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-[11px]">
          Mandatory Policies
        </Badge>
      </div>

      <div className="space-y-3.5 text-xs sm:text-sm text-foreground/90">
        {/* Policy 1: Rate Type Selection for One Way / Round Trip */}
        <div className="space-y-2 rounded-xl bg-muted/40 p-3.5 border border-border/60">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">1</span>
            One way trip OR Round trip Pricing Choice:
          </p>
          <div className="grid gap-2 pl-6 pt-1">
            <label
              className={`flex items-start gap-2.5 rounded-lg border p-2.5 cursor-pointer transition-all ${
                rateType === "exclusive"
                  ? "border-primary bg-primary/5 font-semibold"
                  : "border-border/60 hover:bg-background"
              }`}
              onClick={() => setRateType("exclusive")}
            >
              <input
                type="radio"
                name="policyRateType"
                checked={rateType === "exclusive"}
                onChange={() => setRateType("exclusive")}
                className="mt-0.5 accent-primary"
              />
              <div>
                <span className="font-bold text-foreground">All Exclusive</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Base fare only. Tolls, state taxes, driver allowance and fuel charged separately.
                </p>
              </div>
            </label>

            <label
              className={`flex items-start gap-2.5 rounded-lg border p-2.5 cursor-pointer transition-all ${
                rateType === "inclusive"
                  ? "border-primary bg-primary/5 font-semibold"
                  : "border-border/60 hover:bg-background"
              }`}
              onClick={() => setRateType("inclusive")}
            >
              <input
                type="radio"
                name="policyRateType"
                checked={rateType === "inclusive"}
                onChange={() => setRateType("inclusive")}
                className="mt-0.5 accent-primary"
              />
              <div>
                <span className="font-bold text-foreground">All-Inclusive</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Toll Charges, One State entry Taxes, Driver Allowance, and Fuel Charges Included.
                  <span className="block mt-1 font-medium text-amber-600 dark:text-amber-400">
                    * Parking charges, Nice road entry and exit toll, Expressway toll not included.
                  </span>
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Policy 2: Night Driving Allowance */}
        <div className="flex items-start gap-2.5 rounded-xl bg-muted/30 p-3 border border-border/40">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground mt-0.5">2</span>
          <div>
            <p className="font-semibold text-foreground">Night Driving Allowance:</p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
              For trips involving driving between <strong>9:30 PM and 5:30 AM</strong>, an additional Night Driving Allowance will be applicable and payable directly to the driver.
            </p>
          </div>
        </div>

        {/* Policy 3: Calendar Days Calculation */}
        <div className="flex items-start gap-2.5 rounded-xl bg-muted/30 p-3 border border-border/40">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground mt-0.5">3</span>
          <p className="text-xs font-medium text-foreground leading-relaxed">
            The trip duration will be calculated based on <strong>calendar days</strong>.
          </p>
        </div>

        {/* Policy 4: Customer Belongings Disclaimer */}
        <div className="flex items-start gap-2.5 rounded-xl bg-muted/30 p-3 border border-border/40">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground mt-0.5">4</span>
          <p className="text-xs font-medium text-foreground leading-relaxed">
            Customers are responsible for their own belongings. The company is not responsible for any loss or damage.
          </p>
        </div>
      </div>
    </div>
  );
}
