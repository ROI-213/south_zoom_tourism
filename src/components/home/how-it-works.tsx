import { Car, Hotel, Search, SlidersHorizontal, CreditCard, UserCheck, Key, CheckCircle2, LucideIcon } from "lucide-react";
import { howItWorks } from "@/content/site";
import { SectionHeader } from "@/components/common/section-header";

const travelIcons: LucideIcon[] = [Search, Car, CreditCard, UserCheck];
const hotelIcons: LucideIcon[] = [Search, SlidersHorizontal, CheckCircle2, Key];

export function HowItWorks() {
  if (!howItWorks.meta.visible) return null;

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-gradient-to-b from-secondary/40 via-background to-secondary/30 py-14 sm:py-20"
    >
      {/* Background ambient light */}
      <div className="pointer-events-none absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/3 right-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4">
        <SectionHeader meta={howItWorks.meta} align="center" />

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <FlowCard
            title="Booking Travel"
            subtitle="Vehicle Rentals & Outstation Trips"
            icon={Car}
            steps={howItWorks.travel}
            icons={travelIcons}
          />
          <FlowCard
            title="Booking a Hotel"
            subtitle="Hotels, Rooms & Hill Resorts"
            icon={Hotel}
            steps={howItWorks.hotel}
            icons={hotelIcons}
          />
        </div>
      </div>
    </section>
  );
}

function FlowCard({
  title,
  subtitle,
  icon: MainIcon,
  steps,
  icons,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  steps: { id: string; title: string; description: string }[];
  icons: LucideIcon[];
}) {
  return (
    <div className="flex flex-col rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-4 sm:p-8 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md">
      {/* Flow Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 sm:pb-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="grid h-9 w-9 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-xl sm:rounded-2xl bg-primary/10 text-primary shadow-sm">
            <MainIcon className="h-4 w-4 sm:h-6 sm:w-6" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base sm:text-xl font-bold text-foreground">{title}</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <span className="rounded-full bg-secondary px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-secondary-foreground">
          4 Steps
        </span>
      </div>

      {/* Step Cards 2x2 Grid with Real-Time Animations */}
      <div className="mt-4 sm:mt-6 grid flex-1 grid-cols-2 gap-2.5 sm:gap-4">
        {steps.map((step, i) => {
          const StepIcon = icons[i] ?? Search;
          return (
            <div
              key={step.id}
              className="group relative flex flex-col justify-between rounded-xl sm:rounded-2xl border border-border/70 bg-muted/20 p-3 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:bg-card hover:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="relative grid h-6 w-6 sm:h-7 sm:w-7 place-items-center rounded-full bg-primary/15 text-[11px] sm:text-xs font-black text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_12px_rgba(212,167,44,0.6)]">
                    {i + 1}
                    <span className="absolute -inset-1 rounded-full border border-primary/30 opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
                  </span>
                  <StepIcon
                    className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-all duration-500 ease-out group-hover:scale-125 group-hover:rotate-12 group-hover:text-primary"
                    aria-hidden="true"
                  />
                </div>
                <h4 className="mt-2 sm:mt-3 text-xs sm:text-sm font-bold text-foreground transition-colors group-hover:text-primary truncate">
                  {step.title}
                </h4>
                <p className="mt-1 text-[10px] sm:text-xs leading-relaxed text-muted-foreground line-clamp-2 sm:line-clamp-none">
                  {step.description}
                </p>
              </div>

              {/* Bottom animated active accent bar */}
              <div className="mt-2 h-0.5 w-0 bg-gradient-to-r from-primary to-amber-400 transition-all duration-500 group-hover:w-full rounded-full" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
