import { createFileRoute } from "@tanstack/react-router";
import { Star, Quote, MapPin, Car, Calendar, MessageCircle, Phone } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { testimonialsSection, company, waLink } from "@/content/site";

const TITLE = "Customer Testimonials — South Zoom Tourism";
const DESCRIPTION =
  "Read real reviews from South Zoom Tourism customers across Bengaluru, Chennai, Mysuru, Coimbatore and Madurai. Transparent fares, verified drivers, happy travellers.";

export const Route = createFileRoute("/testimonials")({
  component: TestimonialsPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/testimonials" },
    ],
    links: [{ rel: "canonical", href: "/testimonials" }],
  }),
});

/* Unique gradient colors for avatar backgrounds */
const avatarGradients = [
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-indigo-600",
  "from-rose-500 to-pink-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-sky-600",
  "from-lime-500 to-green-600",
  "from-fuchsia-500 to-pink-600",
  "from-yellow-500 to-amber-600",
  "from-teal-500 to-emerald-600",
];

/* Trip type badge color mapping */
function tripBadgeClass(tripType?: string) {
  switch (tripType) {
    case "Outstation Round Trip":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    case "Local City Rental":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    case "Airport Transfer":
      return "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20";
    case "Tour Package":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
    case "Corporate Travel":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    case "Pilgrimage Tour":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
    case "Outstation One-Way":
      return "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20";
    case "Group Travel":
      return "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function TestimonialsPage() {
  const items = testimonialsSection.items;

  /* Stats summary */
  const totalReviews = items.length;
  const avgRating = (items.reduce((sum, t) => sum + t.rating, 0) / totalReviews).toFixed(1);
  const fiveStarCount = items.filter((t) => t.rating === 5).length;

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        {/* ──────────── Hero Banner ──────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 py-14 sm:py-20">
          {/* Ambient blurs */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute right-0 bottom-0 h-60 w-60 rounded-full bg-primary/8 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4">
            <Badge variant="outline" className="mb-3 border-primary/30 text-primary bg-primary/5">
              ⭐ Verified Reviews
            </Badge>
            <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              What Our Travellers Say
            </h1>
            <p className="mt-3 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
              Real stories from real customers across Bengaluru, Chennai, Mysuru, Coimbatore and
              Madurai. Every review is from a verified trip.
            </p>

            {/* Stats Strip */}
            <div className="mt-8 flex flex-wrap gap-6 sm:gap-10">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Star className="h-6 w-6 fill-primary" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-foreground">{avgRating}</p>
                  <p className="text-xs text-muted-foreground">Avg. Rating</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-foreground">{totalReviews}+</p>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
                  <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-foreground">{fiveStarCount}</p>
                  <p className="text-xs text-muted-foreground">5-Star Reviews</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────── Testimonial Cards Grid ──────────── */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t, idx) => {
              const initials = t.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("");
              const gradient = avatarGradients[idx % avatarGradients.length];
              const tripType = (t as Record<string, unknown>).tripType as string | undefined;
              const address = (t as Record<string, unknown>).address as string | undefined;
              const date = (t as Record<string, unknown>).date as string | undefined;

              return (
                <figure
                  key={t.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
                >
                  {/* Subtle corner accent */}
                  <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-[60px] bg-gradient-to-bl from-primary/5 to-transparent transition-opacity group-hover:opacity-100 opacity-0" />

                  <div>
                    {/* Top Row: Badge + Stars */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {tripType && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${tripBadgeClass(tripType)}`}
                          >
                            <Car className="h-3 w-3" />
                            {tripType}
                          </span>
                        )}
                      </div>
                      <Quote className="h-6 w-6 shrink-0 text-primary/20 transition-colors group-hover:text-primary/50" />
                    </div>

                    {/* Stars */}
                    <div className="mt-3 flex items-center gap-1" aria-label={`${t.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                            i < t.rating
                              ? "fill-primary text-primary"
                              : "fill-muted text-muted-foreground/30"
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                      {date && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {date}
                        </span>
                      )}
                    </div>

                    {/* Review Text */}
                    <blockquote className="mt-4 text-sm leading-relaxed text-foreground/80">
                      &ldquo;{t.text}&rdquo;
                    </blockquote>
                  </div>

                  {/* Author Footer */}
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
                    <div
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${gradient} text-sm font-extrabold text-white shadow-md`}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                        {t.name}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {address ? `${address}, ${t.city}` : t.city}
                      </p>
                    </div>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>

        {/* ──────────── Bottom CTA ──────────── */}
        <section className="mx-auto max-w-7xl px-4 pb-16">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-card to-primary/5 p-8 sm:p-12 text-center">
            <h2 className="text-xl font-extrabold sm:text-2xl">
              Had a great trip with South Zoom?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
              We'd love to hear about your experience! Share your feedback with us on WhatsApp or
              give us a call.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="gap-2 font-bold">
                <a
                  href={waLink(
                    "Hi South Zoom Tourism, I had a recent trip with you and would like to share my feedback.",
                  )}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <MessageCircle className="h-4 w-4" />
                  Share on WhatsApp
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2 font-bold border-primary text-primary hover:bg-primary hover:text-white">
                <a href={`tel:${company.phoneRaw}`}>
                  <Phone className="h-4 w-4" />
                  Call Us
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
