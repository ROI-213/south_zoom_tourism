import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRoomTypeOptions, getVisibleCategories } from "@/content/hotels";
import {
  getVisibleAmenityFacets,
  getVisibleMealPlans,
  type ListingFilterState,
} from "@/content/hotel-listing";

export type LocalityFacet = { locality: string; count: number };

type Props = {
  filters: ListingFilterState;
  localities: LocalityFacet[];
  priceBounds: { min: number; max: number };
  onChange: (patch: Partial<ListingFilterState>) => void;
  onReset: () => void;
  idPrefix: string;
};

const toggle = <T,>(list: T[], value: T) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

const guestRatingOptions = [
  { value: 4.5, label: "4.5+ Exceptional" },
  { value: 4, label: "4.0+ Excellent" },
  { value: 3.5, label: "3.5+ Very good" },
];

const distanceOptions = [
  { value: 2, label: "Within 2 km" },
  { value: 5, label: "Within 5 km" },
  { value: 10, label: "Within 10 km" },
];

export function ListingFilters({
  filters,
  localities,
  priceBounds,
  onChange,
  onReset,
  idPrefix,
}: Props) {
  const categories = getVisibleCategories();
  const roomTypes = getRoomTypeOptions().filter((r) => r.slug !== "any");
  const meals = getVisibleMealPlans();
  const amenities = getVisibleAmenityFacets();

  const box = (id: string, label: string, checked: boolean, onToggle: () => void, hint?: string) => (
    <div key={id} className="flex items-start gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onToggle} className="mt-0.5" />
      <Label htmlFor={id} className="cursor-pointer text-sm font-normal leading-snug">
        {label}
        {hint ? <span className="ml-1 text-xs text-muted-foreground">{hint}</span> : null}
      </Label>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide">Filters</h2>
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          Clear all
        </Button>
      </div>
      <Separator />

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Nightly price (₹)</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="min-w-0">
            <Label htmlFor={`${idPrefix}-minprice`} className="text-xs text-muted-foreground">
              Min
            </Label>
            <Input
              id={`${idPrefix}-minprice`}
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={String(priceBounds.min)}
              value={filters.minPrice ?? ""}
              onChange={(e) =>
                onChange({ minPrice: e.target.value === "" ? null : Number(e.target.value) })
              }
            />
          </div>
          <div className="min-w-0">
            <Label htmlFor={`${idPrefix}-maxprice`} className="text-xs text-muted-foreground">
              Max
            </Label>
            <Input
              id={`${idPrefix}-maxprice`}
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={String(priceBounds.max)}
              value={filters.maxPrice ?? ""}
              onChange={(e) =>
                onChange({ maxPrice: e.target.value === "" ? null : Number(e.target.value) })
              }
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Booking policy</h3>
        {box(
          `${idPrefix}-freecancel`,
          "Free cancellation",
          filters.freeCancellation,
          () => onChange({ freeCancellation: !filters.freeCancellation }),
        )}
        {box(`${idPrefix}-payhotel`, "Pay at hotel", filters.payAtHotel, () =>
          onChange({ payAtHotel: !filters.payAtHotel }),
        )}
        {box(
          `${idPrefix}-instant`,
          "Instant confirmation",
          filters.instantConfirmation,
          () => onChange({ instantConfirmation: !filters.instantConfirmation }),
        )}
      </div>

      <Separator />

      <Accordion
        type="multiple"
        defaultValue={["locality", "category", "star", "guest", "roomtype", "meal", "amenities", "rooms", "distance"]}
      >
        <AccordionItem value="locality">
          <AccordionTrigger className="text-sm">Locality</AccordionTrigger>
          <AccordionContent className="space-y-2">
            {localities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No localities in this search.</p>
            ) : (
              localities.map((l) =>
                box(
                  `${idPrefix}-loc-${l.locality}`,
                  l.locality,
                  filters.localities.includes(l.locality),
                  () => onChange({ localities: toggle(filters.localities, l.locality) }),
                  `(${l.count})`,
                ),
              )
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="category">
          <AccordionTrigger className="text-sm">Property category</AccordionTrigger>
          <AccordionContent className="space-y-2">
            {categories.map((c) =>
              box(
                `${idPrefix}-cat-${c.slug}`,
                c.label,
                filters.categories.includes(c.slug),
                () => onChange({ categories: toggle(filters.categories, c.slug) }),
              ),
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="star">
          <AccordionTrigger className="text-sm">Star rating</AccordionTrigger>
          <AccordionContent className="space-y-2">
            {[5, 4, 3, 2].map((star) =>
              box(
                `${idPrefix}-star-${star}`,
                `${star} star`,
                filters.starRatings.includes(star),
                () => onChange({ starRatings: toggle(filters.starRatings, star) }),
              ),
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="guest">
          <AccordionTrigger className="text-sm">Guest rating</AccordionTrigger>
          <AccordionContent>
            <Select
              value={filters.minGuestRating === null ? "any" : String(filters.minGuestRating)}
              onValueChange={(v) =>
                onChange({ minGuestRating: v === "any" ? null : Number(v) })
              }
            >
              <SelectTrigger className="w-full" aria-label="Minimum guest rating">
                <SelectValue placeholder="Any rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any rating</SelectItem>
                {guestRatingOptions.map((o) => (
                  <SelectItem key={o.value} value={String(o.value)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="roomtype">
          <AccordionTrigger className="text-sm">Room type</AccordionTrigger>
          <AccordionContent className="space-y-2">
            {roomTypes.map((r) =>
              box(
                `${idPrefix}-rt-${r.slug}`,
                r.label,
                filters.roomTypes.includes(r.slug),
                () => onChange({ roomTypes: toggle(filters.roomTypes, r.slug) }),
              ),
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="meal">
          <AccordionTrigger className="text-sm">Meal plan</AccordionTrigger>
          <AccordionContent className="space-y-2">
            {meals.map((m) =>
              box(
                `${idPrefix}-meal-${m.slug}`,
                m.label,
                filters.mealPlans.includes(m.slug),
                () => onChange({ mealPlans: toggle(filters.mealPlans, m.slug) }),
              ),
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="amenities">
          <AccordionTrigger className="text-sm">Amenities</AccordionTrigger>
          <AccordionContent className="space-y-2">
            {amenities.map((a) =>
              box(
                `${idPrefix}-am-${a.slug}`,
                a.label,
                filters.amenities.includes(a.slug),
                () => onChange({ amenities: toggle(filters.amenities, a.slug) }),
              ),
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rooms">
          <AccordionTrigger className="text-sm">Available rooms</AccordionTrigger>
          <AccordionContent className="space-y-2">
            {[1, 3, 5].map((n) =>
              box(
                `${idPrefix}-avail-${n}`,
                n === 1 ? "At least 1 room free" : `${n}+ rooms free`,
                filters.minRoomsAvailable === n,
                () => onChange({ minRoomsAvailable: filters.minRoomsAvailable === n ? null : n }),
              ),
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="distance">
          <AccordionTrigger className="text-sm">Distance from landmark</AccordionTrigger>
          <AccordionContent className="space-y-2">
            {distanceOptions.map((d) =>
              box(
                `${idPrefix}-dist-${d.value}`,
                d.label,
                filters.maxDistanceKm === d.value,
                () =>
                  onChange({ maxDistanceKm: filters.maxDistanceKm === d.value ? null : d.value }),
              ),
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
