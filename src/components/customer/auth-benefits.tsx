import { CalendarCheck, FileText, LifeBuoy, RotateCcw, Users } from "lucide-react";
import { accountBenefits } from "@/content/customer-auth";

const icons = {
  history: CalendarCheck,
  invoices: FileText,
  travellers: Users,
  cancellations: RotateCcw,
  support: LifeBuoy,
} as const;

export function AuthBenefits() {
  return (
    <section aria-labelledby="benefits-heading" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 id="benefits-heading" className="text-lg font-bold tracking-tight sm:text-xl">
        Why create an account?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        An account is completely optional — you can still book and track everything as a guest.
      </p>
      <ul className="mt-4 space-y-4">
        {accountBenefits.map((benefit) => {
          const Icon = icons[benefit.key];
          return (
            <li key={benefit.key} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{benefit.title}</h3>
                <p className="mt-1 text-pretty text-sm text-muted-foreground">{benefit.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
