import { createFileRoute } from "@tanstack/react-router";
import { RateCardSection } from "@/components/fleet/rate-card-section";

export const Route = createFileRoute("/rate-cards")({
  component: RateCards,
  // SEO metadata
  meta: () => ({
    title: "Fleet Rate Cards – South Zoom Tourism",
    description:
      "Transparent local and outstation rate cards for our fleet. Choose Sedan, SUV, Tempo Traveller, or Bus and calculate your fare instantly.",
    // Open Graph data can be added here if needed
  }),
});

function RateCards() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      {/* Header can be added if needed */}
      <main className="flex-1">
        <RateCardSection />
      </main>
    </div>
  );
}
