import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Check, Info, ShieldCheck } from "lucide-react";
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
import type { HotelRecord, RoomRecord } from "@/content/hotels";
import type { RoomStay } from "@/content/hotel-details";
import { roomDetailBlock, type RoomQuote } from "@/content/room-details";

const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const nightLabel = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

/**
 * Rate-plan chooser with the full, itemised price breakdown for the
 * requested stay. Recalculates whenever the stay or room count changes.
 */
export function RoomRatePlans({
  hotel,
  room,
  quotes,
  stay,
  destinationSlug,
}: {
  hotel: HotelRecord;
  room: RoomRecord;
  quotes: RoomQuote[];
  stay: RoomStay;
  destinationSlug: string;
}) {
  const [planId, setPlanId] = useState(quotes[0]?.ratePlan.id ?? "");
  const [qty, setQty] = useState(String(Math.max(1, stay.rooms)));

  const quote = useMemo(
    () => quotes.find((q) => q.ratePlan.id === planId) ?? quotes[0] ?? null,
    [quotes, planId],
  );

  if (!quote) {
    return (
      <Card className="p-6" data-testid="room-no-rates">
        <h2 className="text-base font-semibold">No published rates for this room</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Our team can still quote this room manually for your dates.
        </p>
        <Button asChild className="mt-4">
          <Link to="/contact-us" search={{ hotel: hotel.name, city: hotel.city, room: room.name }}>
            Request a quote
          </Link>
        </Button>
      </Card>
    );
  }

  const maxQty = Math.max(1, quote.unitsAvailable);
  const quantity = Math.min(Math.max(1, Number(qty) || 1), maxQty);
  // Quotes are built for the requested room count; scale when the guest
  // picks a different number of rooms on this card.
  const scale = quantity / quote.rooms;
  const scaled = {
    roomSubtotal: Math.round(quote.roomSubtotal * scale),
    discountAmount: Math.round(quote.discountAmount * scale),
    extraAdultTotal: Math.round(quote.extraAdultTotal * scale),
    extraChildTotal: Math.round(quote.extraChildTotal * scale),
    serviceCharge: Math.round(quote.serviceCharge * scale),
    taxAmount: Math.round(quote.taxAmount * scale),
    total: Math.round(quote.total * scale),
  };

  const blocked = !quote.available;
  const occupancyBlocked = !quote.occupancy.ok;
  const minNightsBlocked = !quote.meetsMinNights;
  const selectable = quote.selectable;

  const bookSearch: Record<string, string> = {
    hotel: hotel.name,
    city: hotel.city,
    room: room.name,
    ratePlan: quote.mealPlanLabel,
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    rooms: String(quantity),
    adults: String(stay.adults),
    children: String(stay.children),
    estimate: String(scaled.total),
    subject: `Room booking — ${room.name}, ${hotel.name}, ${hotel.city}`,
  };

  return (
    <section aria-labelledby="rates-heading" className="scroll-mt-24 space-y-4" id="rates">
      <div>
        <h2 id="rates-heading" className="text-lg font-semibold">
          {roomDetailBlock.ratesHeading}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{roomDetailBlock.ratesSubheading}</p>
      </div>

      {blocked && (
        <Card className="border-destructive/40 bg-destructive/5 p-4" role="status">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold">{roomDetailBlock.unavailableTitle}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {roomDetailBlock.unavailableBody}
              </p>
            </div>
          </div>
        </Card>
      )}

      {occupancyBlocked && (
        <Card className="border-destructive/40 bg-destructive/5 p-4" role="status">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold">{roomDetailBlock.occupancyTitle}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {quote.occupancy.reason} {roomDetailBlock.occupancyBody}
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <RadioGroup
          value={quote.ratePlan.id}
          onValueChange={setPlanId}
          className="space-y-3"
          aria-label="Rate plans"
        >
          {quotes.map((option) => {
            const id = `rate-${option.ratePlan.id}`;
            return (
              <div
                key={option.ratePlan.id}
                data-testid="rate-plan-option"
                data-plan={option.ratePlan.id}
                className="flex min-w-0 flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <RadioGroupItem value={option.ratePlan.id} id={id} className="mt-1" />
                  <Label htmlFor={id} className="min-w-0 cursor-pointer">
                    <span className="block text-sm font-medium">{option.mealPlanLabel}</span>
                    <span className="mt-1 flex flex-wrap gap-1.5">
                      <Badge variant={option.refundable ? "secondary" : "outline"}>
                        {option.refundable ? "Refundable" : "Non-refundable"}
                      </Badge>
                      {option.discountPercent > 0 && (
                        <Badge variant="secondary">{option.discountPercent}% off</Badge>
                      )}
                      {option.minNights > 1 && (
                        <Badge variant="outline">Min {option.minNights} nights</Badge>
                      )}
                      {!option.available && <Badge variant="outline">Sold out</Badge>}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground break-words">
                      {option.cancellationTerms}
                    </span>
                  </Label>
                </div>
                <div className="shrink-0 text-right">
                  <span className="block text-base font-semibold">{inr(option.total)}</span>
                  <span className="block text-xs text-muted-foreground">
                    total for {option.nightCount} night{option.nightCount === 1 ? "" : "s"}, incl.
                    taxes
                  </span>
                </div>
              </div>
            );
          })}
        </RadioGroup>
      </Card>

      <Card className="p-4" data-testid="price-breakdown">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">{roomDetailBlock.breakdownHeading}</h3>
          <div className="flex items-center gap-2">
            <Label htmlFor="room-qty" className="text-xs text-muted-foreground">
              Rooms
            </Label>
            <Select value={String(quantity)} onValueChange={setQty}>
              <SelectTrigger id="room-qty" className="h-9 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxQty }, (_, i) => String(i + 1)).map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[320px] text-sm">
            <caption className="sr-only">Night-wise rates for {room.name}</caption>
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="pb-2">
                  Night
                </th>
                <th scope="col" className="pb-2 text-right">
                  Rate / room
                </th>
                <th scope="col" className="pb-2 text-right">
                  Left
                </th>
              </tr>
            </thead>
            <tbody>
              {quote.nights.map((night) => (
                <tr key={night.date} className="border-t">
                  <td className="py-2">
                    {nightLabel(night.date)}
                    {night.peak && (
                      <Badge variant="outline" className="ml-2">
                        Peak
                      </Badge>
                    )}
                  </td>
                  <td className="py-2 text-right tabular-nums">{inr(night.planRate)}</td>
                  <td className="py-2 text-right tabular-nums text-muted-foreground">
                    {night.unitsLeft}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
          <Row
            label={`Room charges (${quote.nightCount} night${quote.nightCount === 1 ? "" : "s"} × ${quantity} room${quantity === 1 ? "" : "s"})`}
            value={inr(scaled.roomSubtotal)}
          />
          {scaled.discountAmount > 0 && (
            <Row
              label={`Rate plan discount (${quote.discountPercent}%)`}
              value={`− ${inr(scaled.discountAmount)}`}
            />
          )}
          {scaled.extraAdultTotal > 0 && (
            <Row
              label={`Extra adult charges (${quote.occupancy.extraAdults} guest above base occupancy)`}
              value={inr(scaled.extraAdultTotal)}
            />
          )}
          {scaled.extraChildTotal > 0 && (
            <Row
              label={`Child charges (${quote.occupancy.extraChildren})`}
              value={inr(scaled.extraChildTotal)}
            />
          )}
          {scaled.serviceCharge > 0 && (
            <Row label="Service charge" value={inr(scaled.serviceCharge)} />
          )}
          <Row label={`Taxes (${quote.taxPercent}%)`} value={inr(scaled.taxAmount)} />
          <div className="flex items-center justify-between border-t pt-3 text-base font-semibold">
            <dt>Total payable</dt>
            <dd data-testid="room-total">{inr(scaled.total)}</dd>
          </div>
        </dl>

        <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          {quote.refundable ? (
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          ) : (
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          )}
          <p className="min-w-0 break-words">{quote.cancellationTerms}</p>
        </div>

        {minNightsBlocked && (
          <p className="mt-3 text-sm text-destructive">
            This rate needs a minimum stay of {quote.minNights} nights. Extend your dates to book
            it.
          </p>
        )}

        <Button asChild={selectable} className="mt-4 w-full" disabled={!selectable}>
          {selectable ? (
            <Link to="/contact-us" search={bookSearch} data-testid="select-rate">
              Select rate · {inr(scaled.total)}
            </Link>
          ) : (
            <span>Not available for these dates</span>
          )}
        </Button>

        {!selectable && (
          <Button asChild variant="outline" className="mt-2 w-full">
            <Link
              to="/hotels/$destinationSlug/$hotelSlug"
              params={{ destinationSlug, hotelSlug: hotel.slug }}
              search={{
                checkIn: stay.checkIn,
                checkOut: stay.checkOut,
                rooms: String(stay.rooms),
                adults: String(stay.adults),
                children: String(stay.children),
              }}
            >
              See other rooms in this hotel
            </Link>
          </Button>
        )}

        {selectable && quote.unitsAvailable <= 3 && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Check className="size-3.5 text-primary" aria-hidden />
            Only {quote.unitsAvailable} room{quote.unitsAvailable === 1 ? "" : "s"} left for these
            dates
          </p>
        )}
      </Card>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="min-w-0 break-words text-muted-foreground">{label}</dt>
      <dd className="shrink-0 tabular-nums">{value}</dd>
    </div>
  );
}
