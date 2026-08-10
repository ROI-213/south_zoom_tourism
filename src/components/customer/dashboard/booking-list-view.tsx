import { useState } from "react";
import { CalendarRange } from "lucide-react";
import type { CustomerProfile } from "@/content/customer-auth";
import {
  bookingKindMeta,
  listCustomerBookings,
  type CustomerBooking,
  type CustomerBookingKind,
} from "@/content/customer-data";
import { useClientData } from "@/hooks/use-client-data";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingCard } from "./booking-card";
import { EmptyState } from "./empty-state";
import { CancellationDialog } from "./cancellation-dialog";
import { SupportDialog } from "./support-dialog";
import { LinkBookingDialog } from "./link-booking-dialog";

const emptyCopy: Record<CustomerBookingKind | "all", { title: string; body: string; href: string; label: string }> = {
  all: {
    title: "No bookings yet",
    body: "Once you request a cab, a tour package or a hotel stay, it appears here with its documents and payment status.",
    href: "/services",
    label: "Explore services",
  },
  vehicle: {
    title: "No vehicle trips yet",
    body: "Airport transfers, local rentals and outstation trips you book will be listed here.",
    href: "/fleet",
    label: "Browse fleet",
  },
  "tour-package": {
    title: "No tour bookings yet",
    body: "Package departures you book — with itinerary, hotels and vehicle — will appear here.",
    href: "/tour-packages",
    label: "Browse packages",
  },
  hotel: {
    title: "No hotel stays yet",
    body: "Room bookings with check-in dates, meal plans and vouchers will be listed here.",
    href: "/hotels",
    label: "Search hotels",
  },
};

export function BookingListView({
  profile,
  kind,
}: {
  profile: CustomerProfile;
  kind?: CustomerBookingKind;
}) {
  const { data, loading, reload } = useClientData(() => listCustomerBookings(profile), [profile.id]);
  const [cancelTarget, setCancelTarget] = useState<CustomerBooking | null>(null);
  const [supportTarget, setSupportTarget] = useState<CustomerBooking | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);

  const all = data ?? [];
  const bookings = kind ? all.filter((booking) => booking.kind === kind) : all;
  const copy = emptyCopy[kind ?? "all"];

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {bookings.length} {kind ? bookingKindMeta[kind].plural.toLowerCase() : "bookings"} on your account
        </p>
        <LinkBookingDialog profile={profile} onLinked={reload} />
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title={copy.title}
          body={copy.body}
          primary={{ href: copy.href, label: copy.label }}
          secondary={{ href: "/booking-status", label: "Track a guest booking" }}
        />
      ) : (
        bookings.map((booking) => (
          <BookingCard
            key={booking.reference}
            booking={booking}
            onCancel={setCancelTarget}
            onSupport={(item) => {
              setSupportTarget(item);
              setSupportOpen(true);
            }}
          />
        ))
      )}

      <CancellationDialog
        profile={profile}
        booking={cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        onCreated={reload}
      />
      <SupportDialog
        profile={profile}
        open={supportOpen}
        booking={supportTarget}
        bookings={all}
        onOpenChange={(open) => {
          setSupportOpen(open);
          if (!open) setSupportTarget(null);
        }}
        onCreated={reload}
      />
    </div>
  );
}
