import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addDaysISO, getRoomTypeOptions, hotelsSearchDefaults, todayISO } from "@/content/hotels";
import type { ListingStay } from "@/content/hotel-listing";

type Props = {
  stay: ListingStay;
  nights: number;
  resultCount: number;
  destinationLocked?: boolean;
  onApply: (stay: ListingStay) => void;
  idPrefix?: string;
};

export function SearchSummaryBar({
  stay,
  nights,
  resultCount,
  destinationLocked = false,
  onApply,
  idPrefix = "summary",
}: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ListingStay>(stay);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setDraft(stay), [stay]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.checkIn || !draft.checkOut) {
      setError("Select both check-in and check-out dates.");
      return;
    }
    if (draft.checkOut <= draft.checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }
    if (draft.adults < 1) {
      setError("At least one adult is required.");
      return;
    }
    if (draft.rooms < 1) {
      setError("At least one room is required.");
      return;
    }
    setError(null);
    onApply(draft);
    setOpen(false);
  };

  return (
    <section
      aria-label="Search summary"
      className="rounded-xl border bg-card p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="break-words">{stay.destination || "All destinations"}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              {stay.checkIn} → {stay.checkOut} ({nights} night{nights === 1 ? "" : "s"})
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              {stay.rooms} room{stay.rooms === 1 ? "" : "s"}, {stay.adults} adult
              {stay.adults === 1 ? "" : "s"}
              {stay.children ? `, ${stay.children} child${stay.children === 1 ? "" : "ren"}` : ""}
            </span>
          </p>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {resultCount} propert{resultCount === 1 ? "y" : "ies"} match this search
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={`${idPrefix}-modify`}
        >
          <Search className="mr-1 h-4 w-4" aria-hidden="true" />
          {open ? "Close" : "Modify search"}
        </Button>
      </div>

      {open ? (
        <form
          id={`${idPrefix}-modify`}
          onSubmit={submit}
          className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2 lg:grid-cols-7"
        >
          <div className="min-w-0 lg:col-span-2">
            <Label htmlFor={`${idPrefix}-dest`}>Destination</Label>
            <Input
              id={`${idPrefix}-dest`}
              value={draft.destination}
              disabled={destinationLocked}
              placeholder="City, area or hotel"
              onChange={(e) => setDraft({ ...draft, destination: e.target.value })}
            />
          </div>
          <div className="min-w-0">
            <Label htmlFor={`${idPrefix}-in`}>Check-in</Label>
            <Input
              id={`${idPrefix}-in`}
              type="date"
              min={todayISO()}
              value={draft.checkIn}
              onChange={(e) => {
                const checkIn = e.target.value;
                setDraft({
                  ...draft,
                  checkIn,
                  checkOut:
                    draft.checkOut && draft.checkOut > checkIn
                      ? draft.checkOut
                      : addDaysISO(checkIn, 1),
                });
              }}
            />
          </div>
          <div className="min-w-0">
            <Label htmlFor={`${idPrefix}-out`}>Check-out</Label>
            <Input
              id={`${idPrefix}-out`}
              type="date"
              min={addDaysISO(draft.checkIn || todayISO(), 1)}
              value={draft.checkOut}
              onChange={(e) => setDraft({ ...draft, checkOut: e.target.value })}
            />
          </div>
          <div className="min-w-0">
            <Label htmlFor={`${idPrefix}-rooms`}>Rooms</Label>
            <Input
              id={`${idPrefix}-rooms`}
              type="number"
              inputMode="numeric"
              min={1}
              max={hotelsSearchDefaults.maxRooms}
              value={draft.rooms}
              onChange={(e) => setDraft({ ...draft, rooms: Number(e.target.value) || 1 })}
            />
          </div>
          <div className="min-w-0">
            <Label htmlFor={`${idPrefix}-adults`}>Adults</Label>
            <Input
              id={`${idPrefix}-adults`}
              type="number"
              inputMode="numeric"
              min={1}
              max={hotelsSearchDefaults.maxAdults}
              value={draft.adults}
              onChange={(e) => setDraft({ ...draft, adults: Number(e.target.value) || 1 })}
            />
          </div>
          <div className="min-w-0">
            <Label htmlFor={`${idPrefix}-children`}>Children</Label>
            <Input
              id={`${idPrefix}-children`}
              type="number"
              inputMode="numeric"
              min={0}
              max={hotelsSearchDefaults.maxChildren}
              value={draft.children}
              onChange={(e) => setDraft({ ...draft, children: Number(e.target.value) || 0 })}
            />
          </div>
          <div className="min-w-0 sm:col-span-2 lg:col-span-2">
            <Label htmlFor={`${idPrefix}-roomtype`}>Room type</Label>
            <Select
              value={draft.roomType || "any"}
              onValueChange={(v) => setDraft({ ...draft, roomType: v })}
            >
              <SelectTrigger id={`${idPrefix}-roomtype`} className="w-full">
                <SelectValue placeholder="Any room type" />
              </SelectTrigger>
              <SelectContent>
                {getRoomTypeOptions().map((r) => (
                  <SelectItem key={r.slug} value={r.slug}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end sm:col-span-2 lg:col-span-2">
            <Button type="submit" className="w-full">
              Update availability
            </Button>
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive sm:col-span-2 lg:col-span-7">
              {error}
            </p>
          ) : null}
        </form>
      ) : null}
    </section>
  );
}
