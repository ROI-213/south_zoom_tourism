import { useEffect, useState } from "react";
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
  cancellationEligibility,
  cancellationReasons,
  createCancellationRequest,
  listCancellations,
  type CustomerBooking,
} from "@/content/customer-data";
import type { CustomerProfile } from "@/content/customer-auth";

const schema = z.object({
  reason: z.string().min(1, "Choose a reason."),
  preferredResolution: z.enum(["cancel", "reschedule"]),
  details: z.string().trim().max(600, "Keep it under 600 characters.").optional().or(z.literal("")),
});

type Values = z.infer<typeof schema>;

export function CancellationDialog({
  profile,
  booking,
  onOpenChange,
  onCreated,
}: {
  profile: CustomerProfile;
  booking: CustomerBooking | null;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [eligibility, setEligibility] = useState({ allowed: true, note: "" });

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { reason: cancellationReasons[0], preferredResolution: "cancel", details: "" },
  });

  useEffect(() => {
    if (booking) setEligibility(cancellationEligibility(booking, listCancellations(profile)));
  }, [booking, profile]);

  const submit = (values: Values) => {
    if (!booking) return;
    const request = createCancellationRequest(profile, booking, {
      reason: values.reason,
      details: values.details ?? "",
      preferredResolution: values.preferredResolution,
    });
    toast.success(`Request ${request.reference} created`, {
      description: "Our team reviews the policy and confirms any refund in writing. Nothing is refunded automatically.",
    });
    form.reset();
    onCreated();
    onOpenChange(false);
  };

  return (
    <Dialog open={Boolean(booking)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request cancellation or change</DialogTitle>
          <DialogDescription>
            {booking ? `${booking.reference} — ${booking.snapshot.title}` : ""}
          </DialogDescription>
        </DialogHeader>

        <p className="rounded-lg border border-border bg-secondary/60 p-3 text-xs text-muted-foreground">
          {eligibility.note}
        </p>

        {eligibility.allowed ? (
          <form onSubmit={form.handleSubmit(submit)} className="grid gap-4" noValidate>
            <div className="grid gap-1.5">
              <Label htmlFor="cx-reason">Reason</Label>
              <select
                id="cx-reason"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...form.register("reason")}
              >
                {cancellationReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            <fieldset className="grid gap-1.5">
              <legend className="text-sm font-medium">What would you prefer?</legend>
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 text-sm">
                  <Input
                    type="radio"
                    value="cancel"
                    className="h-4 w-4"
                    {...form.register("preferredResolution")}
                  />
                  Cancel the booking
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Input
                    type="radio"
                    value="reschedule"
                    className="h-4 w-4"
                    {...form.register("preferredResolution")}
                  />
                  Reschedule instead
                </label>
              </div>
            </fieldset>

            <div className="grid gap-1.5">
              <Label htmlFor="cx-details">Anything we should know? (optional)</Label>
              <Textarea id="cx-details" rows={3} maxLength={600} {...form.register("details")} />
              {form.formState.errors.details ? (
                <p className="text-xs text-destructive">{form.formState.errors.details.message}</p>
              ) : null}
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Keep booking
              </Button>
              <Button type="submit">Submit request</Button>
            </DialogFooter>
          </form>
        ) : (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
