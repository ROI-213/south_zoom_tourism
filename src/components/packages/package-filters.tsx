import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getPackageDestinations,
  getPackageStartingCities,
  getPackageStates,
  hotelCategoryOptions,
  vehicleCategoryOptions,
  packageBudgetBounds,
  packageCategories,
} from "@/content/tour-packages";

export type PackageFilterState = {
  categories: string[];
  state: string;
  destination: string;
  startingCity: string;
  duration: string; // "all" | "1-2" | "3-4" | "5+"
  travelDate: string;
  maxBudget: number;
  travellers: number;
  hotelCategory: string;
  vehicleCategory: string;
};

export const defaultPackageFilters: PackageFilterState = {
  categories: [],
  state: "all",
  destination: "all",
  startingCity: "all",
  duration: "all",
  travelDate: "",
  maxBudget: packageBudgetBounds.max,
  travellers: 0,
  hotelCategory: "all",
  vehicleCategory: "all",
};

export const durationOptions = [
  { value: "all", label: "Any duration" },
  { value: "1-2", label: "1 – 2 days" },
  { value: "3-4", label: "3 – 4 days" },
  { value: "5+", label: "5 days or more" },
];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-border pt-4 first:border-t-0 first:pt-0">
      <legend className="mb-2 text-sm font-bold">{title}</legend>
      {children}
    </fieldset>
  );
}

function Select({
  id,
  label,
  value,
  options,
  anyLabel,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  anyLabel: string;
  onChange: (next: string) => void;
}) {
  return (
    <>
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <select
        id={id}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <option value="all">{anyLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </>
  );
}

export function PackageFilters({
  value,
  onChange,
  onClear,
  idPrefix = "pf",
}: {
  value: PackageFilterState;
  onChange: (next: Partial<PackageFilterState>) => void;
  onClear: () => void;
  /** Keeps ids unique when the panel renders twice (sidebar + drawer). */
  idPrefix?: string;
}) {
  const toggleCategory = (slug: string, checked: boolean) =>
    onChange({
      categories: checked
        ? [...value.categories, slug]
        : value.categories.filter((c) => c !== slug),
    });

  return (
    <div className="grid gap-5">
      <Group title="Package type">
        <ul className="grid gap-2">
          {packageCategories
            .filter((c) => c.visible)
            .sort((a, b) => a.order - b.order)
            .map((category) => (
              <li key={category.id} className="flex items-center gap-2">
                <Checkbox
                  id={`${idPrefix}-cat-${category.slug}`}
                  checked={value.categories.includes(category.slug)}
                  onCheckedChange={(checked) => toggleCategory(category.slug, checked === true)}
                />
                <Label
                  htmlFor={`${idPrefix}-cat-${category.slug}`}
                  className="text-sm font-normal"
                >
                  {category.label}
                </Label>
              </li>
            ))}
        </ul>
      </Group>

      <Group title="State">
        <Select
          id={`${idPrefix}-state`}
          label="Filter by state"
          value={value.state}
          options={getPackageStates()}
          anyLabel="All states"
          onChange={(state) => onChange({ state })}
        />
      </Group>

      <Group title="Destination">
        <Select
          id={`${idPrefix}-destination`}
          label="Filter by destination"
          value={value.destination}
          options={getPackageDestinations()}
          anyLabel="All destinations"
          onChange={(destination) => onChange({ destination })}
        />
      </Group>

      <Group title="Starting city">
        <Select
          id={`${idPrefix}-city`}
          label="Filter by starting city"
          value={value.startingCity}
          options={getPackageStartingCities()}
          anyLabel="Any starting city"
          onChange={(startingCity) => onChange({ startingCity })}
        />
      </Group>

      <Group title="Duration">
        <div className="flex flex-wrap gap-2">
          {durationOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={value.duration === option.value}
              onClick={() => onChange({ duration: option.value })}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                value.duration === option.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Travel date">
        <Label htmlFor={`${idPrefix}-date`} className="sr-only">
          Travel date
        </Label>
        <Input
          id={`${idPrefix}-date`}
          type="date"
          value={value.travelDate}
          onChange={(event) => onChange({ travelDate: event.target.value })}
        />
      </Group>

      <Group title="Budget">
        <p className="mb-3 text-sm text-muted-foreground">
          Up to{" "}
          <span className="font-semibold text-foreground">
            ₹{value.maxBudget.toLocaleString("en-IN")}
          </span>
        </p>
        <Slider
          aria-label="Maximum budget"
          min={packageBudgetBounds.min}
          max={packageBudgetBounds.max}
          step={500}
          value={[value.maxBudget]}
          onValueChange={([next]) => onChange({ maxBudget: next })}
        />
      </Group>

      <Group title="Travellers">
        <Label htmlFor={`${idPrefix}-travellers`} className="sr-only">
          Number of travellers
        </Label>
        <select
          id={`${idPrefix}-travellers`}
          aria-label="Number of travellers"
          value={value.travellers}
          onChange={(event) => onChange({ travellers: Number(event.target.value) })}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {[0, 2, 4, 6, 10, 15, 20].map((count) => (
            <option key={count} value={count}>
              {count === 0 ? "Any group size" : `${count}+ travellers`}
            </option>
          ))}
        </select>
      </Group>

      <Group title="Hotel category">
        <Select
          id={`${idPrefix}-hotel`}
          label="Filter by hotel category"
          value={value.hotelCategory}
          options={hotelCategoryOptions}
          anyLabel="Any hotel category"
          onChange={(hotelCategory) => onChange({ hotelCategory })}
        />
      </Group>

      <Group title="Vehicle category">
        <Select
          id={`${idPrefix}-vehicle`}
          label="Filter by vehicle category"
          value={value.vehicleCategory}
          options={vehicleCategoryOptions}
          anyLabel="Any vehicle"
          onChange={(vehicleCategory) => onChange({ vehicleCategory })}
        />
      </Group>

      <Button type="button" variant="outline" onClick={onClear}>
        Clear all filters
      </Button>
    </div>
  );
}
