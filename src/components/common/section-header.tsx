import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { SectionMeta } from "@/content/site";
import { AppLink } from "@/components/common/app-link";

export function SectionHeader({
  meta,
  align = "start",
}: {
  meta: SectionMeta;
  align?: "start" | "center";
}) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto mb-8 max-w-2xl text-center"
          : "mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4"
      }
    >
      <div className="min-w-0">
        <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {meta.heading}
        </h2>
        {meta.subheading ? (
          <p className="mt-2 text-pretty text-sm text-muted-foreground sm:text-base">
            {meta.subheading}
          </p>
        ) : null}
      </div>
      {meta.viewAll && align !== "center" ? (
        <AppLink
          href={meta.viewAll.href}
          className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
        >
          {meta.viewAll.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </AppLink>
      ) : null}
    </div>
  );
}

export function ViewAllMobile({ meta }: { meta: SectionMeta }) {
  if (!meta.viewAll) return null;
  return (
    <div className="mt-6 sm:hidden">
      <AppLink
        href={meta.viewAll.href}
        className="inline-flex w-full items-center justify-center gap-1 rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-primary"
      >
        {meta.viewAll.label}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </AppLink>
    </div>
  );
}

export { Link };
