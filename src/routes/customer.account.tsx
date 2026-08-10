import { createFileRoute, redirect } from "@tanstack/react-router";

/** The account page was replaced by the full customer dashboard. */
export const Route = createFileRoute("/customer/account")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/customer/dashboard", replace: true });
  },
  component: () => null,
});
