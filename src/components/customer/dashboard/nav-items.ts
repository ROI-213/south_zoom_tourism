import { LayoutDashboard, User, CalendarRange, Car, Map, Hotel, Activity, IndianRupee, FileText, FileCheck2, XCircle, Users, LifeBuoy } from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  description: string;
  group: "Overview" | "Bookings" | "Money" | "Account";
};

export const dashboardNav: DashboardNavItem[] = [
  {
    href: "/customer/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    description: "Upcoming trips, dues and recent activity",
    group: "Overview",
  },
  {
    href: "/customer/dashboard/bookings",
    label: "All bookings",
    icon: CalendarRange,
    description: "Every request and confirmed booking",
    group: "Bookings",
  },
  {
    href: "/customer/dashboard/bookings/vehicle",
    label: "Vehicle bookings",
    icon: Car,
    description: "Taxi, outstation and airport trips",
    group: "Bookings",
  },
  {
    href: "/customer/dashboard/bookings/tour",
    label: "Tour bookings",
    icon: Map,
    description: "Package departures and itineraries",
    group: "Bookings",
  },
  {
    href: "/customer/dashboard/bookings/hotel",
    label: "Hotel bookings",
    icon: Hotel,
    description: "Room stays and vouchers",
    group: "Bookings",
  },
  {
    href: "/customer/dashboard/status",
    label: "Booking status",
    icon: Activity,
    description: "Live progress of each reference",
    group: "Bookings",
  },
  {
    href: "/customer/dashboard/payments",
    label: "Payments",
    icon: IndianRupee,
    description: "Amounts due and payment proofs",
    group: "Money",
  },
  {
    href: "/customer/dashboard/invoices",
    label: "Invoices",
    icon: FileText,
    description: "GST-ready invoice downloads",
    group: "Money",
  },
  {
    href: "/customer/dashboard/confirmations",
    label: "Confirmations",
    icon: FileCheck2,
    description: "Vouchers and confirmation letters",
    group: "Money",
  },
  {
    href: "/customer/dashboard/cancellations",
    label: "Cancellations",
    icon: XCircle,
    description: "Cancellation and reschedule requests",
    group: "Account",
  },
  {
    href: "/customer/dashboard/travellers",
    label: "Saved travellers",
    icon: Users,
    description: "Reusable traveller details",
    group: "Account",
  },
  {
    href: "/customer/dashboard/support",
    label: "Support requests",
    icon: LifeBuoy,
    description: "Questions raised with our team",
    group: "Account",
  },
  {
    href: "/customer/dashboard/profile",
    label: "Profile",
    icon: User,
    description: "Your contact details",
    group: "Account",
  },
];

export const navGroups = ["Overview", "Bookings", "Money", "Account"] as const;

export const navItemFor = (href: string) => dashboardNav.find((item) => item.href === href);
