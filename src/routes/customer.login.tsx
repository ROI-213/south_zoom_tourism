import { useCallback } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { CustomerAuthCard } from "@/components/customer/customer-auth-card";
import { AuthBenefits } from "@/components/customer/auth-benefits";
import { GuestAlternatives } from "@/components/customer/guest-alternatives";
import { useCustomerSession } from "@/hooks/use-customer-session";
import { safeRedirectPath, type CustomerSession } from "@/content/customer-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const SITE = "https://south-zoom-tourism.lovable.app";
const TITLE = "Customer Login & Registration — South Zoom Tourism";
const DESCRIPTION =
  "Sign in to South Zoom Tourism with a one-time code on your mobile or email to see booking history, invoices, saved travellers and cancellations. Guest booking stays available.";

type Search = { redirect?: string };

export const Route = createFileRoute("/customer/login")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    redirect: typeof search.redirect === "string" ? search.redirect.slice(0, 300) : undefined,
  }),
  head: () => ({
    links: [{ rel: "canonical", href: `${SITE}/customer/login` }],
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/customer/login` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
  }),
  component: CustomerLoginPage,
});

function CustomerLoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { session, loading, signOut } = useCustomerSession();
  const destination = safeRedirectPath(redirect);

  const handleAuthenticated = useCallback(
    (_session: CustomerSession, _createdAccount: boolean) => {
      navigate({ to: destination, replace: true });
    },
    [destination, navigate],
  );

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main id="main" className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Customer login", href: "/customer/login" },
            ]}
          />
          <header className="mt-4 max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Customer login &amp; registration
            </h1>
            <p className="mt-3 text-pretty text-sm text-muted-foreground sm:text-base">
              An account keeps every South Zoom Tourism booking, invoice and traveller detail in one
              place. It is entirely optional — guest booking and guest status tracking work exactly
              as before.
            </p>
          </header>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
            <div className="min-w-0 space-y-6">
              {loading ? (
                <div className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-7">
                  <Skeleton className="h-7 w-52" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : session ? (
                <section
                  aria-labelledby="signed-in-heading"
                  className="rounded-2xl border border-border bg-card p-5 sm:p-7"
                >
                  <h2 id="signed-in-heading" className="text-xl font-bold tracking-tight sm:text-2xl">
                    You&apos;re already signed in
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Signed in as {session.profile.fullName} (
                    {session.profile.mobile ? `+91 ${session.profile.mobile}` : session.profile.email}
                    ).
                  </p>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Button onClick={() => navigate({ to: destination })} className="w-full sm:w-auto">
                      Continue
                    </Button>
                    <Button variant="outline" onClick={signOut} className="w-full sm:w-auto">
                      Sign out
                    </Button>
                  </div>
                </section>
              ) : (
                <CustomerAuthCard onAuthenticated={handleAuthenticated} />
              )}
              <GuestAlternatives />
            </div>
            <div className="min-w-0">
              <AuthBenefits />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
