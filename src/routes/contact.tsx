import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy path — the Contact Us page now lives at /contact-us. */
export const Route = createFileRoute("/contact")({
  // Context params (e.g. ?vehicle=innova-crysta&intent=booking) are preserved
  // so Book Now / enquiry CTAs still prefill the form after the redirect.
  validateSearch: (search: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(search).filter(([, v]) => typeof v === "string" && v !== ""),
    ) as Record<string, string>,
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/contact-us", search, replace: true });
  },
});
