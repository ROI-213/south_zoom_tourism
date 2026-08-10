import { ArrowDown, ArrowUp, MapPin, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { customTourFormBlock, getDestinationOptions, labelFor } from "@/content/custom-tour";
import type { Stop } from "./state";

export function DestinationPicker({
  stops,
  onChange,
  error,
}: {
  stops: Stop[];
  onChange: (next: Stop[]) => void;
  error?: string;
}) {
  const options = getDestinationOptions();
  const available = options.filter((o) => !stops.some((s) => s.slug === o.slug));
  const atMax = stops.length >= customTourFormBlock.maxStops;

  const add = (slug: string) => {
    if (!slug || atMax) return;
    onChange([...stops, { slug, nights: 1 }]);
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= stops.length) return;
    const next = [...stops];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="min-w-0">
          <Label htmlFor="ct-destination">Add a destination</Label>
          <Select value="" onValueChange={add} disabled={atMax || available.length === 0}>
            <SelectTrigger id="ct-destination" className="mt-1.5" aria-describedby="ct-destination-help">
              <SelectValue
                placeholder={
                  atMax
                    ? `Maximum ${customTourFormBlock.maxStops} destinations`
                    : available.length === 0
                      ? "All destinations added"
                      : "Choose a destination"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {available.map((o) => (
                <SelectItem key={o.slug} value={o.slug}>
                  {o.label}
                  {o.description ? ` — ${o.description}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p id="ct-destination-help" className="text-xs text-muted-foreground sm:pb-2.5">
          <Plus className="mr-1 inline h-3 w-3" aria-hidden="true" />
          Add several and reorder them
        </p>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}

      {stops.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          No destinations yet — add your first stop above.
        </p>
      ) : (
        <ol className="mt-3 space-y-2">
          {stops.map((stop, i) => (
            <li
              key={stop.slug}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-border bg-card p-3"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="truncate text-sm font-semibold">
                  {labelFor(options, stop.slug)}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <label className="sr-only" htmlFor={`ct-nights-${stop.slug}`}>
                  Nights in {labelFor(options, stop.slug)}
                </label>
                <input
                  id={`ct-nights-${stop.slug}`}
                  type="number"
                  min={0}
                  max={30}
                  value={stop.nights}
                  onChange={(e) => {
                    const nights = Math.max(0, Math.min(30, Number(e.target.value) || 0));
                    onChange(stops.map((s, idx) => (idx === i ? { ...s, nights } : s)));
                  }}
                  className="h-8 w-14 rounded-md border border-input bg-background px-2 text-sm"
                  aria-label={`Nights in ${labelFor(options, stop.slug)}`}
                />
                <span className="hidden text-xs text-muted-foreground sm:inline">nights</span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Move ${labelFor(options, stop.slug)} earlier`}
                >
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => move(i, 1)}
                  disabled={i === stops.length - 1}
                  aria-label={`Move ${labelFor(options, stop.slug)} later`}
                >
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onChange(stops.filter((_, idx) => idx !== i))}
                  aria-label={`Remove ${labelFor(options, stop.slug)}`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
