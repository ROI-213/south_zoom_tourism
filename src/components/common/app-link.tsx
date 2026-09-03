import { Link, type LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";

/**
 * Renders an internal router link for app paths and a plain anchor for
 * external / tel: / whatsapp destinations. Href values come from admin data,
 * so they are plain strings rather than literal route types.
 */
export function AppLink({
  href,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const isExternal = /^(https?:|tel:|mailto:)/.test(href);

  if (isExternal) {
    return (
      <a
        href={href}
        className={className}
        aria-label={ariaLabel}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      to={href as LinkProps["to"]}
      preload="intent"
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  );
}
