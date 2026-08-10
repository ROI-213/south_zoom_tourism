import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, dashboardHead } from "@/components/customer/dashboard/dashboard-shell";
import { BookingListView } from "@/components/customer/dashboard/booking-list-view";

const HREF = "/customer/dashboard/bookings/tour";
const TITLE = "Tour Bookings — South Zoom Tourism";
const DESCRIPTION = "Your tour package departures with itinerary, hotel and vehicle options.";

export const Route = createFileRoute("/customer/dashboard/bookings/tour")({
  head: () => dashboardHead(HREF, TITLE, DESCRIPTION),
  component: TourBookingsPage,
});

function TourBookingsPage() {
  return (
    <DashboardShell
      href={HREF}
      title="Tour bookings"
      description="Package departures with itinerary, inclusions and payment schedule."
    >
      {(profile) => <BookingListView profile={profile} kind="tour-package" />}
    </DashboardShell>
  );
}
