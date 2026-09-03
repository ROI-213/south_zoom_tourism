import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getRateCardConfig, updateRateCardConfig, type RateCardConfig } from "@/content/rate-card";

export function AdminRateManagementDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}) {
  const [config, setConfig] = useState<RateCardConfig>(getRateCardConfig());

  useEffect(() => {
    if (open) {
      setConfig(getRateCardConfig());
    }
  }, [open]);

  const handleSave = () => {
    updateRateCardConfig(config);
    onSave();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Admin Rate Card Management</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update base prices, extra km/hour rates, and allowances. Changes persist locally and reflect immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 text-xs">
          {/* Local Use Rates */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
            <h4 className="font-bold text-sm text-primary">Local Use Rates</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold block mb-1">Base Price (₹)</label>
                <input
                  type="number"
                  value={config.local.basePrice}
                  onChange={(e) => setConfig({ ...config, local: { ...config.local, basePrice: Number(e.target.value) } })}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Extra KM Rate (₹)</label>
                <input
                  type="number"
                  value={config.local.extraKmRate}
                  onChange={(e) => setConfig({ ...config, local: { ...config.local, extraKmRate: Number(e.target.value) } })}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Extra Hour Rate (₹)</label>
                <input
                  type="number"
                  value={config.local.extraHourRate}
                  onChange={(e) => setConfig({ ...config, local: { ...config.local, extraHourRate: Number(e.target.value) } })}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Driver Allowance (₹)</label>
                <input
                  type="number"
                  value={config.local.driverAllowance}
                  onChange={(e) => setConfig({ ...config, local: { ...config.local, driverAllowance: Number(e.target.value) } })}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Airport Transfer Rates */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
            <h4 className="font-bold text-sm text-primary">Airport Transfer Rates</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold block mb-1">Base Price (3h / 30km) (₹)</label>
                <input
                  type="number"
                  value={config.airport?.basePrice ?? 1100}
                  onChange={(e) => setConfig({ ...config, airport: { ...(config.airport || {}), basePrice: Number(e.target.value), baseHours: 3, baseKm: 30, tollPolicy: "Extra at actuals", parkingPolicy: "Extra at actuals", extraKmRate: config.airport?.extraKmRate ?? 28, extraHourRate: config.airport?.extraHourRate ?? 200 } })}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Extra KM Rate (₹)</label>
                <input
                  type="number"
                  value={config.airport?.extraKmRate ?? 28}
                  onChange={(e) => setConfig({ ...config, airport: { ...(config.airport || {}), extraKmRate: Number(e.target.value), basePrice: config.airport?.basePrice ?? 1100, baseHours: 3, baseKm: 30, tollPolicy: "Extra at actuals", parkingPolicy: "Extra at actuals", extraHourRate: config.airport?.extraHourRate ?? 200 } })}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Extra Hour Rate (₹)</label>
                <input
                  type="number"
                  value={config.airport?.extraHourRate ?? 200}
                  onChange={(e) => setConfig({ ...config, airport: { ...(config.airport || {}), extraHourRate: Number(e.target.value), basePrice: config.airport?.basePrice ?? 1100, baseHours: 3, baseKm: 30, tollPolicy: "Extra at actuals", parkingPolicy: "Extra at actuals", extraKmRate: config.airport?.extraKmRate ?? 28 } })}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Outstation One-Way */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
            <h4 className="font-bold text-sm text-primary">Outstation One-Way Rates</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold block mb-1">Min Distance (KM)</label>
                <input
                  type="number"
                  value={config.outstationOneWay.minKm}
                  onChange={(e) => setConfig({ ...config, outstationOneWay: { ...config.outstationOneWay, minKm: Number(e.target.value) } })}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Extra KM Rate (₹)</label>
                <input
                  type="number"
                  value={config.outstationOneWay.extraKmRate}
                  onChange={(e) => setConfig({ ...config, outstationOneWay: { ...config.outstationOneWay, extraKmRate: Number(e.target.value) } })}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">State Tax (₹)</label>
                <input
                  type="number"
                  value={config.outstationOneWay.stateTax}
                  onChange={(e) => setConfig({ ...config, outstationOneWay: { ...config.outstationOneWay, stateTax: Number(e.target.value) } })}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="font-bold">Save Rate Card Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
