import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarClock, Compass, Route as RouteIcon, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/common/reveal";
import { PackageGallery } from "@/components/packages/package-gallery";
import { PackageItinerary } from "@/components/packages/package-itinerary";
import { PackagePolicies } from "@/components/packages/package-policies";
import { PackageBookingPanel } from "@/components/packages/package-booking-panel";
import { PackageCard } from "@/components/packages/package-card";
import { PackageEnquiryDialog } from "@/components/packages/package-enquiry-dialog";
import {
  formatRupees,
  type PackageDetail,
  type PackageSectionKey,
} from "@/content/package-details";
import {
  formatPackagePrice,
  getPackageCategoryLabel,
  type TourPackageRecord,
} from "@/content/tour-packages";
import { company, waLink } from "@/content/site";

export function PackageDetailView({
  pkg,
  detail,
  related,
}: {
  pkg: TourPackageRecord;
  detail: PackageDetail;
  related: TourPackageRecord[];
}) {
  const hotelOptions = [...detail.hotelOptions].sort((a, b) => a.order - b.order);
  const vehicleOptions = [...detail.vehicleOptions].sort((a, b) => a.order - b.order);
  const departures = [...detail.departures].sort((a, b) => a.date.localeCompare(b.date));

  const [hotelId, setHotelId] = useState(
    hotelOptions.find((h) => h.isDefault)?.id ?? hotelOptions[0]?.id ?? "",
  );
  const [vehicleId, setVehicleId] = useState(
    vehicleOptions.find((v) => v.isDefault)?.id ?? vehicleOptions[0]?.id ?? "",
  );
  const [departureId, setDepartureId] = useState("");
  const [enquirySlug, setEnquirySlug] = useState<string | null>(null);

  const hotel = hotelOptions.find((h) => h.id === hotelId);
  const vehicle = vehicleOptions.find((v) => v.id === vehicleId);
  const departure = departures.find((d) => d.id === departureId);
  const price = formatPackagePrice(pkg);

  const panel = (idPrefix: string) => (
    <PackageBookingPanel
      pkg={pkg}
      detail={detail}
      hotel={hotel}
      vehicle={vehicle}
      departure={departure}
      onDepartureChange={setDepartureId}
      idPrefix={idPrefix}
    />
  );

  const sections: Record<PackageSectionKey, React.ReactNode> = {
    gallery: (
      <Section key="gallery" id="gallery" title="Gallery">
        <PackageGallery images={detail.gallery} title={pkg.title} />
      </Section>
    ),
    overview: (
      <Section key="overview" id="overview" title="Overview">
        <p className="text-sm leading-relaxed text-muted-foreground">{detail.overview}</p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Fact icon={<CalendarClock className="size-4" aria-hidden="true" />} label="Best time to visit" value={detail.bestTime} />
          <Fact icon={<Users className="size-4" aria-hidden="true" />} label="Suitable for" value={detail.travellerTypes.join(", ")} />
          <Fact icon={<RouteIcon className="size-4" aria-hidden="true" />} label="Total distance" value={`${detail.totalDistanceKm} km approx`} />
          <Fact
            icon={<Compass className="size-4" aria-hidden="true" />}
            label="Package category"
            value={pkg.categorySlugs.map(getPackageCategoryLabel).join(", ")}
          />
        </dl>
      </Section>
    ),
    itinerary: (
      <Section key="itinerary" id="itinerary" title="Day-wise itinerary">
        <PackageItinerary days={detail.days} />
      </Section>
    ),
    hotels: hotelOptions.length ? (
      <Section key="hotels" id="hotels" title="Hotel & room options">
        <ul className="grid gap-3">
          {hotelOptions.map((option) => (
            <li key={option.id}>
              <label
                className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                  option.id === hotelId ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="package-hotel"
                  className="mt-1 size-4 accent-[hsl(var(--primary))]"
                  checked={option.id === hotelId}
                  onChange={() => setHotelId(option.id)}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{option.hotel}</span>
                    <Badge variant="outline">{option.category}</Badge>
                    {option.upgradePrice === 0 ? <Badge variant="secondary">Included</Badge> : null}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {option.roomType} · {option.nights} night{option.nights > 1 ? "s" : ""} · {option.occupancy} ·{" "}
                    {option.mealPlan}
                  </span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {option.amenities.map((a) => (
                      <span key={a} className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                        {a}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="shrink-0 text-right text-sm font-semibold">
                  {option.upgradePrice > 0 ? `+ ${formatRupees(option.upgradePrice)}` : "—"}
                  {option.upgradePrice > 0 ? (
                    <span className="block text-xs font-normal text-muted-foreground">upgrade</span>
                  ) : null}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </Section>
    ) : null,
    vehicles: vehicleOptions.length ? (
      <Section key="vehicles" id="vehicles" title="Vehicle options">
        <ul className="grid gap-3 sm:grid-cols-2">
          {vehicleOptions.map((option) => (
            <li key={option.id}>
              <label
                className={`flex h-full cursor-pointer gap-3 rounded-xl border p-4 transition ${
                  option.id === vehicleId ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="package-vehicle"
                  className="mt-1 size-4 accent-[hsl(var(--primary))]"
                  checked={option.id === vehicleId}
                  onChange={() => setVehicleId(option.id)}
                />
                <span className="min-w-0 flex-1 text-sm">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{option.category}</span>
                    <Badge variant="outline">{option.ac ? "AC" : "Non-AC"}</Badge>
                  </span>
                  <span className="mt-1 block text-muted-foreground">Seats up to {option.seating} travellers</span>
                  <span className="mt-1 block text-muted-foreground">Pickup: {option.pickup}</span>
                  <span className="block text-muted-foreground">Drop: {option.drop}</span>
                  <span className="mt-2 block font-semibold">
                    {option.upgradePrice > 0 ? `+ ${formatRupees(option.upgradePrice)} upgrade` : "Included in the package"}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </Section>
    ) : null,
    policies: (
      <Section key="policies" id="policies" title="Inclusions, exclusions & policies">
        <PackagePolicies policies={detail.policies} />
      </Section>
    ),
    related: related.length ? (
      <Section key="related" id="related" title="Related packages">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {related.map((item) => (
            <li key={item.id} className="h-full">
              <PackageCard pkg={item} onEnquire={(p) => setEnquirySlug(p.slug)} />
            </li>
          ))}
        </ul>
      </Section>
    ) : null,
  };

  return (
    <>
      {/* Package header */}
      <section className="border-b border-border bg-card/60">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <ul className="flex flex-wrap gap-2">
              {pkg.badges.map((badge) => (
                <li key={badge}>
                  <Badge>{badge}</Badge>
                </li>
              ))}
              {pkg.categorySlugs.map((slug) => (
                <li key={slug}>
                  <Badge variant="outline">{getPackageCategoryLabel(slug)}</Badge>
                </li>
              ))}
              {pkg.soldOut ? (
                <li>
                  <Badge variant="secondary">Sold out</Badge>
                </li>
              ) : null}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              {pkg.destination}, {pkg.state} · {pkg.nights} nights / {pkg.days} days · Starts from{" "}
              {pkg.startingCity}
            </p>
            <p className="mt-2 text-sm">
              <span className="text-2xl font-bold text-primary">{price.amount}</span>{" "}
              <span className="text-xs text-muted-foreground">{price.basis}</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild>
                <a href="#booking">Enquire &amp; book</a>
              </Button>
              <Button variant="outline" asChild>
                <a
                  href={waLink(
                    `Hi, I'd like details on the ${pkg.title} package (${pkg.nights}N/${pkg.days}D from ${pkg.startingCity}).`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp us
                </a>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/tour-packages">All packages</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_360px] sm:py-12">
        <div className="min-w-0">
          {detail.sectionOrder.map((key) => sections[key])}

          {/* Mobile / tablet booking panel */}
          <section id="booking" className="mt-10 scroll-mt-24 lg:hidden">
            <h2 className="text-xl font-bold">Request this package</h2>
            <div className="mt-4">{panel("pb-m")}</div>
          </section>
        </div>

        <aside className="hidden lg:block">
          <div id="booking-desktop" className="sticky top-24">
            {panel("pb-d")}
          </div>
        </aside>
      </div>

      <PackageEnquiryDialog
        open={Boolean(enquirySlug)}
        onOpenChange={(open) => setEnquirySlug(open ? enquirySlug : null)}
        packageSlug={enquirySlug ?? ""}
        source="package-detail-related"
      />

      {/* Mobile sticky action bar */}
      <div className="sticky bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl gap-2">
          <Button variant="outline" className="flex-1" asChild>
            <a href={`tel:${company.phoneRaw}`}>Call</a>
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <a
              href={waLink(`Hi, I'd like to book the ${pkg.title} package.`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </Button>
          <Button className="flex-1" asChild>
            <a href="#booking">Book</a>
          </Button>
        </div>
      </div>
    </>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal as="section" className="mt-10 scroll-mt-24 first:mt-0">
      <div id={id}>
        <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </Reveal>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}
