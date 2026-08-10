import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { company, mainNav } from "@/content/site";
import sztLogo from "@/assets/szt-logo.png";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="grid max-w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 lg:px-8 py-2">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2"
          aria-label={`${company.name} home`}
        >
          {/* SZT Logo — transparent bg, crisp at any scale */}
          <img
            src={sztLogo}
            alt="South Zoom Tourism logo"
            className="h-10 w-auto object-contain sm:h-12"
            style={{ maxWidth: "120px" }}
          />
          <span className="min-w-0">
            <span className="block text-sm font-black leading-tight tracking-tight uppercase sm:text-base">
              South Zoom Tourism
            </span>
            <span className="block text-[10px] sm:text-[11px] text-muted-foreground font-medium whitespace-nowrap">
              Travel, Comfort and Experiences Count a Lot!
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 xl:flex">
          {mainNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className="rounded-md px-2.5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="xl:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm overflow-y-auto">
              {/* Mobile menu logo header */}
              <div className="flex items-center gap-3 px-4 pt-4">
                <img
                  src={sztLogo}
                  alt="South Zoom Tourism logo"
                  className="h-10 w-auto object-contain"
                />
                <SheetTitle className="text-base font-extrabold">South Zoom Tourism</SheetTitle>
              </div>
              <nav aria-label="Mobile" className="mt-4 flex flex-col px-2 pb-6">
                {mainNav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: item.to === "/" }}
                    activeProps={{ className: "text-primary" }}
                    className="rounded-md px-3 py-3 text-base font-medium text-foreground/90 hover:bg-accent"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
