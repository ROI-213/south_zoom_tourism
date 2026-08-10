import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getPublishedPackages } from "@/content/tour-packages";
import { company } from "@/content/site";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s-]{10,15}$/, "Enter a valid phone number (10–15 digits)."),
  email: z.string().trim().email("Enter a valid email address.").or(z.literal("")),
  packageSlug: z.string().min(1, "Choose a package."),
  travelDate: z.string(),
  travellers: z.coerce
    .number()
    .int()
    .min(1, "At least one traveller.")
    .max(60, "Call us for groups above 60."),
  message: z.string().trim().max(600, "Please keep it under 600 characters."),
});

export function PackageEnquiryDialog({
  open,
  onOpenChange,
  packageSlug,
  travelDate = "",
  travellers,
  source = "tour-packages",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageSlug: string;
  travelDate?: string;
  travellers?: number;
  /** Where the enquiry was raised from — stored with the enquiry record. */
  source?: string;
}) {
  const options = getPublishedPackages();
  const isCustom = packageSlug === "customised-south-india-tour";

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      packageSlug,
      travelDate,
      travellers: travellers && travellers > 0 ? travellers : 2,
      message: "",
    },
  });

  const { register, handleSubmit, reset, setValue, formState } = form;
  const errors = formState.errors;

  // Preselect the package and travel-date context every time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setValue("packageSlug", packageSlug, { shouldValidate: true });
    setValue("travelDate", travelDate);
    if (travellers && travellers > 0) setValue("travellers", travellers);
  }, [open, packageSlug, travelDate, travellers, setValue]);

  const onSubmit = handleSubmit((values) => {
    // No backend connected yet: the enquiry is handed to the team over WhatsApp
    // so nothing is lost. The payload already matches the future
    // `package_enquiries` table (package_id, page_url, source).
    const pkg = options.find((p) => p.slug === values.packageSlug);
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";

    const lines = [
      `New package enquiry — ${pkg?.title ?? "Customised tour"}`,
      `Name: ${values.name}`,
      `Phone: ${values.phone}`,
      values.email ? `Email: ${values.email}` : null,
      values.travelDate ? `Travel date: ${values.travelDate}` : null,
      `Travellers: ${values.travellers}`,
      pkg?.soldOut ? "Note: selected departure is sold out — alternatives requested" : null,
      values.message ? `Details: ${values.message}` : null,
      `Package ref: ${pkg?.id ?? values.packageSlug}`,
      pageUrl ? `Page: ${pageUrl}` : null,
      `Source: ${source}`,
    ].filter(Boolean);

    window.open(
      `https://wa.me/${company.whatsappRaw}?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank",
      "noopener,noreferrer",
    );

    toast.success("Enquiry ready to send", {
      description: `We've prepared your ${pkg?.title ?? "tour"} enquiry on WhatsApp. You can also call ${company.phone}.`,
    });
    reset({ ...form.getValues(), name: "", phone: "", email: "", message: "" });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isCustom ? "Plan a customised tour" : "Package enquiry"}</DialogTitle>
          <DialogDescription>
            Tell us your dates and group size — we'll reply with an itinerary and a fixed quote.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="pe-package">Package</Label>
            <select
              id="pe-package"
              {...register("packageSlug")}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {options.map((option) => (
                <option key={option.id} value={option.slug}>
                  {option.title}
                  {option.soldOut ? " (sold out)" : ""}
                </option>
              ))}
            </select>
            {errors.packageSlug ? (
              <p className="text-xs text-destructive">{errors.packageSlug.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="pe-name">Your name</Label>
              <Input id="pe-name" autoComplete="name" {...register("name")} />
              {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pe-phone">Phone</Label>
              <Input id="pe-phone" inputMode="tel" autoComplete="tel" {...register("phone")} />
              {errors.phone ? (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="pe-email">Email (optional)</Label>
              <Input id="pe-email" type="email" autoComplete="email" {...register("email")} />
              {errors.email ? (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              ) : null}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pe-date">Travel date</Label>
              <Input id="pe-date" type="date" {...register("travelDate")} />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="pe-travellers">Travellers</Label>
            <Input id="pe-travellers" type="number" min={1} max={60} {...register("travellers")} />
            {errors.travellers ? (
              <p className="text-xs text-destructive">{errors.travellers.message}</p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="pe-message">What should we plan? (optional)</Label>
            <Textarea
              id="pe-message"
              rows={3}
              placeholder="Destinations, hotel preference, pickup city, anything special"
              {...register("message")}
            />
            {errors.message ? (
              <p className="text-xs text-destructive">{errors.message.message}</p>
            ) : null}
          </div>

          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            Send enquiry
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
