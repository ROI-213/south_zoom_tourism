import { useState } from "react";
import {
  Hotel,
  MapPin,
  Calendar,
  Users,
  BedDouble,
  MessageCircle,
  CheckCircle2,
  Loader2,
  Phone,
  Mail,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { waLink, company } from "@/content/site";
import { syncEnquiryToSupabase } from "@/lib/booking-sync";
import { toast } from "sonner";
import type { HotelRecord } from "@/content/hotels";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotel: HotelRecord;
  stay?: {
    checkIn?: string;
    checkOut?: string;
    rooms?: number;
    adults?: number;
    children?: number;
  };
};

function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}
function getDefaultCheckOut(checkIn: string) {
  const d = new Date(checkIn);
  d.setDate(d.getDate() + 2);
  return d.toISOString().slice(0, 10);
}

export function HotelEnquiryModal({ open, onOpenChange, hotel, stay = {} }: Props) {
  const today = getTodayISO();
  const defaultCheckIn = stay.checkIn || today;
  const defaultCheckOut = stay.checkOut || getDefaultCheckOut(defaultCheckIn);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [rooms, setRooms] = useState(stay.rooms || 1);
  const [adults, setAdults] = useState(stay.adults || 2);
  const [children, setChildren] = useState(stay.children || 0);
  const [specialReqs, setSpecialReqs] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState("");

  // Derived helpers
  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.round(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
          )
        )
      : 0;

  const waMessage = [
    `Hi South Zoom Tourism! I'd like to book a stay at *${hotel.name}*, ${hotel.city}.`,
    `📅 Check-in: ${checkIn}  |  Check-out: ${checkOut}  (${nights} night${nights !== 1 ? "s" : ""})`,
    `🛏️ Rooms: ${rooms}  |  👥 Adults: ${adults}${children > 0 ? `  |  Children: ${children}` : ""}`,
    name ? `👤 Name: ${name}` : "",
    phone ? `📞 Phone: ${phone}` : "",
    specialReqs ? `📝 Special requests: ${specialReqs}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Please enter your name and phone number.");
      return;
    }
    if (nights < 1) {
      toast.error("Check-out must be after check-in.");
      return;
    }

    setSubmitting(true);
    const ref = `SZT-HTL-${Date.now().toString(36).toUpperCase()}`;
    const message = [
      `Hotel: ${hotel.name}, ${hotel.city}`,
      `Check-in: ${checkIn}  |  Check-out: ${checkOut}  (${nights} nights)`,
      `Rooms: ${rooms}  |  Adults: ${adults}  |  Children: ${children}`,
      specialReqs ? `Special requests: ${specialReqs}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await syncEnquiryToSupabase({
        reference: ref,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        serviceType: "Hotel & Room Booking",
        travelDate: checkIn || undefined,
        message,
      });
      setRefId(ref);
      setSubmitted(true);
      toast.success("Enquiry submitted! We'll contact you shortly.");
    } catch {
      toast.error("Something went wrong. Please try again or use WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    onOpenChange(false);
    // Reset after close animation
    setTimeout(() => {
      setSubmitted(false);
      setRefId("");
      setName("");
      setPhone("");
      setEmail("");
      setSpecialReqs("");
    }, 300);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl p-0">
        {/* Header */}
        <div className="bg-primary/5 border-b border-border px-6 pt-6 pb-4 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
              <Hotel className="h-5 w-5 text-primary shrink-0" />
              Book Your Stay
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Complete the form and our team will confirm availability within 2 hours.
            </DialogDescription>
          </DialogHeader>

          {/* Hotel Summary Card */}
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-background p-3">
            <img
              src={hotel.image}
              alt={hotel.imageAlt}
              className="h-14 w-20 rounded-lg object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="font-bold text-sm text-foreground truncate">{hotel.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 shrink-0 text-primary" />
                {hotel.city}, {hotel.state}
              </p>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {hotel.starRating > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {"★".repeat(hotel.starRating)} {hotel.starRating}-Star
                  </Badge>
                )}
                {hotel.amenities.slice(0, 2).map((a) => (
                  <Badge key={a} variant="outline" className="text-[10px] px-1.5 py-0">
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {submitted ? (
          /* Success State */
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-foreground">Enquiry Received!</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Our team will call you within 2 hours to confirm availability at{" "}
                <span className="font-semibold text-foreground">{hotel.name}</span>.
              </p>
              {refId && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Reference:{" "}
                  <span className="font-mono font-bold text-primary">{refId}</span>
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <Button asChild className="w-full">
                <a href={waLink(waMessage)} target="_blank" rel="noreferrer noopener">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Also message on WhatsApp
                </a>
              </Button>
              <Button variant="outline" onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {/* Stay Details */}
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-3">
                <Calendar className="h-4 w-4 text-primary" />
                Stay Details
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="hbm-checkin" className="text-xs font-semibold">
                    Check-in
                  </Label>
                  <Input
                    id="hbm-checkin"
                    type="date"
                    min={today}
                    value={checkIn}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      if (e.target.value >= checkOut) {
                        setCheckOut(getDefaultCheckOut(e.target.value));
                      }
                    }}
                    className="text-sm h-9"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hbm-checkout" className="text-xs font-semibold">
                    Check-out
                  </Label>
                  <Input
                    id="hbm-checkout"
                    type="date"
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="text-sm h-9"
                    required
                  />
                </div>
              </div>

              {nights > 0 && (
                <p className="mt-2 text-xs text-primary font-semibold">
                  📅 {nights} night{nights !== 1 ? "s" : ""} selected
                </p>
              )}

              <div className="grid grid-cols-3 gap-3 mt-3">
                <div className="space-y-1.5">
                  <Label htmlFor="hbm-rooms" className="text-xs font-semibold flex items-center gap-1">
                    <BedDouble className="h-3 w-3" /> Rooms
                  </Label>
                  <Input
                    id="hbm-rooms"
                    type="number"
                    min={1}
                    max={10}
                    value={rooms}
                    onChange={(e) => setRooms(Number(e.target.value))}
                    className="text-sm h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hbm-adults" className="text-xs font-semibold flex items-center gap-1">
                    <Users className="h-3 w-3" /> Adults
                  </Label>
                  <Input
                    id="hbm-adults"
                    type="number"
                    min={1}
                    max={20}
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="text-sm h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hbm-children" className="text-xs font-semibold">
                    Children
                  </Label>
                  <Input
                    id="hbm-children"
                    type="number"
                    min={0}
                    max={10}
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="text-sm h-9"
                  />
                </div>
              </div>
            </div>

            {/* Guest Details */}
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-3">
                <Users className="h-4 w-4 text-primary" />
                Your Details
              </h4>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="hbm-name" className="text-xs font-semibold">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="hbm-name"
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-sm h-9"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="hbm-phone" className="text-xs font-semibold flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Phone <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="hbm-phone"
                      type="tel"
                      placeholder="+91 63663 57757"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="text-sm h-9"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="hbm-email" className="text-xs font-semibold flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email
                    </Label>
                    <Input
                      id="hbm-email"
                      type="email"
                      placeholder="optional"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-sm h-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hbm-requests" className="text-xs font-semibold">
                    Special Requests (optional)
                  </Label>
                  <Textarea
                    id="hbm-requests"
                    placeholder="e.g. Non-smoking room, early check-in, honeymoon setup…"
                    value={specialReqs}
                    onChange={(e) => setSpecialReqs(e.target.value)}
                    className="text-sm resize-none min-h-[72px]"
                    maxLength={300}
                  />
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-3">
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <div className="text-xs text-green-800 dark:text-green-200">
                  <span className="font-bold">No payment required now.</span> Our team will confirm
                  availability and share room options before you pay anything.
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pb-1">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Hotel className="h-4 w-4 mr-2" />
                    Send Booking Enquiry
                  </>
                )}
              </Button>

              <Button asChild variant="outline" className="w-full h-10 text-sm border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400">
                <a href={waLink(waMessage)} target="_blank" rel="noreferrer noopener">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Quick WhatsApp Enquiry
                </a>
              </Button>

              <p className="text-center text-[10px] text-muted-foreground">
                Or call us directly:{" "}
                <a href={`tel:${company.phoneRaw}`} className="font-semibold text-primary hover:underline">
                  {company.phone}
                </a>
              </p>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
