import { CalendarDays, MapPin, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/common/app-link";
import { waLink } from "@/content/site";

import destBengaluru from "@/assets/destinations/dest-bengaluru-new.jpg";
import destChikkamagaluru from "@/assets/destinations/dest-chikkamagaluru-new.png";
import destCoorg from "@/assets/destinations/dest-coorg.jpg";
import destMysuru from "@/assets/destinations/dest-mysuru-new.jpg";
import destHampi from "@/assets/destinations/dest_hampi_1786683714278.jpg";
import destGokarna from "@/assets/destinations/dest_gokarna_1786683734925.jpg";
import destJogFalls from "@/assets/destinations/dest_jog_falls_1786683754955.jpg";
import destUdupi from "@/assets/destinations/dest_udupi_1786683820441.jpg";
import destBadami from "@/assets/destinations/dest_badami_1786683832864.jpg";

const basePlaces = [
  { 
    title: "Bengaluru City Escape", destination: "Bengaluru", category: "City Tour", nights: 2, days: 3, 
    image: destBengaluru, priceFrom: 4999, 
    highlights: ["Vidhana Soudha view", "Lalbagh Botanical Garden", "Cubbon Park stroll"] 
  },
  { 
    title: "Mysuru Royal Heritage", destination: "Mysuru", category: "Heritage", nights: 1, days: 2, 
    image: destMysuru, priceFrom: 3499, 
    highlights: ["Mysore Palace tour", "Chamundi Hills darshan", "Brindavan Gardens"] 
  },
  { 
    title: "Coorg Nature Retreat", destination: "Coorg", category: "Hill Station", nights: 2, days: 3, 
    image: destCoorg, priceFrom: 5999, 
    highlights: ["Coffee Plantations", "Abbey Falls visit", "Raja's Seat sunset"] 
  },
  { 
    title: "Hampi Ruins Exploration", destination: "Hampi", category: "Heritage", nights: 2, days: 3, 
    image: destHampi, priceFrom: 4599, 
    highlights: ["Virupaksha Temple", "Stone Chariot", "Tungabhadra River sunset"] 
  },
  { 
    title: "Gokarna Beach Trek", destination: "Gokarna", category: "Beach", nights: 2, days: 3, 
    image: destGokarna, priceFrom: 4999, 
    highlights: ["Om & Kudle Beach", "Mahabaleshwar Temple", "Cliffside hiking"] 
  },
  { 
    title: "Chikkamagaluru Getaway", destination: "Chikkamagaluru", category: "Hill Station", nights: 2, days: 3, 
    image: destChikkamagaluru, priceFrom: 5499, 
    highlights: ["Mullayanagiri Peak", "Baba Budangiri", "Coffee Estates"] 
  },
  { 
    title: "Majestic Jog Falls", destination: "Jog Falls", category: "Nature", nights: 1, days: 2, 
    image: destJogFalls, priceFrom: 3999, 
    highlights: ["Jog Falls viewpoints", "Sharavati River", "Linganamakki Dam"] 
  },
  { 
    title: "Udupi Temple & Beach", destination: "Udupi", category: "Pilgrimage", nights: 1, days: 2, 
    image: destUdupi, priceFrom: 3999, 
    highlights: ["Sri Krishna Temple", "Malpe Beach walk", "St. Mary's Island"] 
  },
  { 
    title: "Badami Cave Architecture", destination: "Badami", category: "Heritage", nights: 2, days: 3, 
    image: destBadami, priceFrom: 4299, 
    highlights: ["Cave Temples", "Agastya Lake", "Bhutanatha Group"] 
  },
  { 
    title: "Sakleshpur Green Route", destination: "Sakleshpur", category: "Hill Station", nights: 1, days: 2, 
    image: destChikkamagaluru, priceFrom: 3499, 
    highlights: ["Manjarabad Fort", "Bisle Ghat viewpoints", "Hemavathi Backwaters"] 
  },
];

// Double the array to allow for a seamless infinite scroll
const marqueePlaces = [...basePlaces, ...basePlaces];

export function KarnatakaSlider() {
  return (
    <section className="py-16 bg-slate-50 overflow-hidden border-y border-border/40">
      <div className="container px-4 md:px-6 mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Explore South India</h2>
        <p className="text-slate-600 mt-2">Top destinations across Karnataka, Tamilnadu, Kerala, Andhrapradesh, Goa &amp; Puducherry.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["Karnataka", "Tamilnadu", "Kerala", "Andhrapradesh", "Goa", "Puducherry"].map((state) => (
            <span key={state} className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
              {state}
            </span>
          ))}
        </div>
      </div>
      
      <div className="relative w-full overflow-hidden">
        <div className="flex gap-6 w-max animate-slider hover:animate-pause px-4">
          {marqueePlaces.map((p, i) => (
            <div 
              key={i} 
              className="group relative flex w-[320px] shrink-0 flex-col overflow-hidden rounded-2xl bg-card shadow-[0_2px_12px_rgb(0,0,0,0.06)] ring-1 ring-border/50 transition-all hover:shadow-[0_8px_24px_rgb(0,0,0,0.12)] hover:ring-primary/50"
            >
              {/* Image Header */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/30">
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                
                {/* Category Pill */}
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary/95 px-3 py-1 text-[11px] font-extrabold text-primary-foreground shadow-md backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" /> {p.category}
                </span>

                {/* Duration badge */}
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                  <CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  {p.nights}N / {p.days}D
                </span>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col p-5 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-foreground transition-colors group-hover:text-primary">
                      {p.title}
                    </h3>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> {p.destination}
                    </p>
                  </div>
                </div>

                {/* Highlights list */}
                <ul className="mt-4 space-y-1.5 border-t border-b border-border/60 py-3 text-xs text-muted-foreground">
                  {p.highlights.map((h, hIdx) => (
                    <li key={hIdx} className="inline-flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary" /> {h}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-muted-foreground">Starting from</span>
                    <p className="text-base font-extrabold text-primary">
                      ₹{p.priceFrom.toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-muted-foreground"> / person</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 pt-1">
                  <Button asChild size="sm" className="flex-1 font-semibold">
                    <AppLink href="/contact-us">Book</AppLink>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="flex-1 font-semibold">
                    <a
                      href={waLink(
                        `Hi South Zoom Tourism, I'm interested in the "${p.title}" package (${p.nights}N/${p.days}D, ${p.destination}).`
                      )}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Enquire
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .animate-slider {
          animation: slide 70s linear infinite;
        }
        .animate-pause {
          animation-play-state: paused;
        }
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
