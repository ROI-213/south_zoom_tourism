const LABELS: Record<string, string> = {
  pickupCity: "Pickup city",
  dropCity: "Drop city",
  tripType: "Trip type",
  pickupDate: "Pickup date",
  pickupTime: "Pickup time",
  passengers: "Passengers",
  vehicleType: "Vehicle type",
  destination: "Destination",
  category: "Category",
  travelDate: "Travel date",
  duration: "Duration",
  travellers: "Travellers",
  city: "City",
  checkIn: "Check-in",
  checkOut: "Check-out",
  rooms: "Rooms",
  guests: "Guests",
};

/** Shows the criteria carried over from the home-page search card. */
export function SearchSummary({ search }: { search: Record<string, string> }) {
  const entries = Object.entries(search).filter(([, v]) => v);

  if (entries.length === 0) {
    return (
      <p className="mt-10 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No search criteria yet — use the search on the home page to filter results.
      </p>
    );
  }

  return (
    <div className="mt-8 rounded-xl border border-border bg-card p-5">
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        Your search
      </h2>
      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {entries.map(([key, value]) => (
          <div key={key} className="min-w-0">
            <dt className="text-xs text-muted-foreground">{LABELS[key] ?? key}</dt>
            <dd className="truncate text-sm font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 text-sm text-muted-foreground">
        Live results appear here once this section is connected to the booking database.
      </p>
    </div>
  );
}
