import {
  AirVent,
  BedDouble,
  Building2,
  Check,
  Cigarette,
  CigaretteOff,
  Eye,
  Maximize2,
  Plus,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RoomRecord } from "@/content/hotels";
import type { RoomDetailAttributes } from "@/content/hotel-details";
import type { RoomProfile } from "@/content/room-details";

type Fact = { icon: typeof BedDouble; label: string; value: string };

/** Room facts grid + amenity list. */
export function RoomSpecPanel({
  room,
  profile,
  attributes,
}: {
  room: RoomRecord;
  profile: RoomProfile | undefined;
  attributes: RoomDetailAttributes | undefined;
}) {
  const facts: Fact[] = [
    { icon: BedDouble, label: "Bed type", value: room.bedType },
    {
      icon: Plus,
      label: "Beds",
      value: `${profile?.bedCount ?? 1} bed${(profile?.bedCount ?? 1) === 1 ? "" : "s"}`,
    },
    { icon: Maximize2, label: "Room size", value: `${room.sizeSqft} sq ft` },
    {
      icon: Users,
      label: "Max occupancy",
      value: `${room.maxAdults} adult${room.maxAdults === 1 ? "" : "s"}${
        room.maxChildren > 0 ? ` + ${room.maxChildren} child` : ""
      }`,
    },
    { icon: Eye, label: "View", value: profile?.viewType ?? "—" },
    { icon: Building2, label: "Floor", value: profile?.floor ?? "—" },
    {
      icon: AirVent,
      label: "Air conditioning",
      value: profile?.airConditioned ? "Air-conditioned" : "Non-AC",
    },
    {
      icon: profile?.smokingAllowed ? Cigarette : CigaretteOff,
      label: "Smoking",
      value: profile?.smokingAllowed ? "Smoking allowed" : "Non-smoking",
    },
    {
      icon: Plus,
      label: "Extra bed",
      value: profile?.extraBedAvailable
        ? `Available${profile.extraAdultCharge ? ` · ₹${profile.extraAdultCharge}/night` : ""}`
        : "Not available",
    },
  ];

  return (
    <section aria-labelledby="room-facts-heading" className="space-y-4">
      <h2 id="room-facts-heading" className="text-lg font-semibold">
        Room details
      </h2>

      {profile?.description && (
        <p className="text-sm leading-relaxed text-muted-foreground">{profile.description}</p>
      )}

      {attributes?.highlights?.length ? (
        <ul className="flex flex-wrap gap-2">
          {attributes.highlights.map((h) => (
            <li key={h}>
              <Badge variant="secondary">{h}</Badge>
            </li>
          ))}
        </ul>
      ) : null}

      <Card className="p-4">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label} className="flex min-w-0 items-start gap-3">
              <fact.icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  {fact.label}
                </dt>
                <dd className="text-sm font-medium break-words">{fact.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </Card>

      {room.amenities.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold">In-room amenities</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {room.amenities.map((amenity) => (
              <li key={amenity} className="flex min-w-0 items-center gap-2 text-sm">
                <Check className="size-4 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0 break-words">{amenity}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {attributes?.extraBedNote && (
        <p className="text-xs text-muted-foreground">Extra bed: {attributes.extraBedNote}</p>
      )}
    </section>
  );
}
