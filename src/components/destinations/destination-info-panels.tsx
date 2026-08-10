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
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <CloudSun className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <h3 className="text-base font-bold">Best time & weather</h3>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Best time to visit {destinationName}:{" "}
        <span className="font-semibold text-foreground">{bestTime}</span>
      </p>

      {rows.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left text-sm">
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
                  <th scope="row" className="py-2 pr-3 font-semibold">{r.season}</th>
                  <td className="py-2 pr-3 text-muted-foreground">{r.months}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{r.temperature}</td>
                  <td className="py-2 text-muted-foreground">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <h3 className="text-base font-bold">Travel tips</h3>
      </div>
      {tips.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {tips.map((tip) => (
            <li key={tip} className="flex min-w-0 gap-2">
              <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span className="min-w-0">{tip}</span>
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
