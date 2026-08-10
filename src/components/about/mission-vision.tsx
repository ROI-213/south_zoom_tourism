import { Check, Compass, Target } from "lucide-react";
import { Reveal } from "@/components/common/reveal";
import { missionBlock, visionBlock } from "@/content/about";

export function MissionVision() {
  if (!missionBlock.visible && !visionBlock.visible) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
      <div className="grid gap-6 lg:grid-cols-2">
        {missionBlock.visible ? (
          <Reveal className="min-w-0">
            <article className="h-full rounded-2xl border border-border bg-card p-6 sm:p-8">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Target className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-2xl font-bold tracking-tight">{missionBlock.heading}</h2>
              <p className="mt-3 text-pretty text-sm text-muted-foreground sm:text-base">
                {missionBlock.statement}
              </p>
              <ul className="mt-6 space-y-3">
                {missionBlock.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span className="min-w-0">{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ) : null}

        {visionBlock.visible ? (
          <Reveal className="min-w-0" delay={80}>
            <article className="h-full rounded-2xl bg-primary p-6 text-primary-foreground sm:p-8">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-foreground/15">
                <Compass className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-2xl font-bold tracking-tight">{visionBlock.heading}</h2>
              <p className="mt-3 text-pretty text-sm text-primary-foreground/85 sm:text-base">
                {visionBlock.statement}
              </p>
              <ul className="mt-6 space-y-3">
                {visionBlock.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0">{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
