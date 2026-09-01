import * as Icons from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { servicesSection } from "@/content/site";
import { SectionHeader, ViewAllMobile } from "@/components/common/section-header";
import { AppLink } from "@/components/common/app-link";

import serviceLocalTaxi from "@/assets/service-local-taxi.png";
import serviceOutstation from "@/assets/service-outstation.png";
import serviceAirport from "@/assets/service-airport.png";
import serviceCorporateNew from "@/assets/service-corporate-new.png";
import serviceGroup from "@/assets/service-group.png";
import servicePilgrimageNew from "@/assets/service-pilgrimage-new.png";
import serviceWeddingNew from "@/assets/service-wedding-new.png";
import heroHotels from "@/assets/hero-hotels.jpg";
import heroFleet from "@/assets/hero-fleet.jpg";
import pkgOoty from "@/assets/pkg-ooty.png";
import tourCoorg from "@/assets/tour-coorg.png";

type IconName = keyof typeof Icons;

const serviceImages: Record<string, { image: string; tag?: string }> = {
  "local-taxi": { image: serviceLocalTaxi, tag: "4hr/40km ₹1,200 | 8hr/80km ₹2,300" },
  "outstation": { image: serviceOutstation, tag: "From ₹14 / km" },
  "airport": { image: serviceAirport, tag: "From ₹899" },
  "corporate": { image: serviceCorporateNew, tag: "GST Invoices" },
  "group": { image: serviceGroup, tag: "12 to 50 Seats" },
  "packages": { image: pkgOoty, tag: "Curated Stays" },
  "hotels": { image: heroHotels, tag: "From ₹1,800 / night" },
  "pilgrimage": { image: servicePilgrimageNew, tag: "Temple Circuits" },
  "wedding": { image: serviceWeddingNew, tag: "Event Fleets" },
  "custom": { image: tourCoorg, tag: "Tailored Quote" },
};

export function ServicesSection() {
  if (!servicesSection.meta.visible) return null;

  return (
    <section
      id="services"
      className="relative overflow-hidden bg-gradient-to-b from-secondary/50 via-background to-secondary/30 py-14 sm:py-20"
    >
      {/* Decorative ambient lighting elements */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4">
        <SectionHeader meta={servicesSection.meta} />

        <ul className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-5">
          {servicesSection.items.map((item) => {
            const Icon = (Icons[item.icon as IconName] ?? Icons.Circle) as Icons.LucideIcon;
            const visual = serviceImages[item.id] ?? { image: heroFleet };

            return (
              <li key={item.id} className="group">
                <AppLink
                  href="/services"
                  className="flex h-full flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10"
                >
                  {/* Image header with live zoom animation and badges */}
                  <div className="relative h-28 w-full overflow-hidden bg-muted/40 sm:h-40">
                    <img
                      src={visual.image}
                      alt={item.title}
                      width={600}
                      height={400}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Floating Icon badge */}
                    <span className="absolute left-2 top-2 sm:left-3 sm:top-3 grid h-7 w-7 sm:h-9 sm:w-9 place-items-center rounded-lg sm:rounded-xl bg-background/90 text-primary shadow-md backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                    </span>

                    {/* Tag badge */}
                    {visual.tag ? (
                      <span className="absolute right-2 top-2 sm:right-3 sm:top-3 rounded-full bg-primary/95 px-1.5 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-primary-foreground shadow-sm backdrop-blur-sm">
                        {visual.tag}
                      </span>
                    ) : null}

                    {/* Title overlay on bottom of image */}
                    <h3 className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 text-xs sm:text-sm font-bold text-white drop-shadow-sm flex items-center justify-between">
                      <span className="truncate">{item.title}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-white/80 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </h3>
                  </div>

                  {/* Card body content */}
                  <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-4">
                    <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 sm:line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-2 sm:mt-4 flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-primary transition-all group-hover:translate-x-1">
                      <span>Explore</span>
                      <Icons.ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </AppLink>
              </li>
            );
          })}
        </ul>

        <ViewAllMobile meta={servicesSection.meta} />
      </div>
    </section>
  );
}
