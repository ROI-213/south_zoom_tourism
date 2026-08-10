import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShieldCheck, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLink } from "@/components/common/app-link";
import { company, telLink } from "@/content/site";

const schema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{8,18}$/, "Enter the mobile number used on the booking")
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Enter a valid 10-digit mobile number"),
});

type FormValues = z.infer<typeof schema>;

export function BookingVerifyForm({
  bookingNumber,
  onVerify,
}: {
  bookingNumber: string;
  /** Returns true when the phone matches the booking. */
  onVerify: (phone: string) => boolean;
}) {
  const [failed, setFailed] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { phone: "" } });

  return (
    <section
      aria-labelledby="verify-heading"
      className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-7"
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
        <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0">
          <h1 id="verify-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Verify it's your booking
          </h1>
          <p className="mt-2 text-pretty text-sm text-muted-foreground">
            For your privacy we never show booking details from a booking number alone. Enter the
            mobile number used when booking{" "}
            <span className="font-mono font-semibold text-foreground">{bookingNumber}</span> and we'll
            open your confirmation.
          </p>
        </div>
      </div>

      <form
        className="mt-6 max-w-sm space-y-3"
        onSubmit={handleSubmit(async (values) => {
          const ok = onVerify(values.phone);
          setFailed(!ok);
        })}
      >
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="verify-phone">Booking mobile number</Label>
          <Input
            id="verify-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91 98400 12345"
            aria-invalid={Boolean(errors.phone) || failed}
            aria-describedby={errors.phone || failed ? "verify-phone-error" : undefined}
            {...register("phone")}
          />
          {(errors.phone || failed) && (
            <p id="verify-phone-error" role="alert" className="text-xs font-medium text-destructive">
              {errors.phone?.message ??
                "We couldn't match that number to this booking number. Check both and try again, or call our team."}
            </p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          View my booking
        </Button>
      </form>

      <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-sm">
        <p className="font-semibold">Can't get in?</p>
        <p className="mt-1 text-muted-foreground">
          Bookings open on the device or browser they were made on, or through the secure link we send
          you. Our team can re-send that link after a quick identity check.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Button asChild size="sm" variant="outline">
            <a href={telLink()}>
              <Phone aria-hidden="true" /> Call {company.phone}
            </a>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <AppLink href="/contact-us">Contact support</AppLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
