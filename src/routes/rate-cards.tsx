import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RateCardSection } from "@/components/fleet/rate-card-section";

export const Route = createFileRoute("/rate-cards")({
  component: RateCards,
  // SEO metadata
  head: () => ({
    meta: [
      { title: "Fleet Rate Cards & Fare Calculator – South Zoom Tourism" },
      {
        name: "description",
        content:
          "Transparent local and outstation rate cards for our fleet. Choose Sedan, SUV, Tempo Traveller, or Bus and calculate your fare instantly.",
      },
    ],
  }),
});

function RateCards() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        <RateCardSection />
      </main>
      <Footer />
    </div>
  );
}
