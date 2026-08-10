import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy path — tour packages now live at /tour-packages. */
export const Route = createFileRoute("/packages")({
  beforeLoad: () => {
    throw redirect({ to: "/tour-packages", replace: true });
  },
});
