import { CloudSun, Lightbulb } from "lucide-react";
import type { DestinationWeatherRow } from "@/content/destination-details";

export function DestinationWeather({
  destinationName,
  bestTime,
  rows,
}: {
  destinationName: string;
  bestTime: string;
  rows: DestinationWeatherRow[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <CloudSun className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <h3 className="text-base font-bold">Best time & weather</h3>
      </div>
      <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
        Best time to visit {destinationName}:{" "}
        <span className="font-semibold text-foreground">{bestTime}</span>
      </p>

      {rows.length > 0 ? (
        <>
          {/* Mobile View: Clean Seasonal Weather Cards */}
          <div className="mt-4 space-y-2.5 sm:hidden">
            {rows.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-border/70 bg-muted/20 p-3 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-foreground text-sm">{r.season}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                    {r.temperature}
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-medium text-muted-foreground">{r.months}</p>
                <p className="mt-2 border-t border-border/50 pt-1.5 text-xs leading-relaxed text-foreground/90">
                  {r.note}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop/Tablet View: Table */}
          <div className="mt-4 hidden sm:block overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Seasonal weather in {destinationName}</caption>
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="py-2 pr-3 font-semibold">Season</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Months</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Temp</th>
                  <th scope="col" className="py-2 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0 align-top">
                    <th scope="row" className="py-2.5 pr-3 font-semibold text-foreground whitespace-nowrap">{r.season}</th>
                    <td className="py-2.5 pr-3 text-muted-foreground whitespace-nowrap">{r.months}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground whitespace-nowrap">{r.temperature}</td>
                    <td className="py-2.5 text-muted-foreground leading-relaxed">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          Detailed season-by-season weather for this destination is coming soon.
        </p>
      )}
    </div>
  );
}

export function DestinationTips({
  destinationName,
  tips,
}: {
  destinationName: string;
  tips: string[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <h3 className="text-base font-bold">Travel tips</h3>
      </div>
      {tips.length > 0 ? (
        <ul className="mt-3 space-y-2.5 text-xs sm:text-sm text-muted-foreground">
          {tips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span className="flex-1 break-words leading-relaxed text-foreground/90">{tip}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          Ask us anything about {destinationName} — our drivers run this route every week and will
          share the practical details before you go.
        </p>
      )}
    </div>
  );
}

export function DestinationMap({ embedUrl, label }: { embedUrl?: string; label?: string }) {
  if (!embedUrl) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <iframe
        src={embedUrl}
        title={label ?? "Destination map"}
        loading="lazy"
        className="block h-[300px] w-full border-0 sm:h-[360px]"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
