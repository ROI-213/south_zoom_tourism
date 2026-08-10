import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  destinationTripTypes,
  getDestinationStates,
  type DestinationFilterState,
} from "@/content/destinations";

export const popularityOptions = [
  { value: "all", label: "All destinations" },
  { value: "popular", label: "Popular only" },
  { value: "featured", label: "Featured only" },
];

export function DestinationFilters({
  value,
  onChange,
  onClear,
  idPrefix = "dest",
}: {
  value: DestinationFilterState;
  onChange: (next: Partial<DestinationFilterState>) => void;
  onClear: () => void;
  idPrefix?: string;
}) {
  const states = getDestinationStates();
  const selectClass =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor={`${idPrefix}-query`}>Search destinations</Label>
        <div className="relative mt-1.5">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id={`${idPrefix}-query`}
            type="search"
            value={value.query}
            placeholder="Ooty, beach, temple town…"
            onChange={(e) => onChange({ query: e.target.value })}
            className="pl-9"
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-state`}>State</Label>
        <select
          id={`${idPrefix}-state`}
          className={`mt-1.5 ${selectClass}`}
          value={value.state}
          onChange={(e) => onChange({ state: e.target.value })}
        >
          <option value="all">All states</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-trip-type`}>Trip type</Label>
        <select
          id={`${idPrefix}-trip-type`}
          className={`mt-1.5 ${selectClass}`}
          value={value.tripType}
          onChange={(e) => onChange({ tripType: e.target.value })}
        >
          <option value="all">Any trip type</option>
          {destinationTripTypes
            .filter((t) => t.visible)
            .sort((a, b) => a.order - b.order)
            .map((t) => (
              <option key={t.id} value={t.slug}>
                {t.label}
              </option>
            ))}
        </select>
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-popularity`}>Popularity</Label>
        <select
          id={`${idPrefix}-popularity`}
          className={`mt-1.5 ${selectClass}`}
          value={value.popularity}
          onChange={(e) => onChange({ popularity: e.target.value })}
        >
          {popularityOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <Button type="button" variant="outline" onClick={onClear}>
        Clear filters
      </Button>
    </div>
  );
}
