import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronsDownUp, ChevronsUpDown, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageBanner } from "@/components/common/page-banner";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { FaqSearch } from "@/components/faqs/faq-search";
import { FaqCategoryTabs } from "@/components/faqs/faq-category-tabs";
import { FaqAccordion } from "@/components/faqs/faq-accordion";
import { FaqSupportCta } from "@/components/faqs/faq-support-cta";
import {
  faqsBannerBlock,
  findFaqBySlug,
  getFaqCategoryLabel,
  getPublishedFaqCategories,
  getPublishedFaqs,
  searchFaqs,
  setDynamicFaqs,
  mapDbFaqToItem,
  type FaqItem,
} from "@/content/faqs";
import supabase from "@/lib/supabase";

type FaqSearchParams = { category?: string; q?: string; question?: string };

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

export const Route = createFileRoute("/faqs")({
  validateSearch: (search: Record<string, unknown>): FaqSearchParams => ({
    category: str(search.category),
    q: str(search.q),
    question: str(search.question),
  }),
  component: FaqsPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">The FAQs didn't load</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">FAQs not found</h1>
    </div>
  ),
  head: () => ({
    meta: [
      { title: "FAQs — Bookings, Payments & Policies | South Zoom Tourism" },
      {
        name: "description",
        content:
          "Answers to South Zoom Tourism questions on vehicle bookings, tour packages, hotels and rooms, payments, cancellations, refunds, invoices, driver policies and support.",
      },
      { property: "og:title", content: "FAQs — Bookings, Payments & Policies | South Zoom Tourism" },
      {
        property: "og:description",
        content:
          "Searchable support answers on bookings, fares, hotels, payments, cancellations, refunds, invoices and driver policies.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/faqs" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/faqs" }],
    scripts: [
      {
        type: "application/ld+json",
        // Only published answers reach the schema.
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: publishedFaqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: faqsBannerBlock.breadcrumbs.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            item: c.href,
          })),
        }),
      },
    ],
  }),
});

function FaqsPage() {
  const navigate = useNavigate({ from: "/faqs" });
  const { category = "all", q = "", question } = Route.useSearch();
  const [faqsList, setFaqsList] = useState<FaqItem[]>(() => getPublishedFaqs());

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from('faqs').select('*').eq('active', true).order('display_order');
        if (!error && data && data.length > 0) {
          const mapped = data.map(mapDbFaqToItem);
          setDynamicFaqs(mapped);
          setFaqsList(mapped);
        }
      } catch (err) {
        console.error('Error fetching FAQs:', err);
      }
    })();
  }, []);

  const categories = getPublishedFaqCategories();
  const [open, setOpen] = useState<string[]>(() => (question ? [question] : []));

  const filtered = useMemo(() => {
    const scoped =
      category === "all"
        ? faqsList
        : faqsList.filter((f) => f.categorySlug === category);
    return searchFaqs(scoped, q);
  }, [category, q, faqsList]);

  // Deep link: open and scroll to the requested question.
  useEffect(() => {
    if (!question) return;
    const target = findFaqBySlug(question);
    if (!target) return;
    setOpen((prev) => (prev.includes(question) ? prev : [...prev, question]));
    const el = document.getElementById(`faq-${question}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [question]);

  const setParam = (patch: Partial<FaqSearchParams>) =>
    navigate({
      search: (prev: FaqSearchParams) => {
        const next = { ...prev, ...patch };
        return Object.fromEntries(
          Object.entries(next).filter(([, v]) => typeof v === "string" && v !== ""),
        ) as FaqSearchParams;
      },
      replace: true,
    });

  const allOpen = filtered.length > 0 && filtered.every((f) => open.includes(f.slug));

  const copyLink = async (faq: FaqItem) => {
    const url = `${window.location.origin}/faqs?category=${faq.categorySlug}&question=${faq.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied", { description: faq.question });
    } catch {
      toast.error("Couldn't copy the link", { description: url });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <Navbar />

      <main className="flex-1">
        {faqsBannerBlock.visible ? (
          <PageBanner
            title={faqsBannerBlock.title}
            subtitle={faqsBannerBlock.subtitle}
            image={faqsBannerBlock.image}
            imageAlt={faqsBannerBlock.imageAlt}
            breadcrumbs={faqsBannerBlock.breadcrumbs}
          />
        ) : (
          <h1 className="sr-only">Frequently Asked Questions</h1>
        )}

        <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
          <FaqSearch value={q} onChange={(v) => setParam({ q: v, question: undefined })} resultCount={filtered.length} />

          <div className="mt-6">
            <h2 className="sr-only">Topics</h2>
            <FaqCategoryTabs
              categories={categories}
              active={category}
              total={publishedFaqs.length}
              onSelect={(slug) => setParam({ category: slug === "all" ? undefined : slug, question: undefined })}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">
              {category === "all" ? "All questions" : getFaqCategoryLabel(category)}
            </h2>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={filtered.length === 0}
              aria-pressed={allOpen}
              onClick={() => setOpen(allOpen ? [] : filtered.map((f) => f.slug))}
            >
              {allOpen ? (
                <ChevronsDownUp className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronsUpDown className="h-4 w-4" aria-hidden="true" />
              )}
              {allOpen ? "Collapse all" : "Expand all"}
            </Button>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center">
              <HelpCircle className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold">No answers matched your search</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Try a shorter phrase such as “refund”, “invoice” or “airport”, switch to All topics,
                or send the question to our team — we answer the same day.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => setParam({ q: undefined })}>
                  Clear search
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setParam({ category: undefined, q: undefined })}
                >
                  Show all topics
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <FaqAccordion
                items={filtered}
                open={open}
                onOpenChange={setOpen}
                query={q}
                showCategoryLabel={category === "all"}
                onCopyLink={copyLink}
              />
            </div>
          )}

          <div className="mt-10">
            <FaqSupportCta category={category} query={q} />
          </div>
        </div>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}
