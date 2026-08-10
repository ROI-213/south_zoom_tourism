import { Quote } from "lucide-react";
import { Reveal } from "@/components/common/reveal";
import { messageBlock } from "@/content/about";

export function FounderMessage() {
  if (!messageBlock.visible) return null;

  return (
    <section className="bg-secondary/40 py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <Reveal>
          <figure className="grid gap-6 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
            <img
              src={messageBlock.authorImage}
              alt={messageBlock.authorImageAlt}
              width={800}
              height={800}
              loading="lazy"
              className="h-24 w-24 shrink-0 rounded-full object-cover lg:h-40 lg:w-40"
            />
            <div className="min-w-0">
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                {messageBlock.heading}
              </h2>
              <Quote className="mt-3 h-6 w-6 text-primary" aria-hidden="true" />
              <blockquote className="mt-2 text-pretty text-sm text-muted-foreground sm:text-base">
                {messageBlock.quote}
              </blockquote>
              <figcaption className="mt-4 text-sm font-semibold">
                {messageBlock.authorName}
                <span className="block text-xs font-normal text-muted-foreground">
                  {messageBlock.authorRole}
                </span>
              </figcaption>
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
