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
  getFleetVehicles,
  saveFleetVehicles,
  resetFleetVehicles,
  updateFleetVehicle,
  addFleetVehicle,
  deleteFleetVehicle,
  type FleetVehicle,
} from "@/content/fleet";
import {
  listFareCalculationLogs,
  type FareCalculationLog,
} from "@/content/fleet-pricing";
import { Check, RotateCcw, Save, Trash2, Plus, History, Settings, Car } from "lucide-react";
import { toast } from "sonner";

export function AdminFleetManagementDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FleetVehicle>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState<Partial<FleetVehicle>>({});
  const [activeTab, setActiveTab] = useState<string>("vehicles");

  useEffect(() => {
    if (open) {
      setVehicles(getFleetVehicles());
      setIsAdding(false);
      setEditingId(null);
      setEditForm({});
      setNewForm({});
    }
  }, [open]);

  useEffect(() => {
    const handleUpdate = () => setVehicles(getFleetVehicles());
    window.addEventListener("fleetDataUpdated", handleUpdate);
    return () => window.removeEventListener("fleetDataUpdated", handleUpdate);
  }, []);

  const startEdit = (v: FleetVehicle) => {
    setEditingId(v.id);
    setEditForm({
      name: v.name,
      brand: v.brand,
      model: v.model,
      seats: v.seats,
      luggage: v.luggage,
      ac: v.ac,
      fuel: v.fuel,
      pricePerKm: v.pricePerKm,
      priceFromLabel: v.priceFromLabel,
      available: v.available,
      availabilityText: v.availabilityText,
      features: [...v.features],
      image: v.image,
      imageAlt: v.imageAlt,
      published: v.published,
      featured: v.featured,
      popular: v.popular,
      categorySlug: v.categorySlug,
      tripTypes: [...v.tripTypes],
      allowEnquiryWhenUnavailable: v.allowEnquiryWhenUnavailable,
      order: v.order,
    });
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setIsAdding(false);
    setNewForm({});
  };

  const saveEdit = () => {
    if (!editingId) return;
    const updated = updateFleetVehicle(editingId, editForm);
    if (updated) {
      toast.success(`"${updated.name}" updated successfully`);
      setVehicles(getFleetVehicles());
      cancelEdit();
    }
  };

  const handleAdd = () => {
    if (!newForm.name || !newForm.slug) {
      toast.error("Name and slug are required");
      return;
    }
    const slug = newForm.slug as string;
    if (vehicles.some((v) => v.slug === slug)) {
      toast.error("A vehicle with this slug already exists");
      return;
    }
    const newVehicle: FleetVehicle = {
      id: `fv-${Date.now()}`,
      slug,
      name: newForm.name as string,
      brand: (newForm.brand as string) || "",
      model: (newForm.model as string) || "",
      categorySlug: (newForm.categorySlug as string) || "sedan",
      seats: (newForm.seats as number) || 4,
      luggage: (newForm.luggage as number) || 2,
      ac: (newForm.ac as boolean) ?? true,
      fuel: (newForm.fuel as string) || "Petrol",
      pricePerKm: (newForm.pricePerKm as number) || 10,
      priceFromLabel: (newForm.priceFromLabel as string) || `₹${newForm.pricePerKm || 10} / km`,
      available: (newForm.available as boolean) ?? true,
      availabilityText: (newForm.availabilityText as string) || "Available today",
      allowEnquiryWhenUnavailable: (newForm.allowEnquiryWhenUnavailable as boolean) ?? true,
      tripTypes: (newForm.tripTypes as string[]) || ["local", "outstation"],
      features: (newForm.features as string[]) || [],
      image: (newForm.image as string) || "",
      imageAlt: (newForm.imageAlt as string) || "",
      order: vehicles.length + 1,
      published: (newForm.published as boolean) ?? true,
      featured: (newForm.featured as boolean) ?? false,
      popular: (newForm.popular as number) || 0,
    };
    const updated = addFleetVehicle(newVehicle);
    toast.success(`"${newVehicle.name}" added to fleet`);
    setVehicles([...updated]);
    setNewForm({});
    setIsAdding(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Remove "${name}" from the fleet? This cannot be undone.`)) return;
    const updated = deleteFleetVehicle(id);
    toast.success(`"${name}" removed from fleet`);
    setVehicles([...updated]);
    if (editingId === id) cancelEdit();
  };

  const handleReset = () => {
    if (!confirm("Reset all fleet data to defaults? All custom edits will be lost.")) return;
    resetFleetVehicles();
    toast.info("Fleet data reset to defaults");
    setVehicles(getFleetVehicles());
    cancelEdit();
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
                  Fleet Management
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Edit vehicle details, images, pricing, and availability. Changes reflect immediately.
                </DialogDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-destructive text-xs gap-1 hover:bg-destructive/10"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2 max-w-sm h-10 p-1 bg-muted/60 rounded-xl">
            <TabsTrigger value="vehicles" className="rounded-lg text-xs font-bold gap-1.5">
              <Car className="h-3.5 w-3.5" /> Vehicles
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg text-xs font-bold gap-1.5">
              <History className="h-3.5 w-3.5" /> Fare History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles" className="space-y-4 pt-4">
            {!isAdding && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAdding(true);
                  setEditingId(null);
                  setEditForm({});
                }}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add New Vehicle
              </Button>
            )}

            {isAdding && (
              <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
                <h4 className="font-bold text-sm">New Vehicle</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-[11px] font-semibold">Name *</Label>
                    <Input
                      value={newForm.name || ""}
                      onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold">Slug *</Label>
                    <Input
                      value={newForm.slug || ""}
                      onChange={(e) => setNewForm({ ...newForm, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold">Brand</Label>
                    <Input
                      value={newForm.brand || ""}
                      onChange={(e) => setNewForm({ ...newForm, brand: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold">Model</Label>
                    <Input
                      value={newForm.model || ""}
                      onChange={(e) => setNewForm({ ...newForm, model: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold">Seats</Label>
                    <Input
                      type="number"
                      value={newForm.seats ?? 4}
                      onChange={(e) => setNewForm({ ...newForm, seats: Number(e.target.value) })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold">Luggage</Label>
                    <Input
                      type="number"
                      value={newForm.luggage ?? 2}
                      onChange={(e) => setNewForm({ ...newForm, luggage: Number(e.target.value) })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold">Price / km</Label>
                    <Input
                      type="number"
                      value={newForm.pricePerKm ?? 10}
                      onChange={(e) => setNewForm({ ...newForm, pricePerKm: Number(e.target.value) })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold">Category Slug</Label>
                    <Input
                      value={newForm.categorySlug || "sedan"}
                      onChange={(e) => setNewForm({ ...newForm, categorySlug: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] font-semibold">Image Path</Label>
                    <Input
                      value={newForm.image || ""}
                      onChange={(e) => setNewForm({ ...newForm, image: e.target.value })}
                      className="h-8 text-xs"
                      placeholder="@/assets/fleet-xxx.png"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold">Image Alt Text</Label>
                    <Input
                      value={newForm.imageAlt || ""}
                      onChange={(e) => setNewForm({ ...newForm, imageAlt: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" size="sm" onClick={handleAdd} className="font-bold gap-1">
                    <Plus className="h-3.5 w-3.5" /> Add Vehicle
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => { setIsAdding(false); setNewForm({}); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`rounded-2xl border bg-card p-4 shadow-sm transition-colors ${
                    editingId === vehicle.id
                      ? "border-primary/50 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  {editingId === vehicle.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <Label className="text-[11px] font-semibold text-primary">Vehicle Name</Label>
                          <Input
                            value={editForm.name || ""}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] font-semibold">Brand</Label>
                          <Input
                            value={editForm.brand || ""}
                            onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] font-semibold">Model</Label>
                          <Input
                            value={editForm.model || ""}
                            onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] font-semibold">Fuel</Label>
                          <Input
                            value={editForm.fuel || ""}
                            onChange={(e) => setEditForm({ ...editForm, fuel: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] font-semibold">Seats</Label>
                          <Input
                            type="number"
                            value={editForm.seats ?? 0}
                            onChange={(e) => setEditForm({ ...editForm, seats: Number(e.target.value) })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] font-semibold">Luggage</Label>
                          <Input
                            type="number"
                            value={editForm.luggage ?? 0}
                            onChange={(e) => setEditForm({ ...editForm, luggage: Number(e.target.value) })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] font-semibold text-primary">Price / km (₹)</Label>
                          <Input
                            type="number"
                            value={editForm.pricePerKm ?? 0}
                            onChange={(e) => setEditForm({ ...editForm, pricePerKm: Number(e.target.value), priceFromLabel: `₹${Number(e.target.value)} / km` })}
                            className="h-8 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] font-semibold">Popularity</Label>
                          <Input
                            type="number"
                            value={editForm.popular ?? 0}
                            onChange={(e) => setEditForm({ ...editForm, popular: Number(e.target.value) })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-[11px] font-semibold">Image Path</Label>
                          <Input
                            value={editForm.image || ""}
                            onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-[11px] font-semibold">Image Alt</Label>
                          <Input
                            value={editForm.imageAlt || ""}
                            onChange={(e) => setEditForm({ ...editForm, imageAlt: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-[11px] font-semibold">Features (one per line)</Label>
                          <textarea
                            value={(editForm.features || []).join("\n")}
                            onChange={(e) => setEditForm({ ...editForm, features: e.target.value.split("\n").filter(Boolean) })}
                            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs min-h-[60px]"
                          />
                        </div>
                        <div className="col-span-2 flex flex-wrap items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editForm.available ?? true}
                              onChange={(e) => setEditForm({ ...editForm, available: e.target.checked })}
                              className="accent-primary"
                            />
                            Available
                          </label>
                          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editForm.published ?? true}
                              onChange={(e) => setEditForm({ ...editForm, published: e.target.checked })}
                              className="accent-primary"
                            />
                            Published
                          </label>
                          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editForm.featured ?? false}
                              onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })}
                              className="accent-primary"
                            />
                            Featured
                          </label>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <Button type="button" size="sm" onClick={saveEdit} className="font-bold gap-1">
                          <Check className="h-3.5 w-3.5" /> Save Changes
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={cancelEdit}>
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(vehicle.id, vehicle.name)}
                          className="ml-auto gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {vehicle.image ? (
                          <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
                            <img
                              src={vehicle.image}
                              alt={vehicle.imageAlt || vehicle.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-16 shrink-0 rounded-lg border border-dashed border-border bg-muted flex items-center justify-center">
                            <Car className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm truncate">{vehicle.name}</h4>
                            <div className="flex gap-1">
                              {vehicle.published && (
                                <Badge variant="secondary" className="text-[10px]">Published</Badge>
                              )}
                              {vehicle.available && (
                                <Badge variant="outline" className="text-[10px] text-emerald-600">Available</Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {vehicle.brand} {vehicle.model} &middot; {vehicle.seats}s &middot; {vehicle.luggage}b &middot; {vehicle.ac ? "AC" : "Non-AC"} &middot; ₹{vehicle.pricePerKm}/km
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(vehicle)}
                          className="text-xs gap-1"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="pt-4 space-y-4">
            <FareHistoryTab />
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4 border-t border-border gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FareHistoryTab() {
  const [logs, setLogs] = useState<FareCalculationLog[]>([]);

  useEffect(() => {
    setLogs(listFareCalculationLogs());
  }, []);

  return (
    <div className="space-y-3">
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
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground text-xs">
          No fare calculations recorded yet. Use the calculator to generate live estimates.
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
                  <th className="p-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {logs.slice(0, 50).map((log) => (
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
                      {log.pickup} &rarr; {log.destination}
                    </td>
                    <td className="p-3 text-muted-foreground">{log.routeDistanceKm} km</td>
                    <td className="p-3 font-semibold text-primary">{log.billableDistanceKm} km</td>
                    <td className="p-3">₹{log.ratePerKm}/km</td>
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
    </div>
  );
}
