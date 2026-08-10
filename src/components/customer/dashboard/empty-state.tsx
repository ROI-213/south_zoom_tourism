import type { ReactNode } from "react";
import { AppLink } from "@/components/common/app-link";
import { Button } from "@/components/ui/button";

/** Friendly first-time state — every dashboard list uses this. */
export function EmptyState({
  icon: Icon,
  title,
  body,
  primary,
  secondary,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  body: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center sm:px-8">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="mt-4 text-base font-bold tracking-tight sm:text-lg">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
      {(primary || secondary || children) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {primary ? (
            <Button asChild size="sm">
              <AppLink href={primary.href}>{primary.label}</AppLink>
            </Button>
          ) : null}
          {secondary ? (
            <Button asChild size="sm" variant="outline">
              <AppLink href={secondary.href}>{secondary.label}</AppLink>
            </Button>
          ) : null}
          {children}
        </div>
      )}
    </div>
  );
}
