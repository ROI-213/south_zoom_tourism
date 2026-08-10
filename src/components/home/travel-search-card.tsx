import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
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

  const [vehicle, setVehicle] = useState<VehicleForm>({
    pickupCity: "",
    dropCity: "",
    tripType: searchOptions.tripTypes[0],
    pickupDate: today(),
    pickupTime: "09:00",
    passengers: "2",
    vehicleType: "Any",
  });

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
      className="relative z-10 mx-auto -mt-10 w-full max-w-6xl px-4 sm:-mt-14"
    >
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xl sm:p-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid h-auto w-full grid-cols-1 gap-1 sm:grid-cols-3">
            <TabsTrigger value="vehicle" className="py-2.5 text-xs sm:text-sm">
              Vehicle Booking
            </TabsTrigger>
            <TabsTrigger value="package" className="py-2.5 text-xs sm:text-sm">
              Tour Packages
            </TabsTrigger>
            <TabsTrigger value="hotel" className="py-2.5 text-xs sm:text-sm">
              Hotels &amp; Rooms
            </TabsTrigger>
          </TabsList>

          {/* Vehicle ------------------------------------------------- */}
          <TabsContent value="vehicle" className="mt-5">
            <form
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!vehicle.pickupCity.trim()) {
                  setError("Please enter a pickup city.");
                  return;
                }
                go("/fleet", { ...vehicle });
              }}
            >
              <Field label="Pickup city" htmlFor="v-pickup">
                <Input
                  id="v-pickup"
                  list="sz-cities"
                  placeholder="e.g. Chennai"
                  value={vehicle.pickupCity}
                  onChange={(e) => setVehicle({ ...vehicle, pickupCity: e.target.value })}
                />
              </Field>
              <Field label="Drop city" htmlFor="v-drop">
                <Input
                  id="v-drop"
                  list="sz-cities"
                  placeholder="e.g. Ooty"
                  value={vehicle.dropCity}
                  onChange={(e) => setVehicle({ ...vehicle, dropCity: e.target.value })}
                />
              </Field>
              <SelectField
                label="Trip type"
                value={vehicle.tripType}
                onChange={(v) => setVehicle({ ...vehicle, tripType: v })}
                options={searchOptions.tripTypes}
              />
              <Field label="Pickup date" htmlFor="v-date">
                <Input
                  id="v-date"
                  type="date"
                  value={vehicle.pickupDate}
                  onChange={(e) => setVehicle({ ...vehicle, pickupDate: e.target.value })}
                />
              </Field>
              <Field label="Pickup time" htmlFor="v-time">
                <Input
                  id="v-time"
                  type="time"
                  value={vehicle.pickupTime}
                  onChange={(e) => setVehicle({ ...vehicle, pickupTime: e.target.value })}
                />
              </Field>
              <Field label="Passengers" htmlFor="v-pax">
                <Input
                  id="v-pax"
                  type="number"
                  min={1}
                  max={50}
                  value={vehicle.passengers}
                  onChange={(e) => setVehicle({ ...vehicle, passengers: e.target.value })}
                />
              </Field>
              <SelectField
                label="Vehicle type"
                value={vehicle.vehicleType}
                onChange={(v) => setVehicle({ ...vehicle, vehicleType: v })}
                options={searchOptions.vehicleTypes}
              />
              <SubmitButton label="Search Vehicles" />
            </form>
          </TabsContent>

          {/* Packages ------------------------------------------------ */}
          <TabsContent value="package" className="mt-5">
            <form
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (!pkg.destination.trim()) {
                  setError("Please enter a destination.");
                  return;
                }
                go("/tour-packages", { ...pkg });
              }}
            >
              <Field label="Destination" htmlFor="p-dest">
                <Input
                  id="p-dest"
                  list="sz-cities"
                  placeholder="e.g. Munnar"
                  value={pkg.destination}
                  onChange={(e) => setPkg({ ...pkg, destination: e.target.value })}
                />
              </Field>
              <SelectField
                label="Category"
                value={pkg.category}
                onChange={(v) => setPkg({ ...pkg, category: v })}
                options={searchOptions.packageCategories}
              />
              <Field label="Travel date" htmlFor="p-date">
                <Input
                  id="p-date"
                  type="date"
                  value={pkg.travelDate}
                  onChange={(e) => setPkg({ ...pkg, travelDate: e.target.value })}
                />
              </Field>
              <SelectField
                label="Duration"
                value={pkg.duration}
                onChange={(v) => setPkg({ ...pkg, duration: v })}
                options={searchOptions.durations}
              />
              <Field label="Travellers" htmlFor="p-pax">
                <Input
                  id="p-pax"
                  type="number"
                  min={1}
                  max={60}
                  value={pkg.travellers}
                  onChange={(e) => setPkg({ ...pkg, travellers: e.target.value })}
                />
              </Field>
              <div className="lg:col-span-5">
                <SubmitButton label="Search Packages" />
              </div>
            </form>
          </TabsContent>

          {/* Hotels -------------------------------------------------- */}
          <TabsContent value="hotel" className="mt-5">
            <form
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
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
              <Field label="City or hotel" htmlFor="h-city">
                <Input
                  id="h-city"
                  list="sz-cities"
                  placeholder="e.g. Ooty"
                  value={hotel.city}
                  onChange={(e) => setHotel({ ...hotel, city: e.target.value })}
                />
              </Field>
              <Field label="Check-in" htmlFor="h-in">
                <Input
                  id="h-in"
                  type="date"
                  value={hotel.checkIn}
                  onChange={(e) => setHotel({ ...hotel, checkIn: e.target.value })}
                />
              </Field>
              <Field label="Check-out" htmlFor="h-out">
                <Input
                  id="h-out"
                  type="date"
                  value={hotel.checkOut}
                  onChange={(e) => setHotel({ ...hotel, checkOut: e.target.value })}
                />
              </Field>
              <Field label="Rooms" htmlFor="h-rooms">
                <Input
                  id="h-rooms"
                  type="number"
                  min={1}
                  max={20}
                  value={hotel.rooms}
                  onChange={(e) => setHotel({ ...hotel, rooms: e.target.value })}
                />
              </Field>
              <Field label="Guests" htmlFor="h-guests">
                <Input
                  id="h-guests"
                  type="number"
                  min={1}
                  max={40}
                  value={hotel.guests}
                  onChange={(e) => setHotel({ ...hotel, guests: e.target.value })}
                />
              </Field>
              <div className="lg:col-span-5">
                <SubmitButton label="Search Hotels" />
              </div>
            </form>
          </TabsContent>
        </Tabs>

        {error ? (
          <p role="alert" className="mt-4 text-sm font-medium text-destructive">
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
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-semibold text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label={label} className="w-full">
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
    <div className="flex items-end">
      <Button type="submit" size="lg" className="w-full gap-2">
        <Search className="h-4 w-4" aria-hidden="true" />
        {label}
      </Button>
    </div>
  );
}
