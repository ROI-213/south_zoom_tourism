import { recordEnquiryForTracking } from "@/content/booking-status";
import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { syncEnquiryToSupabase } from "@/lib/booking-sync";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { company, waLink } from "@/content/site";
import {
  contactFormBlock,
  generateEnquiryReference,
  getEnquiryServiceOptions,
  type ContactEnquiryPayload,
} from "@/content/contact";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100, "Name is too long."),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s-]{10,15}$/, "Enter a valid phone number (10–15 digits)."),
  email: z
    .string()
    .trim()
    .max(255, "Email is too long.")
    .email("Enter a valid email address.")
    .or(z.literal("")),
  service: z.string().trim().min(1, "Choose a service."),
  subject: z.string().trim().min(3, "Add a short subject.").max(120, "Subject is too long."),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more (at least 10 characters).")
    .max(1000, "Please keep it under 1000 characters."),
});

type Values = z.infer<typeof schema>;

export function ContactForm({
  serviceSlug,
  subjectPrefill,
  messagePrefill,
  onServiceChange,
}: {
  serviceSlug: string;
  subjectPrefill?: string;
  messagePrefill?: string;
  onServiceChange: (slug: string) => void;
}) {
  const options = getEnquiryServiceOptions();
  const [reference, setReference] = useState<string | null>(null);
  const lastSubmit = useRef<{ hash: string; at: number } | null>(null);

  const { register, handleSubmit, reset, control, setValue, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      service: serviceSlug,
      subject: subjectPrefill ?? "",
      message: messagePrefill ?? "",
    },
  });

  // Keep the select in sync when a quick action or deep link changes the topic.
  useEffect(() => {
    setValue("service", serviceSlug, { shouldValidate: false });
  }, [serviceSlug, setValue]);

  const onSubmit = (values: Values) => {
    const hash = JSON.stringify(values);
    const now = Date.now();
    if (
      lastSubmit.current &&
      lastSubmit.current.hash === hash &&
      now - lastSubmit.current.at < contactFormBlock.duplicateWindowMs
    ) {
      toast.info("We already have this enquiry", {
        description: "You sent the same details a moment ago — we'll get back to you shortly.",
      });
      return;
    }
    lastSubmit.current = { hash, at: now };

    const ref = generateEnquiryReference();
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";

    // No backend connected yet: the enquiry is handed to the team over
    // WhatsApp so nothing is lost. The payload below already matches the
    // shape the future `contact_enquiries` table expects.
    const payload: ContactEnquiryPayload = {
      reference: ref,
      source: "contact-us",
      page_url: pageUrl,
      name: values.name,
      phone: values.phone,
      email: values.email || null,
      service_slug: values.service === "general" ? null : values.service,
      subject: values.subject,
      message: values.message,
      status: "new",
      assigned_to: null,
      created_at: new Date().toISOString(),
    };

    const serviceLabel = options.find((o) => o.slug === values.service)?.label ?? "General enquiry";

    // Make the reference trackable on /booking-status.
    recordEnquiryForTracking({
      reference: ref,
      kind: "contact",
      serviceLabel: "Enquiry",
      serviceTitle: serviceLabel,
      travelWindow: "",
      guestsLabel: "",
      name: payload.name,
      phone: payload.phone,
      email: payload.email ?? "",
    });

    // Persist directly into Supabase backend database for admin & operations
    syncEnquiryToSupabase({
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      serviceType: serviceLabel,
      message: `Subject: ${payload.subject}\n${payload.message}`,
      reference: ref,
    });

    const lines = [
      `New contact enquiry — ${ref}`,
      `Name: ${payload.name}`,
      `Phone: ${payload.phone}`,
      payload.email ? `Email: ${payload.email}` : null,
      `Service: ${serviceLabel}`,
      `Subject: ${payload.subject}`,
      `Message: ${payload.message}`,
      pageUrl ? `Page: ${pageUrl}` : null,
    ].filter(Boolean) as string[];

    window.open(waLink(lines.join("\n")), "_blank", "noopener,noreferrer");

    setReference(ref);
    toast.success(`Enquiry ${ref} created`, {
      description: `We've prepared it on WhatsApp. You can also call ${company.phone}.`,
    });
    reset({
      name: "",
      phone: "",
      email: "",
      service: values.service,
      subject: "",
      message: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-labelledby="contact-form-heading"
      className="grid min-w-0 gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6"
    >
      {reference ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm font-semibold">
              Enquiry reference{" "}
              <span className="break-all font-mono text-primary">{reference}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{contactFormBlock.successNote}</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid min-w-0 gap-1.5">
          <Label htmlFor="contact-name">Your name</Label>
          <Input
            id="contact-name"
            autoComplete="name"
            aria-invalid={Boolean(formState.errors.name)}
            {...register("name")}
          />
          {formState.errors.name ? (
            <p className="text-xs text-destructive">{formState.errors.name.message}</p>
          ) : null}
        </div>

        <div className="grid min-w-0 gap-1.5">
          <Label htmlFor="contact-phone">Phone</Label>
          <Input
            id="contact-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(formState.errors.phone)}
            {...register("phone")}
          />
          {formState.errors.phone ? (
            <p className="text-xs text-destructive">{formState.errors.phone.message}</p>
          ) : null}
        </div>

        <div className="grid min-w-0 gap-1.5">
          <Label htmlFor="contact-email">Email (optional)</Label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(formState.errors.email)}
            {...register("email")}
          />
          {formState.errors.email ? (
            <p className="text-xs text-destructive">{formState.errors.email.message}</p>
          ) : null}
        </div>

        <div className="grid min-w-0 gap-1.5">
          <Label htmlFor="contact-service">Service</Label>
          <Controller
            control={control}
            name="service"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v) => {
                  field.onChange(v);
                  onServiceChange(v);
                }}
              >
                <SelectTrigger id="contact-service" className="w-full">
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {options.map((o) => (
                    <SelectItem key={o.slug} value={o.slug}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {formState.errors.service ? (
            <p className="text-xs text-destructive">{formState.errors.service.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid min-w-0 gap-1.5">
        <Label htmlFor="contact-subject">Subject</Label>
        <Input
          id="contact-subject"
          aria-invalid={Boolean(formState.errors.subject)}
          placeholder="Chennai → Munnar, 4 days, 6 travellers"
          {...register("subject")}
        />
        {formState.errors.subject ? (
          <p className="text-xs text-destructive">{formState.errors.subject.message}</p>
        ) : null}
      </div>

      <div className="grid min-w-0 gap-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          rows={5}
          aria-invalid={Boolean(formState.errors.message)}
          placeholder="Dates, pickup point, vehicle preference, hotel category…"
          {...register("message")}
        />
        {formState.errors.message ? (
          <p className="text-xs text-destructive">{formState.errors.message.message}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : null}
          Send enquiry
        </Button>
        <p className="text-xs text-muted-foreground">
          We reply within office hours — {company.officeTimings}.
        </p>
      </div>
    </form>
  );
}
