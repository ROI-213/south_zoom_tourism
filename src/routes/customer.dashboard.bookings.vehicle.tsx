import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, dashboardHead } from "@/components/customer/dashboard/dashboard-shell";
import { BookingListView } from "@/components/customer/dashboard/booking-list-view";

const HREF = "/customer/dashboard/bookings/vehicle";
const TITLE = "Vehicle Bookings — South Zoom Tourism";
const DESCRIPTION = "Airport transfers, local rentals and outstation trips booked with South Zoom Tourism.";

export const Route = createFileRoute("/customer/dashboard/bookings/vehicle")({
  head: () => dashboardHead(HREF, TITLE, DESCRIPTION),
  component: VehicleBookingsPage,
});

function VehicleBookingsPage() {
  return (
    <DashboardShell
      href={HREF}
      title="Vehicle bookings"
      description="Cab, airport and outstation requests with vehicle, pickup and payment details."
    >
      {(profile) => <BookingListView profile={profile} kind="vehicle" />}
    </DashboardShell>
  );
}
