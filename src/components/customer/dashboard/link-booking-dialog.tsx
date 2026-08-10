import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { linkBookingToAccount } from "@/content/customer-data";
import type { CustomerProfile } from "@/content/customer-auth";

const schema = z.object({
  reference: z
    .string()
    .trim()
    .min(6, "Enter the booking reference from your confirmation.")
    .max(40, "That reference is too long."),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s-]{10,15}$/, "Enter the mobile number used for the booking."),
});

type Values = z.infer<typeof schema>;

/** Guest bookings only join the account after the contact number is verified. */
export function LinkBookingDialog({
  profile,
  onLinked,
}: {
  profile: CustomerProfile;
  onLinked: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { reference: "", phone: "" } });

  const submit = (values: Values) => {
    const result = linkBookingToAccount(profile, values.reference, values.phone);
    if (result.ok) {
      toast.success(`${result.booking.reference} added to your account`);
      form.reset();
      setError(null);
      setOpen(false);
      onLinked();
      return;
    }
    setError(
      result.reason === "already-linked"
        ? "That booking is already linked to another account. Contact our team for help."
        : "We couldn't verify that booking reference with this mobile number. Check both and try again.",
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Link2 className="h-4 w-4" aria-hidden="true" />
          Link a booking
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
        <DialogHeader>
          <DialogTitle>Link a guest booking</DialogTitle>
          <DialogDescription>
            Booked without an account? Enter the reference and the mobile number on that booking —
            both must match before it joins your account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(submit)} className="grid gap-4" noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="link-ref">Booking reference</Label>
            <Input id="link-ref" placeholder="SZT-HB-260729-1234" autoComplete="off" {...form.register("reference")} />
            {form.formState.errors.reference ? (
              <p className="text-xs text-destructive">{form.formState.errors.reference.message}</p>
            ) : null}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="link-phone">Mobile number on the booking</Label>
            <Input id="link-phone" inputMode="tel" autoComplete="tel" {...form.register("phone")} />
            {form.formState.errors.phone ? (
              <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
            ) : null}
          </div>
          {error ? (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
              {error}
            </p>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Verify & link</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
