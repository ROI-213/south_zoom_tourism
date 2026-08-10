import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BedDouble, Check, Maximize2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HotelRecord } from "@/content/hotels";
import type { RoomSelection, RoomStay } from "@/content/hotel-details";
import { getRoomSlug } from "@/content/room-details";

const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export function RoomSelectCard({
  hotel,
  selection,
  stay,
  taxPercent,
}: {
  hotel: HotelRecord;
  selection: RoomSelection;
  stay: RoomStay;
  taxPercent: number;
}) {
  const { room, details, plans, nights, unitsAvailable, status } = selection;
  const soldOut = status === "sold-out" || plans.length === 0;

  const [planId, setPlanId] = useState(plans[0]?.ratePlan.id ?? "");
  const maxQty = Math.max(1, unitsAvailable);
  const [qty, setQty] = useState(String(Math.min(Math.max(1, stay.rooms), maxQty)));

  const plan = useMemo(
    () => plans.find((p) => p.ratePlan.id === planId) ?? plans[0] ?? null,
    [plans, planId],
  );

  const quantity = Math.min(Number(qty) || 1, maxQty);
  const subtotal = plan ? plan.nightlyRate * nights * quantity : 0;
  const tax = Math.round((subtotal * taxPercent) / 100);
  const total = subtotal + tax;

  const bookSearch: Record<string, string> = {
    hotel: hotel.name,
    city: hotel.city,
    room: room.name,
    ratePlan: plan?.mealPlanLabel ?? "",
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    rooms: String(quantity),
    adults: String(stay.adults),
    children: String(stay.children),
    estimate: soldOut ? "" : String(total),
    subject: soldOut
      ? `Alternative rooms — ${hotel.name}, ${hotel.city}`
      : `Room booking — ${room.name}, ${hotel.name}`,
  };

  return (
    <Card
      className="overflow-hidden"
      data-testid="room-select-card"
      data-room={room.id}
      data-status={status}
    >
      <div className="grid gap-0 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
        <div className="bg-muted">
          <img
            src={room.image}
            alt={room.imageAlt}
            width={1200}
            height={900}
            loading="lazy"
            decoding="async"
            sizes="(min-width: 768px) 220px, 100vw"
            className="aspect-[4/3] h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-foreground">{room.name}</h3>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <BedDouble className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {room.bedType}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  Up to {room.maxAdults} adults
                  {room.maxChildren > 0 ? ` + ${room.maxChildren} children` : ""}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Maximize2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {room.sizeSqft} sq ft
                </span>
              </p>
            </div>
            {soldOut ? (
              <Badge variant="destructive">Sold out</Badge>
            ) : (
              <Badge variant={status === "limited" ? "secondary" : "outline"}>
                {unitsAvailable} room{unitsAvailable === 1 ? "" : "s"} left
              </Badge>
            )}
          </div>

          {(details?.highlights?.length || room.amenities.length) > 0 && (
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {Array.from(new Set([...(details?.highlights ?? []), ...room.amenities]))
                .slice(0, 6)
                .map((item) => (
                  <li key={item} className="inline-flex items-center gap-1">
                    <Check className="h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
            </ul>
          )}

          {soldOut ? (
            <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
              This room has no inventory for {stay.checkIn} → {stay.checkOut}. Change the dates
              or ask us to hold a similar room.
            </p>
          ) : (
            <>
              <fieldset className="space-y-2">
                <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Meal plan &amp; cancellation
                </legend>
                <RadioGroup
                  value={plan?.ratePlan.id ?? ""}
                  onValueChange={setPlanId}
                  className="gap-2"
                >
                  {plans.map((option) => {
                    const id = `${room.id}-${option.ratePlan.id}`;
                    return (
                      <div
                        key={option.ratePlan.id}
                        className="flex min-w-0 items-start gap-3 rounded-lg border p-3"
                      >
                        <RadioGroupItem value={option.ratePlan.id} id={id} className="mt-1" />
                        <Label htmlFor={id} className="min-w-0 flex-1 cursor-pointer font-normal">
                          <span className="flex flex-wrap items-baseline justify-between gap-2">
                            <span className="text-sm font-medium">{option.mealPlanLabel}</span>
                            <span className="text-sm font-semibold">
                              {inr(option.nightlyRate)}
                              <span className="text-xs font-normal text-muted-foreground">
                                {" "}
                                / night
                              </span>
                            </span>
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {option.refundable ? "Refundable · " : "Non-refundable · "}
                            {option.cancellationTerms}
                          </span>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </fieldset>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,140px)_minmax(0,1fr)] sm:items-end">
                <div className="min-w-0">
                  <Label htmlFor={`${room.id}-qty`} className="text-xs">
                    Rooms
                  </Label>
                  <Select value={String(quantity)} onValueChange={setQty}>
                    <SelectTrigger id={`${room.id}-qty`} className="mt-1 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: maxQty }).map((_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {i + 1} room{i === 0 ? "" : "s"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-0 rounded-lg bg-muted p-3 text-sm">
                  <p className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-muted-foreground">
                      {quantity} room{quantity === 1 ? "" : "s"} × {nights} night
                      {nights === 1 ? "" : "s"}
                    </span>
                    <span className="font-medium">{inr(subtotal)}</span>
                  </p>
                  <p className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-muted-foreground">Taxes &amp; fees ({taxPercent}%)</span>
                    <span className="font-medium">{inr(tax)}</span>
                  </p>
                  <p className="mt-1 flex flex-wrap items-baseline justify-between gap-2 border-t pt-1">
                    <span className="font-semibold">Total payable</span>
                    <span className="text-base font-bold text-foreground">{inr(total)}</span>
                  </p>
                  {details?.extraBedCharge ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Extra bed {inr(details.extraBedCharge)} / night — {details.extraBedNote}
                    </p>
                  ) : null}
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="w-full sm:w-auto" variant={soldOut ? "outline" : "default"}>
              {soldOut ? (
                <Link to="/contact-us" search={bookSearch}>
                  Request alternatives
                </Link>
              ) : (
                <Link
                  to="/book/hotel"
                  search={{
                    hotel: hotel.slug,
                    room: room.id,
                    destination: hotel.city,
                    checkIn: stay.checkIn,
                    checkOut: stay.checkOut,
                    rooms: quantity,
                    adults: stay.adults,
                    children: stay.children,
                  }}
                >
                  Select room
                </Link>
              )}
            </Button>

            <Button asChild variant="ghost" className="w-full sm:w-auto">
              <Link
                to="/hotels/$destinationSlug/$hotelSlug/$roomSlug"
                params={{
                  destinationSlug: hotel.city
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, ""),
                  hotelSlug: hotel.slug,
                  roomSlug: getRoomSlug(room),
                }}
                search={{
                  checkIn: stay.checkIn,
                  checkOut: stay.checkOut,
                  rooms: String(stay.rooms),
                  adults: String(stay.adults),
                  children: String(stay.children),
                }}
              >
                View room details
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
