import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function FaqSearch({
  value,
  onChange,
  resultCount,
}: {
  value: string;
  onChange: (v: string) => void;
  resultCount: number;
}) {
  return (
    <div className="w-full">
      <label htmlFor="faq-search" className="block text-sm font-semibold text-foreground">
        Search the FAQs
      </label>
      <div className="relative mt-2">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="faq-search"
          type="search"
          role="searchbox"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Try “cancellation”, “GST invoice”, “driver allowance”…"
          aria-describedby="faq-search-status"
          className="h-11 pl-9 pr-10"
        />
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Clear search"
            onClick={() => onChange("")}
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
      <p id="faq-search-status" aria-live="polite" className="mt-2 text-xs text-muted-foreground">
        {resultCount} {resultCount === 1 ? "question" : "questions"}
        {value.trim() ? ` matching “${value.trim()}”` : " in this view"}
      </p>
    </div>
  );
}
