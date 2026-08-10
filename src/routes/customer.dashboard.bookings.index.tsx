import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, dashboardHead } from "@/components/customer/dashboard/dashboard-shell";
import { BookingListView } from "@/components/customer/dashboard/booking-list-view";

const HREF = "/customer/dashboard/bookings";
const TITLE = "All Bookings — South Zoom Tourism";
const DESCRIPTION = "Every vehicle trip, tour package and hotel stay linked to your account.";

export const Route = createFileRoute("/customer/dashboard/bookings/")({
  head: () => dashboardHead(HREF, TITLE, DESCRIPTION),
  component: AllBookingsPage,
});

function AllBookingsPage() {
  return (
    <DashboardShell
      href={HREF}
      title="All bookings"
      description="Vehicle trips, tour departures and hotel stays with their documents and payment status."
    >
      {(profile) => <BookingListView profile={profile} />}
    </DashboardShell>
  );
}
