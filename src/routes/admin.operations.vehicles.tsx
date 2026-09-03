import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/operations/vehicles')({
  beforeLoad: () => {
    throw redirect({ to: '/admin/products/fleet', replace: true });
  },
  component: () => null,
});
