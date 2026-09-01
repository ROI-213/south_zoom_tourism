import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/cms/")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/cms/hero", replace: true });
  },
  component: () => null,
});
