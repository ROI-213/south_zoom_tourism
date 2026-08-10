import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy path — the About Us page now lives at /about-us. */
export const Route = createFileRoute("/about")({
  beforeLoad: () => {
    throw redirect({ to: "/about-us", replace: true });
  },
});
