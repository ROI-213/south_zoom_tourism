import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { company, redirectToWhatsApp } from "@/content/site";
import { syncEnquiryToSupabase } from "@/lib/booking-sync";

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
  travelDate: z.string().max(20),
  travellers: z
    .string()
    .trim()
    .regex(/^\d{0,3}$/, "Enter a number up to 999.")
    .or(z.literal("")),
  message: z.string().trim().max(600, "Please keep it under 600 characters."),
});

type Values = z.infer<typeof schema>;

export function DestinationEnquiryForm({
  destinationName,
  destinationId,
  destinationSlug,
}: {
  destinationName: string;
  destinationId: string;
  destinationSlug: string;
}) {
  const { register, handleSubmit, reset, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", email: "", travelDate: "", travellers: "", message: "" },
  });

  const fieldId = (name: string) => `dest-enq-${destinationSlug}-${name}`;

  const onSubmit = async (values: Values) => {
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";
    const ref = `SZT-DST-${Date.now().toString(36).toUpperCase()}`;

    // Store in Supabase Admin CRM
    await syncEnquiryToSupabase({
      reference: ref,
      name: values.name,
      phone: values.phone,
      email: values.email || undefined,
      serviceType: "Tour Package",
      travelDate: values.travelDate || undefined,
      message: `Destination: ${destinationName}${values.travellers ? ` | Travellers: ${values.travellers}` : ""}${values.message ? `\nDetails: ${values.message}` : ""}`,
    });

    const lines = [
      `New destination enquiry — ${destinationName}`,
      `Name: ${values.name}`,
      `Phone: ${values.phone}`,
      values.email ? `Email: ${values.email}` : null,
      values.travelDate ? `Travel date: ${values.travelDate}` : null,
      values.travellers ? `Travellers: ${values.travellers}` : null,
      values.message ? `Details: ${values.message}` : null,
      `Destination ref: ${destinationId}`,
      pageUrl ? `Page: ${pageUrl}` : null,
    ].filter(Boolean) as string[];

    // Redirect to WhatsApp (6366357757)
    redirectToWhatsApp(lines.join("\n"));

    toast.success("Enquiry submitted!", {
      description: `We've redirected you to WhatsApp. You can also call ${company.phone}.`,
    });
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid gap-4 rounded-xl border border-border bg-card p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor={fieldId("name")}>Your name</Label>
          <Input id={fieldId("name")} autoComplete="name" {...register("name")} />
          {formState.errors.name ? (
            <p className="text-xs text-destructive">{formState.errors.name.message}</p>
          ) : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={fieldId("phone")}>Phone</Label>
          <Input id={fieldId("phone")} inputMode="tel" autoComplete="tel" {...register("phone")} />
          {formState.errors.phone ? (
            <p className="text-xs text-destructive">{formState.errors.phone.message}</p>
          ) : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={fieldId("email")}>Email (optional)</Label>
          <Input id={fieldId("email")} type="email" autoComplete="email" {...register("email")} />
          {formState.errors.email ? (
            <p className="text-xs text-destructive">{formState.errors.email.message}</p>
          ) : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={fieldId("date")}>Travel date (optional)</Label>
          <Input id={fieldId("date")} type="date" {...register("travelDate")} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={fieldId("travellers")}>Travellers (optional)</Label>
          <Input
            id={fieldId("travellers")}
            inputMode="numeric"
            placeholder="e.g. 4"
            {...register("travellers")}
          />
          {formState.errors.travellers ? (
            <p className="text-xs text-destructive">{formState.errors.travellers.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor={fieldId("message")}>What are you planning?</Label>
        <Textarea
          id={fieldId("message")}
          rows={4}
          placeholder={`Tell us how many days you have for ${destinationName}, and whether you need a hotel and vehicle.`}
          {...register("message")}
        />
        {formState.errors.message ? (
          <p className="text-xs text-destructive">{formState.errors.message.message}</p>
        ) : null}
      </div>

      <div>
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : null}
          Send {destinationName} enquiry
        </Button>
      </div>
    </form>
  );
}
