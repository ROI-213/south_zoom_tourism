import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  reference: z
    .string()
    .trim()
    .min(6, "Enter the reference number from your confirmation message")
    .max(40, "That reference looks too long"),
  contact: z
    .string()
    .trim()
    .min(6, "Enter the mobile number or email used on the booking")
    .max(80, "That looks too long")
    .refine(
      (v) => (v.includes("@") ? /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(v) : v.replace(/\D/g, "").length >= 10),
      "Enter a valid 10-digit mobile number or email address",
    ),
});

export type LookupValues = z.infer<typeof schema>;

export function StatusLookupForm({
  onLookup,
  errorMessage,
  defaultReference = "",
}: {
  onLookup: (values: LookupValues) => void;
  errorMessage: string | null;
  defaultReference?: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LookupValues>({
    resolver: zodResolver(schema),
    defaultValues: { reference: defaultReference, contact: "" },
  });

  return (
    <section
      aria-labelledby="lookup-heading"
      className="rounded-2xl border border-border bg-card p-5 sm:p-7"
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
        <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0">
          <h2 id="lookup-heading" className="text-xl font-bold tracking-tight sm:text-2xl">
            Track your booking or enquiry
          </h2>
          <p className="mt-2 text-pretty text-sm text-muted-foreground">
            For your privacy, a reference number alone never reveals booking details. Add the mobile
            number or email you used and we&apos;ll show a verified status summary.
          </p>
        </div>
      </div>

      <form
        className="mt-6 grid gap-4 sm:grid-cols-2"
        noValidate
        onSubmit={handleSubmit(async (values) => {
          setSubmitting(true);
          onLookup(values);
          window.setTimeout(() => setSubmitting(false), 250);
        })}
      >
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="track-reference">Booking / enquiry number</Label>
          <Input
            id="track-reference"
            placeholder="SZT-HB-260712-1234"
            autoComplete="off"
            spellCheck={false}
            className="font-mono uppercase"
            aria-invalid={Boolean(errors.reference)}
            aria-describedby={errors.reference ? "track-reference-error" : undefined}
            {...register("reference")}
          />
          {errors.reference ? (
            <p id="track-reference-error" role="alert" className="text-xs font-medium text-destructive">
              {errors.reference.message}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="track-contact">Mobile number or email</Label>
          <Input
            id="track-contact"
            placeholder="98765 43210 or you@email.com"
            autoComplete="off"
            aria-invalid={Boolean(errors.contact)}
            aria-describedby={errors.contact ? "track-contact-error" : undefined}
            {...register("contact")}
          />
          {errors.contact ? (
            <p id="track-contact-error" role="alert" className="text-xs font-medium text-destructive">
              {errors.contact.message}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting}>
            <Search className="mr-2 h-4 w-4" aria-hidden="true" />
            {submitting ? "Checking…" : "Check status"}
          </Button>
        </div>
      </form>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-5 grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-foreground"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
          <span className="min-w-0">{errorMessage}</span>
        </p>
      ) : null}
    </section>
  );
}
