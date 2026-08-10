import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, dashboardHead } from "@/components/customer/dashboard/dashboard-shell";
import { BookingListView } from "@/components/customer/dashboard/booking-list-view";

const HREF = "/customer/dashboard/bookings/hotel";
const TITLE = "Hotel Bookings — South Zoom Tourism";
const DESCRIPTION = "Your room stays with check-in dates, meal plans, vouchers and payment status.";

export const Route = createFileRoute("/customer/dashboard/bookings/hotel")({
  head: () => dashboardHead(HREF, TITLE, DESCRIPTION),
  component: HotelBookingsPage,
});

function HotelBookingsPage() {
  return (
    <DashboardShell
      href={HREF}
      title="Hotel bookings"
      description="Room stays with check-in and check-out dates, meal plans and vouchers."
    >
      {(profile) => <BookingListView profile={profile} kind="hotel" />}
    </DashboardShell>
  );
}
