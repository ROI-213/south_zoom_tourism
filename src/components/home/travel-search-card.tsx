import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  MapPin,
  Navigation,
  Calendar,
  Clock,
  Users,
  Car,
  Compass,
  Building2,
  BedDouble,
  Hourglass,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { searchOptions } from "@/content/site";
import { getLatestTravelSearch, saveLatestTravelSearch } from "@/lib/search-storage";

const today = () => new Date().toISOString().slice(0, 10);

type VehicleForm = {
  pickupCity: string;
  dropCity: string;
  tripType: string;
  pickupDate: string;
  pickupTime: string;
  passengers: string;
  vehicleType: string;
};

type PackageForm = {
  destination: string;
  category: string;
  travelDate: string;
  duration: string;
  travellers: string;
};

type HotelForm = {
  city: string;
  checkIn: string;
  checkOut: string;
  rooms: string;
  guests: string;
};

export function TravelSearchCard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("vehicle");
  const [error, setError] = useState<string | null>(null);

  const initialSearch = getLatestTravelSearch();

  const [vehicle, setVehicle] = useState<VehicleForm>({
    pickupCity: initialSearch.pickupCity || "",
    dropCity: initialSearch.dropCity || "",
    tripType: initialSearch.tripType || searchOptions.tripTypes[0],
    pickupDate: initialSearch.pickupDate || today(),
    pickupTime: initialSearch.pickupTime || "09:00",
    passengers: String(initialSearch.passengers || "2"),
    vehicleType: initialSearch.vehicleType || searchOptions.vehicleTypes[0],
  });

  // Sync latest saved search changes if updated elsewhere
  useEffect(() => {
    const handleUpdate = () => {
      const s = getLatestTravelSearch();
      setVehicle((prev) => ({
        ...prev,
        pickupCity: s.pickupCity || prev.pickupCity,
        dropCity: s.dropCity || prev.dropCity,
        tripType: s.tripType || prev.tripType,
        pickupDate: s.pickupDate || prev.pickupDate,
        pickupTime: s.pickupTime || prev.pickupTime,
        passengers: String(s.passengers || prev.passengers),
        vehicleType: s.vehicleType || prev.vehicleType,
      }));
    };
    window.addEventListener("sztTravelSearchUpdated", handleUpdate);
    return () => window.removeEventListener("sztTravelSearchUpdated", handleUpdate);
  }, []);

  const [pkg, setPkg] = useState<PackageForm>({
    destination: "",
    category: "Any",
    travelDate: today(),
    duration: "Any",
    travellers: "2",
  });

  const [hotel, setHotel] = useState<HotelForm>({
    city: "",
    checkIn: today(),
    checkOut: today(),
    rooms: "1",
    guests: "2",
  });

  const go = (to: string, search: Record<string, string>) => {
    setError(null);
    navigate({ to, search } as never);
  };

  return (
    <section
      aria-label="Search travel options"
      className="relative z-10 mx-auto -mt-10 w-full max-w-5xl px-3 sm:px-4 sm:-mt-14"
    >
      <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-3 sm:p-7 shadow-2xl">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-xl sm:rounded-2xl bg-muted/50 p-1 sm:p-1.5">
            <TabsTrigger value="vehicle" className="rounded-lg sm:rounded-xl py-2 sm:py-3 text-[11px] sm:text-sm font-bold">
              <Car className="mr-1 sm:mr-2 size-3 sm:size-4" />
              <span className="truncate">Vehicle</span>
            </TabsTrigger>
            <TabsTrigger value="package" className="rounded-lg sm:rounded-xl py-2 sm:py-3 text-[11px] sm:text-sm font-bold">
              <Compass className="mr-1 sm:mr-2 size-3 sm:size-4" />
              <span className="truncate">Packages</span>
            </TabsTrigger>
            <TabsTrigger value="hotel" className="rounded-lg sm:rounded-xl py-2 sm:py-3 text-[11px] sm:text-sm font-bold">
              <Building2 className="mr-1 sm:mr-2 size-3 sm:size-4" />
              <span className="truncate">Hotels</span>
            </TabsTrigger>
          </TabsList>

          {/* Vehicle ------------------------------------------------- */}
          <TabsContent value="vehicle" className="mt-4 sm:mt-6">
            <form
              className="grid grid-cols-2 gap-2 sm:gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!vehicle.pickupCity.trim()) {
                  setError("Please enter a pickup city.");
                  return;
                }
                saveLatestTravelSearch(vehicle);
                go("/fleet", { ...vehicle });
              }}
            >
              <Field label="Pickup city" htmlFor="v-pickup" icon={MapPin}>
                <Input
                  id="v-pickup"
                  list="sz-cities"
                  placeholder="e.g. Chennai"
                  value={vehicle.pickupCity}
                  onChange={(e) => setVehicle({ ...vehicle, pickupCity: e.target.value })}
                  className="h-8 sm:h-9 text-xs sm:text-sm border-border/60 bg-background px-2 sm:px-3"
                />
              </Field>

              <Field label="Drop city" htmlFor="v-drop" icon={Navigation}>
                <Input
                  id="v-drop"
                  list="sz-cities"
                  placeholder="e.g. Ooty"
                  value={vehicle.dropCity}
                  onChange={(e) => setVehicle({ ...vehicle, dropCity: e.target.value })}
                  className="h-8 sm:h-9 text-xs sm:text-sm border-border/60 bg-background px-2 sm:px-3"
                />
              </Field>

              <SelectField
                label="Trip type"
                value={vehicle.tripType}
                onChange={(v) => setVehicle({ ...vehicle, tripType: v })}
                options={searchOptions.tripTypes}
                icon={Compass}
              />

              <Field label="Pickup date" htmlFor="v-date" icon={Calendar}>
                <Input
                  id="v-date"
                  type="date"
                  value={vehicle.pickupDate}
                  onChange={(e) => setVehicle({ ...vehicle, pickupDate: e.target.value })}
                  className="h-8 sm:h-9 text-xs sm:text-sm border-border/60 bg-background px-2 sm:px-3"
                />
              </Field>

              <Field label="Pickup time" htmlFor="v-time" icon={Clock}>
                <Input
                  id="v-time"
                  type="time"
                  value={vehicle.pickupTime}
                  onChange={(e) => setVehicle({ ...vehicle, pickupTime: e.target.value })}
                  className="h-8 sm:h-9 text-xs sm:text-sm border-border/60 bg-background px-2 sm:px-3"
                />
              </Field>

              <Field label="Passengers" htmlFor="v-pax" icon={Users}>
                <Input
                  id="v-pax"
                  type="number"
                  min={1}
                  max={50}
                  value={vehicle.passengers}
                  onChange={(e) => setVehicle({ ...vehicle, passengers: e.target.value })}
                  className="h-8 sm:h-9 text-xs sm:text-sm border-border/60 bg-background px-2 sm:px-3"
                />
              </Field>

              <SelectField
                label="Vehicle type"
                value={vehicle.vehicleType}
                onChange={(v) => setVehicle({ ...vehicle, vehicleType: v })}
                options={searchOptions.vehicleTypes}
                icon={Car}
                className="col-span-2"
              />

              <div className="col-span-2 pt-1 sm:pt-2">
                <SubmitButton label="Search Vehicles" />
              </div>
            </form>
          </TabsContent>

          {/* Packages ------------------------------------------------ */}
          <TabsContent value="package" className="mt-4 sm:mt-6">
            <form
              className="grid grid-cols-2 gap-2 sm:gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!pkg.destination.trim()) {
                  setError("Please enter a destination.");
                  return;
                }
                go("/tour-packages", { ...pkg });
              }}
            >
              <Field label="Destination" htmlFor="p-dest" icon={MapPin}>
                <Input
                  id="p-dest"
                  list="sz-cities"
                  placeholder="e.g. Munnar"
                  value={pkg.destination}
                  onChange={(e) => setPkg({ ...pkg, destination: e.target.value })}
                  className="h-8 sm:h-9 text-xs sm:text-sm border-border/60 bg-background px-2 sm:px-3"
                />
              </Field>

              <SelectField
                label="Category"
                value={pkg.category}
                onChange={(v) => setPkg({ ...pkg, category: v })}
                options={searchOptions.packageCategories}
                icon={Compass}
              />

              <Field label="Travel date" htmlFor="p-date" icon={Calendar}>
                <Input
                  id="p-date"
                  type="date"
                  value={pkg.travelDate}
                  onChange={(e) => setPkg({ ...pkg, travelDate: e.target.value })}
                  className="h-8 sm:h-9 text-xs sm:text-sm border-border/60 bg-background px-2 sm:px-3"
                />
              </Field>

              <SelectField
                label="Duration"
                value={pkg.duration}
                onChange={(v) => setPkg({ ...pkg, duration: v })}
                options={searchOptions.durations}
                icon={Hourglass}
              />

              <Field label="Travellers" htmlFor="p-pax" icon={Users} className="col-span-2">
                <Input
                  id="p-pax"
                  type="number"
                  min={1}
                  max={60}
                  value={pkg.travellers}
                  onChange={(e) => setPkg({ ...pkg, travellers: e.target.value })}
                  className="h-8 sm:h-9 text-xs sm:text-sm border-border/60 bg-background px-2 sm:px-3"
                />
              </Field>

              <div className="col-span-2 pt-1 sm:pt-2">
                <SubmitButton label="Search Packages" />
              </div>
            </form>
          </TabsContent>

          {/* Hotels -------------------------------------------------- */}
          <TabsContent value="hotel" className="mt-4 sm:mt-6">
            <form
              className="grid grid-cols-2 gap-2 sm:gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!hotel.city.trim()) {
                  setError("Please enter a city or hotel name.");
                  return;
                }
                if (hotel.checkOut < hotel.checkIn) {
                  setError("Check-out date must be on or after check-in.");
                  return;
                }
                go("/hotels", { ...hotel });
              }}
            >
              <Field label="City or hotel" htmlFor="h-city" icon={Building2} className="col-span-2">
                <Input
                  id="h-city"
                  list="sz-cities"
                  placeholder="e.g. Ooty"
                  value={hotel.city}
                  onChange={(e) => setHotel({ ...hotel, city: e.target.value })}
                  className="h-8 sm:h-9 text-xs sm:text-sm border-border/60 bg-background px-2 sm:px-3"
                />
              </Field>

              <Field label="Check-in" htmlFor="h-in" icon={Calendar}>
                <Input
                  id="h-in"
                  type="date"
                  value={hotel.checkIn}
                  onChange={(e) => setHotel({ ...hotel, checkIn: e.target.value })}
                  className="h-8 sm:h-9 text-xs sm:text-sm border-border/60 bg-background px-2 sm:px-3"
                />
              </Field>

              <Field label="Check-out" htmlFor="h-out" icon={CalendarCheck}>
                <Input
                  id="h-out"
                  type="date"
                  value={hotel.checkOut}
                  onChange={(e) => setHotel({ ...hotel, checkOut: e.target.value })}
                  className="h-8 sm:h-9 text-xs sm:text-sm border-border/60 bg-background px-2 sm:px-3"
                />
              </Field>

              <Field label="Rooms" htmlFor="h-rooms" icon={BedDouble}>
                <Input
                  id="h-rooms"
                  type="number"
                  min={1}
                  max={20}
                  value={hotel.rooms}
                  onChange={(e) => setHotel({ ...hotel, rooms: e.target.value })}
                  className="h-8 sm:h-9 text-xs sm:text-sm border-border/60 bg-background px-2 sm:px-3"
                />
              </Field>

              <Field label="Guests" htmlFor="h-guests" icon={Users}>
                <Input
                  id="h-guests"
                  type="number"
                  min={1}
                  max={40}
                  value={hotel.guests}
                  onChange={(e) => setHotel({ ...hotel, guests: e.target.value })}
                  className="h-8 sm:h-9 text-xs sm:text-sm border-border/60 bg-background px-2 sm:px-3"
                />
              </Field>

              <div className="col-span-2 pt-1 sm:pt-2">
                <SubmitButton label="Search Hotels" />
              </div>
            </form>
          </TabsContent>
        </Tabs>

        {error ? (
          <p role="alert" className="mt-3 rounded-xl border border-destructive/20 bg-destructive/10 p-2.5 text-xs sm:text-sm font-semibold text-destructive">
            {error}
          </p>
        ) : null}

        <datalist id="sz-cities">
          {searchOptions.cities.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  icon: Icon,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`min-w-0 rounded-xl sm:rounded-2xl border border-border/80 bg-muted/20 p-2 sm:p-3.5 shadow-sm transition-all hover:border-primary/50 hover:bg-card focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 ${className ?? ""}`}
    >
      <div className="flex items-center gap-1 sm:gap-1.5 pb-1 sm:pb-1.5">
        {Icon ? <Icon className="size-3 sm:size-3.5 text-primary shrink-0" /> : null}
        <Label htmlFor={htmlFor} className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
          {label}
        </Label>
      </div>
      {children}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div
      className={`min-w-0 rounded-xl sm:rounded-2xl border border-border/80 bg-muted/20 p-2 sm:p-3.5 shadow-sm transition-all hover:border-primary/50 hover:bg-card focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 ${className ?? ""}`}
    >
      <div className="flex items-center gap-1 sm:gap-1.5 pb-1 sm:pb-1.5">
        {Icon ? <Icon className="size-3 sm:size-3.5 text-primary shrink-0" /> : null}
        <Label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">{label}</Label>
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label={label} className="h-8 sm:h-9 text-xs sm:text-sm w-full border-border/60 bg-background px-2 sm:px-3">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  return (
    <Button type="submit" size="lg" className="h-10 sm:h-12 w-full gap-2 rounded-xl text-xs sm:text-base font-bold shadow-md">
      <Search className="size-3.5 sm:size-4" aria-hidden="true" />
      {label}
    </Button>
  );
}

