import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  getVisibleVehicleCategories,
  tripTypeOptions,
  fleetPriceBounds,
} from "@/content/fleet";

export type FleetFilterState = {
  categories: string[];
  ac: string; // "all" | "ac" | "non-ac"
  seats: number;
  luggage: number;
  trip: string; // "all" | TripType
  maxPrice: number;
  availableOnly: boolean;
};

export const defaultFleetFilters: FleetFilterState = {
  categories: [],
  ac: "all",
  seats: 0,
  luggage: 0,
  trip: "all",
  maxPrice: fleetPriceBounds.max,
  availableOnly: false,
};

const seatChoices = [0, 4, 6, 7, 12, 17, 27];
const luggageChoices = [0, 2, 3, 4, 10, 20];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-border pt-4 first:border-t-0 first:pt-0">
      <legend className="mb-2 text-sm font-bold">{title}</legend>
      {children}
    </fieldset>
  );
}

export function FleetFilters({
  value,
  onChange,
  onClear,
}: {
  value: FleetFilterState;
  onChange: (next: Partial<FleetFilterState>) => void;
  onClear: () => void;
}) {
  const categories = getVisibleVehicleCategories();

  const toggleCategory = (slug: string, checked: boolean) => {
    onChange({
      categories: checked
        ? [...value.categories, slug]
        : value.categories.filter((c) => c !== slug),
    });
  };

  return (
    <div className="grid gap-5">
      <Group title="Vehicle type">
        <ul className="grid gap-2">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${category.slug}`}
                checked={value.categories.includes(category.slug)}
                onCheckedChange={(checked) => toggleCategory(category.slug, checked === true)}
              />
              <Label htmlFor={`cat-${category.slug}`} className="text-sm font-normal">
                {category.label}
              </Label>
            </li>
          ))}
        </ul>
      </Group>

      <Group title="Air conditioning">
        <div className="flex flex-wrap gap-2">
          {[
            { v: "all", label: "Any" },
            { v: "ac", label: "AC" },
            { v: "non-ac", label: "Non-AC" },
          ].map((option) => (
            <button
              key={option.v}
              type="button"
              aria-pressed={value.ac === option.v}
              onClick={() => onChange({ ac: option.v })}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                value.ac === option.v
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Minimum passengers">
        <select
          aria-label="Minimum passenger capacity"
          value={value.seats}
          onChange={(event) => onChange({ seats: Number(event.target.value) })}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {seatChoices.map((seats) => (
            <option key={seats} value={seats}>
              {seats === 0 ? "Any capacity" : `${seats}+ passengers`}
            </option>
          ))}
        </select>
      </Group>

      <Group title="Minimum luggage">
        <select
          aria-label="Minimum luggage capacity"
          value={value.luggage}
          onChange={(event) => onChange({ luggage: Number(event.target.value) })}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {luggageChoices.map((bags) => (
            <option key={bags} value={bags}>
              {bags === 0 ? "Any luggage" : `${bags}+ bags`}
            </option>
          ))}
        </select>
      </Group>

      <Group title="Trip type">
        <div className="flex flex-wrap gap-2">
          {[{ value: "all", label: "Any" }, ...tripTypeOptions].map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={value.trip === option.value}
              onClick={() => onChange({ trip: option.value })}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                value.trip === option.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Maximum rate">
        <p className="mb-3 text-sm text-muted-foreground">
          Up to <span className="font-semibold text-foreground">₹{value.maxPrice}</span> per km
        </p>
        <Slider
          aria-label="Maximum rate per kilometre"
          min={fleetPriceBounds.min}
          max={fleetPriceBounds.max}
          step={1}
          value={[value.maxPrice]}
          onValueChange={([next]) => onChange({ maxPrice: next })}
        />
      </Group>

      <Group title="Availability">
        <div className="flex items-center gap-2">
          <Checkbox
            id="available-only"
            checked={value.availableOnly}
            onCheckedChange={(checked) => onChange({ availableOnly: checked === true })}
          />
          <Label htmlFor="available-only" className="text-sm font-normal">
            Available now only
          </Label>
        </div>
      </Group>

      <Button type="button" variant="outline" onClick={onClear}>
        Clear all filters
      </Button>
    </div>
  );
}
