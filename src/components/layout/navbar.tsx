import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { company, telLink, waLink } from "@/content/site";
import sztLogo from "@/assets/szt-logo.png";

// Primary navigation links shown directly in the header bar
// Order: Home → About Us → Services → Fleet → Tour Packages → Destinations → Hotels → Gallery → Testimonials → FAQs → Contact Us (last)
const primaryNavItems = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about-us" },
  { label: "Services", to: "/services" },
  { label: "Fleet", to: "/fleet" },
  { label: "Tour Packages", to: "/tour-packages" },
  { label: "Destinations", to: "/destinations" },
  { label: "Hotels", to: "/hotels" },
  { label: "Gallery", to: "/gallery" },
  { label: "Testimonials", to: "/testimonials" },
  { label: "FAQs", to: "/faqs" },
  { label: "Contact Us", to: "/contact-us" },
] as const;

// Secondary items accessible under the "More" dropdown
const secondaryNavItems = [] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/98 shadow-xs backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="mx-auto flex w-full max-w-[1920px] items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8 xl:px-10">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90"
          aria-label={`${company.name} home`}
        >
          <img
            src={sztLogo}
            alt="South Zoom Tourism logo"
            className="h-10 w-auto object-contain"
            style={{ maxWidth: "110px" }}
          />
          <span className="min-w-0 hidden lg:block">
            <span className="block text-xs font-black leading-tight tracking-tight uppercase text-foreground">
              South Zoom Tourism
            </span>
            <span className="block text-[9px] text-muted-foreground font-medium truncate max-w-[260px]">
              Travel, Comfort and Experiences Count a Lot!
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main" className="hidden lg:flex items-center gap-1 xl:gap-2.5 2xl:gap-3.5 justify-center">
          {primaryNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{
                className: "text-primary font-bold after:opacity-100 after:scale-x-100",
              }}
              inactiveProps={{
                className: "text-foreground/75 font-semibold after:opacity-0 after:scale-x-0 hover:text-foreground",
              }}
              className="relative whitespace-nowrap px-1.5 xl:px-2 py-3 text-[11px] xl:text-xs uppercase tracking-wider transition-all duration-150 after:absolute after:bottom-0 after:left-1 after:right-1 after:h-[2.5px] after:rounded-full after:bg-primary after:transition-all after:duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right CTA Button & Mobile Trigger */}
        <div className="flex shrink-0 items-center gap-2.5">
          {/* Dark Pill Phone Icon Button */}
          <a
            href={telLink()}
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
            aria-label={`Call us at ${company.phone}`}
          >
            <Phone className="h-3.5 w-3.5 fill-current" />
          </a>

          {/* Mobile Sheet Trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden h-9 w-9" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm overflow-y-auto p-0">
              {/* Mobile menu logo header */}
              <div className="flex items-center gap-3 border-b border-border/80 p-5">
                <img
                  src={sztLogo}
                  alt="South Zoom Tourism logo"
                  className="h-10 w-auto object-contain"
                />
                <div>
                  <SheetTitle className="text-sm font-extrabold uppercase tracking-tight text-foreground">
                    South Zoom Tourism
                  </SheetTitle>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    24×7 South India Travel Desk
                  </p>
                </div>
              </div>

              {/* Call CTA Pill on Mobile */}
              <div className="px-5 pt-4 pb-2">
                <a
                  href={telLink()}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-2.5 text-xs font-bold text-white shadow-sm active:bg-slate-800 dark:bg-primary dark:text-primary-foreground"
                >
                  <Phone className="h-3.5 w-3.5 fill-current" />
                  <span>{company.phone}</span>
                </a>
              </div>

              {/* Nav Links */}
              <nav aria-label="Mobile" className="flex flex-col px-3 py-2">
                {[...primaryNavItems, ...secondaryNavItems].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: item.to === "/" }}
                    activeProps={{
                      className: "bg-primary/10 text-primary font-bold border-l-4 border-primary pl-3",
                    }}
                    inactiveProps={{
                      className: "text-foreground/80 font-medium hover:bg-accent pl-4",
                    }}
                    className="rounded-md py-2.5 text-sm uppercase tracking-wide transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* WhatsApp Quick Action */}
              <div className="mt-auto border-t border-border/80 p-5">
                <a
                  href={waLink("Hi South Zoom Tourism, I would like to make an enquiry.")}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
