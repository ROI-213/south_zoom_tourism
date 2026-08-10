import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createSupportRequest,
  supportCategories,
  type CustomerBooking,
} from "@/content/customer-data";
import type { CustomerProfile } from "@/content/customer-auth";

const schema = z.object({
  category: z.string().min(1, "Choose a category."),
  subject: z.string().trim().min(4, "Add a short subject.").max(120, "Keep it under 120 characters."),
  message: z.string().trim().min(10, "Tell us a little more.").max(1000, "Keep it under 1000 characters."),
  bookingReference: z.string().trim().max(40).optional().or(z.literal("")),
});

type Values = z.infer<typeof schema>;

export function SupportDialog({
  profile,
  open,
  booking,
  bookings,
  onOpenChange,
  onCreated,
}: {
  profile: CustomerProfile;
  open: boolean;
  booking?: CustomerBooking | null;
  bookings: CustomerBooking[];
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    values: {
      category: supportCategories[0],
      subject: booking ? `Help with ${booking.reference}` : "",
      message: "",
      bookingReference: booking?.reference ?? "",
    },
  });

  const submit = (values: Values) => {
    const request = createSupportRequest(profile, {
      category: values.category,
      subject: values.subject,
      message: values.message,
      bookingReference: values.bookingReference || null,
    });
    toast.success(`Support request ${request.reference} raised`, {
      description: "You can follow the reply thread under Support requests.",
    });
    form.reset({ category: supportCategories[0], subject: "", message: "", bookingReference: "" });
    onCreated();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Raise a support request</DialogTitle>
          <DialogDescription>
            Every request gets a reference so you can track the reply here.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(submit)} className="grid gap-4" noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="sr-category">Category</Label>
            <select
              id="sr-category"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...form.register("category")}
            >
              {supportCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="sr-booking">Related booking (optional)</Label>
            <select
              id="sr-booking"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...form.register("bookingReference")}
            >
              <option value="">Not about a specific booking</option>
              {bookings.map((item) => (
                <option key={item.reference} value={item.reference}>
                  {item.reference} — {item.snapshot.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="sr-subject">Subject</Label>
            <Input id="sr-subject" maxLength={120} {...form.register("subject")} />
            {form.formState.errors.subject ? (
              <p className="text-xs text-destructive">{form.formState.errors.subject.message}</p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="sr-message">How can we help?</Label>
            <Textarea id="sr-message" rows={4} maxLength={1000} {...form.register("message")} />
            {form.formState.errors.message ? (
              <p className="text-xs text-destructive">{form.formState.errors.message.message}</p>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Send request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
