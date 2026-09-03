import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getFleetFareSettings,
  saveFleetFareSettings,
  resetFleetFareSettings,
  listFareCalculationLogs,
  type FleetFareConfig,
  type FareCalculationLog,
} from "@/content/fleet-pricing";
import { Check, RotateCcw, Save, Trash2, History, Settings, Car } from "lucide-react";
import { toast } from "sonner";

export function AdminFleetFareManagementDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [settings, setSettings] = useState<FleetFareConfig[]>(getFleetFareSettings());
  const [logs, setLogs] = useState<FareCalculationLog[]>([]);
  const [activeTab, setActiveTab] = useState<string>("settings");

  useEffect(() => {
    if (open) {
      setSettings(getFleetFareSettings());
      setLogs(listFareCalculationLogs());
    }
  }, [open]);

  const handleRateChange = (index: number, field: keyof FleetFareConfig, value: any) => {
    const updated = [...settings];
    updated[index] = {
      ...updated[index],
      [field]: typeof value === "number" ? Number(value) : value,
    };
    setSettings(updated);
  };

  const handleSave = () => {
    saveFleetFareSettings(settings);
    toast.success("Fleet Fare Settings Saved!", {
      description: "All vehicle cards and auto fare calculators updated immediately.",
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    const defaults = resetFleetFareSettings();
    setSettings(defaults);
    toast.info("Fleet settings reset to default configurations.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-card border-border">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-extrabold">
                  Admin Fleet Fare Configuration & History
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Configure dynamic ₹/km tariffs, minimum KM rules, allowances & review quoted fare history
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2 max-w-sm h-10 p-1 bg-muted/60 rounded-xl">
            <TabsTrigger value="settings" className="rounded-lg text-xs font-bold gap-1.5">
              <Car className="h-3.5 w-3.5" /> Fleet Fare Settings
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg text-xs font-bold gap-1.5">
              <History className="h-3.5 w-3.5" /> Fare Quotation History
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: FLEET FARE SETTINGS */}
          <TabsContent value="settings" className="space-y-4 pt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/60 pb-2">
              <span>Edit vehicle pricing independently. Changes apply across the entire site without code edits.</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-destructive text-xs gap-1 hover:bg-destructive/10"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset Defaults
              </Button>
            </div>

            <div className="space-y-4">
              {settings.map((fleet, idx) => (
                <div
                  key={fleet.id}
                  className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/40 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm sm:text-base text-foreground">{fleet.vehicleName}</h4>
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {fleet.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={fleet.isActive}
                          onChange={(e) => handleRateChange(idx, "isActive", e.target.checked)}
                          className="accent-primary h-4 w-4"
                        />
                        Active in Calculator
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Outstation Rates Grid */}
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                        Outstation Rates (One Way & Round Trip)
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
                        {/* One Way Rate */}
                        <div>
                          <Label className="text-[10px] font-semibold text-primary block mb-1">
                            One Way (₹/km)
                          </Label>
                          <Input
                            type="number"
                            value={fleet.oneWayRatePerKm}
                            onChange={(e) => handleRateChange(idx, "oneWayRatePerKm", Number(e.target.value))}
                            className="h-8 text-xs font-bold"
                          />
                        </div>

                        {/* One Way Min KM */}
                        <div>
                          <Label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                            One Way Min KM
                          </Label>
                          <Input
                            type="number"
                            value={fleet.oneWayMinimumKm}
                            onChange={(e) => handleRateChange(idx, "oneWayMinimumKm", Number(e.target.value))}
                            className="h-8 text-xs"
                          />
                        </div>

                        {/* One Way Driver Allowance */}
                        <div>
                          <Label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                            One Way Bata (₹)
                          </Label>
                          <Input
                            type="number"
                            value={fleet.oneWayDriverAllowance}
                            onChange={(e) => handleRateChange(idx, "oneWayDriverAllowance", Number(e.target.value))}
                            className="h-8 text-xs"
                          />
                        </div>

                        {/* Round Trip Rate */}
                        <div>
                          <Label className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">
                            Round (₹/km)
                          </Label>
                          <Input
                            type="number"
                            value={fleet.roundTripRatePerKm}
                            onChange={(e) => handleRateChange(idx, "roundTripRatePerKm", Number(e.target.value))}
                            className="h-8 text-xs font-bold"
                          />
                        </div>

                        {/* Round Trip Min KM / Day */}
                        <div>
                          <Label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                            Round Min KM/d
                          </Label>
                          <Input
                            type="number"
                            value={fleet.roundTripMinimumKmPerDay}
                            onChange={(e) => handleRateChange(idx, "roundTripMinimumKmPerDay", Number(e.target.value))}
                            className="h-8 text-xs"
                          />
                        </div>

                        {/* Round Trip Driver Allowance / Day */}
                        <div>
                          <Label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                            Round Bata/d (₹)
                          </Label>
                          <Input
                            type="number"
                            value={fleet.roundTripDriverAllowancePerDay}
                            onChange={(e) => handleRateChange(idx, "roundTripDriverAllowancePerDay", Number(e.target.value))}
                            className="h-8 text-xs"
                          />
                        </div>

                        {/* GST % */}
                        <div>
                          <Label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                            GST %
                          </Label>
                          <Input
                            type="number"
                            value={fleet.gstPercentage}
                            onChange={(e) => handleRateChange(idx, "gstPercentage", Number(e.target.value))}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Local Use & Airport Rates Grid */}
                    <div className="pt-2 border-t border-border/40 bg-muted/20 p-2.5 rounded-xl">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1.5">
                        Local Rental & Airport Transfer Rates (Admin Locale Price Edit)
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
                        {/* Local Base Price */}
                        <div>
                          <Label className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 block mb-1">
                            Local Base (4h/40k ₹)
                          </Label>
                          <Input
                            type="number"
                            value={fleet.localBasePrice ?? 2200}
                            onChange={(e) => handleRateChange(idx, "localBasePrice", Number(e.target.value))}
                            className="h-8 text-xs font-bold text-amber-700 dark:text-amber-400"
                          />
                        </div>

                        {/* Local Extra KM Rate */}
                        <div>
                          <Label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                            Local Extra KM (₹)
                          </Label>
                          <Input
                            type="number"
                            value={fleet.localExtraKmRate ?? 18}
                            onChange={(e) => handleRateChange(idx, "localExtraKmRate", Number(e.target.value))}
                            className="h-8 text-xs"
                          />
                        </div>

                        {/* Local Extra Hour Rate */}
                        <div>
                          <Label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                            Local Extra Hr (₹)
                          </Label>
                          <Input
                            type="number"
                            value={fleet.localExtraHourRate ?? 200}
                            onChange={(e) => handleRateChange(idx, "localExtraHourRate", Number(e.target.value))}
                            className="h-8 text-xs"
                          />
                        </div>

                        {/* Local Driver Allowance */}
                        <div>
                          <Label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                            Local Driver Bata (₹)
                          </Label>
                          <Input
                            type="number"
                            value={fleet.localDriverAllowance ?? 400}
                            onChange={(e) => handleRateChange(idx, "localDriverAllowance", Number(e.target.value))}
                            className="h-8 text-xs"
                          />
                        </div>

                        {/* Airport Base Price */}
                        <div>
                          <Label className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 block mb-1">
                            Airport Base (3h/30k ₹)
                          </Label>
                          <Input
                            type="number"
                            value={fleet.airportBasePrice ?? 1100}
                            onChange={(e) => handleRateChange(idx, "airportBasePrice", Number(e.target.value))}
                            className="h-8 text-xs font-bold text-blue-700 dark:text-blue-400"
                          />
                        </div>

                        {/* Airport Extra KM Rate */}
                        <div>
                          <Label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                            Airport Extra KM (₹)
                          </Label>
                          <Input
                            type="number"
                            value={fleet.airportExtraKmRate ?? 28}
                            onChange={(e) => handleRateChange(idx, "airportExtraKmRate", Number(e.target.value))}
                            className="h-8 text-xs"
                          />
                        </div>

                        {/* Airport Extra Hour Rate */}
                        <div>
                          <Label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                            Airport Extra Hr (₹)
                          </Label>
                          <Input
                            type="number"
                            value={fleet.airportExtraHourRate ?? 200}
                            onChange={(e) => handleRateChange(idx, "airportExtraHourRate", Number(e.target.value))}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="pt-4 border-t border-border gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} className="font-bold gap-1.5">
                <Save className="h-4 w-4" /> Save Fare Settings
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* TAB 2: FARE QUOTATION HISTORY LOGS */}
          <TabsContent value="history" className="pt-4 space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Recent fare calculations quoted to website users ({logs.length} records)</span>
              {logs.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    localStorage.removeItem("szt_fare_calculations_log_v1");
                    setLogs([]);
                    toast.info("Calculation history cleared.");
                  }}
                  className="text-destructive text-xs gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear History
                </Button>
              )}
            </div>

            {logs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground text-xs">
                No customer fare calculations recorded yet. Use the calculator to generate live estimates.
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Vehicle</th>
                        <th className="p-3">Trip</th>
                        <th className="p-3">Route</th>
                        <th className="p-3">Distance</th>
                        <th className="p-3">Billable KM</th>
                        <th className="p-3">Rate</th>
                        <th className="p-3">Driver Bata</th>
                        <th className="p-3">Total Quote</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-muted/20">
                          <td className="p-3 text-muted-foreground whitespace-nowrap">
                            {new Date(log.calculatedAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="p-3 font-semibold text-foreground">{log.fleet.vehicleName}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-[10px]">
                              {log.tripType === "one-way" ? "One Way" : `${log.dayCount}D Round`}
                            </Badge>
                          </td>
                          <td className="p-3 font-medium">
                            {log.pickup} → {log.destination}
                          </td>
                          <td className="p-3 text-muted-foreground">{log.routeDistanceKm} km</td>
                          <td className="p-3 font-semibold text-primary">{log.billableDistanceKm} km</td>
                          <td className="p-3">₹{log.ratePerKm}/km</td>
                          <td className="p-3">₹{log.driverAllowance}</td>
                          <td className="p-3 font-extrabold text-foreground">
                            ₹{log.totalEstimatedFare.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
