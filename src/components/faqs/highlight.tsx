import { Fragment } from "react";

/**
 * Wraps every case-insensitive match of the search terms in <mark>.
 * Purely presentational — no HTML is injected.
 */
export function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .slice(0, 8);

  if (terms.length === 0) return <>{text}</>;

  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`(${escaped.join("|")})`, "gi"));
  const lowered = new Set(terms);

  return (
    <>
      {parts.map((part, i) =>
        lowered.has(part.toLowerCase()) ? (
          <mark key={i} className="rounded bg-primary/20 px-0.5 text-foreground">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
