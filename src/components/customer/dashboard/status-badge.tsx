import { bookingStatusMeta, type BookingLifecycleStatus } from "@/content/booking-summary";

const toneClass: Record<string, string> = {
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  red: "border-destructive/30 bg-destructive/10 text-destructive",
  muted: "border-border bg-secondary text-muted-foreground",
};

export function ToneBadge({ label, tone }: { label: string; tone: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
        toneClass[tone] ?? toneClass.muted
      }`}
    >
      {label}
    </span>
  );
}

export function BookingStatusBadge({ status }: { status: string }) {
  const meta = bookingStatusMeta[status as BookingLifecycleStatus];
  return <ToneBadge label={meta?.label ?? "Awaiting review"} tone={meta?.tone ?? "amber"} />;
}
