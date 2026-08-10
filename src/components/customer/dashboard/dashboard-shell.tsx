import { useEffect, useRef, useState, type ReactNode } from "react";
import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { AppLink } from "@/components/common/app-link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCustomerSession } from "@/hooks/use-customer-session";
import { dashboardNav, navGroups, navItemFor } from "./nav-items";
import type { CustomerProfile } from "@/content/customer-auth";

export function DashboardNavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <nav aria-label="Customer dashboard" className="space-y-5">
      {navGroups.map((group) => {
        const items = dashboardNav.filter((item) => item.group === group);
        return (
          <div key={group}>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {group}
            </p>
            <ul className="mt-2 space-y-1">
              {items.map((item) => {
                const active =
                  item.href === "/customer/dashboard"
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <AppLink
                      href={item.href}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 truncate">{item.label}</span>
                    </AppLink>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

/**
 * Shared chrome for every dashboard page: client-side auth gate, responsive
 * sidebar/drawer navigation, breadcrumbs and the page heading.
 */
export function DashboardShell({
  href,
  title,
  description,
  actions,
  children,
}: {
  href: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: (profile: CustomerProfile) => ReactNode;
}) {
  const navigate = useNavigate();
  const { session, loading, signOut } = useCustomerSession();
  const signingOut = useRef(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const item = navItemFor(href);

  useEffect(() => {
    if (!loading && !session && !signingOut.current) {
      navigate({ to: "/customer/login", search: { redirect: href }, replace: true });
    }
  }, [loading, session, navigate, href]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main id="main" className="flex-1 bg-secondary/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Dashboard", href: "/customer/dashboard" },
              ...(href === "/customer/dashboard" ? [] : [{ label: item?.label ?? title, href }]),
            ]}
          />

          <div className="mt-4 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
            <aside className="hidden lg:sticky lg:top-24 lg:block">
              <div className="rounded-2xl border border-border bg-card p-4">
                <DashboardNavList />
              </div>
            </aside>

            <div className="min-w-0">
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 lg:hidden">
                    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Menu className="h-4 w-4" aria-hidden="true" />
                          Menu
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-[86vw] max-w-xs overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle>My dashboard</SheetTitle>
                        </SheetHeader>
                        <div className="mt-4" onClick={() => setDrawerOpen(false)}>
                          <DashboardNavList />
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                  <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:mt-0">{title}</h1>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {actions}
                  {session ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        signingOut.current = true;
                        navigate({ to: "/", replace: true });
                        window.setTimeout(signOut, 0);
                      }}
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Sign out
                    </Button>
                  ) : null}
                </div>
              </header>

              <div className="mt-6">
                {loading || !session ? (
                  <div className="space-y-4" aria-busy="true">
                    <Skeleton className="h-28 w-full rounded-2xl" />
                    <Skeleton className="h-40 w-full rounded-2xl" />
                    <Skeleton className="h-40 w-full rounded-2xl" />
                  </div>
                ) : (
                  children(session.profile)
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const SITE = "https://south-zoom-tourism.lovable.app";

/** Shared head() metadata for private dashboard pages. */
export function dashboardHead(path: string, title: string, description: string) {
  const url = `${SITE}${path}`;
  return {
    links: [{ rel: "canonical", href: url }],
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
  };
}

export type { CustomerProfile };
export { createFileRoute };
