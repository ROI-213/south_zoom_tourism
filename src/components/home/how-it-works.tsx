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
    <div className="flex flex-col rounded-3xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md sm:p-8">
      {/* Flow Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary shadow-sm">
            <MainIcon className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
          4 Simple Steps
        </span>
      </div>

      {/* Step Cards Grid */}
      <div className="mt-6 grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
        {steps.map((step, i) => {
          const StepIcon = icons[i] ?? Search;
          return (
            <div
              key={step.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-muted/20 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:bg-card hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-xs font-extrabold text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    {i + 1}
                  </span>
                  <StepIcon
                    className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:scale-110 group-hover:text-primary"
                    aria-hidden="true"
                  />
                </div>
                <h4 className="mt-3 text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                  {step.title}
                </h4>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
