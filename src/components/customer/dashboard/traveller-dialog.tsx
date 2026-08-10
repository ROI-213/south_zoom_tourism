import { useState } from "react";
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
  saveTraveller,
  travellerIdTypes,
  travellerRelationships,
  type SavedTraveller,
} from "@/content/customer-data";
import type { CustomerProfile } from "@/content/customer-auth";

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter the traveller's name.").max(80, "Keep it under 80 characters."),
  relationship: z.string().min(1, "Choose a relationship."),
  age: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d{1,3}$/.test(v) && Number(v) >= 0 && Number(v) <= 120), "Enter an age between 0 and 120."),
  gender: z.enum(["male", "female", "other", "unspecified"]),
  idType: z.string().min(1, "Choose an ID type."),
  idNumberLast4: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{4}$/.test(v), "Enter only the last 4 digits."),
  notes: z.string().trim().max(300, "Keep notes under 300 characters."),
});

type Values = z.infer<typeof schema>;

export function TravellerDialog({
  profile,
  open,
  traveller,
  onOpenChange,
  onSaved,
}: {
  profile: CustomerProfile;
  open: boolean;
  traveller: SavedTraveller | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    values: {
      fullName: traveller?.fullName ?? "",
      relationship: traveller?.relationship ?? travellerRelationships[0],
      age: traveller?.age != null ? String(traveller.age) : "",
      gender: traveller?.gender ?? "unspecified",
      idType: traveller?.idType ?? travellerIdTypes[travellerIdTypes.length - 1],
      idNumberLast4: traveller?.idNumberLast4 ?? "",
      notes: traveller?.notes ?? "",
    },
  });

  const submit = (values: Values) => {
    setSubmitting(true);
    saveTraveller(
      profile,
      {
        fullName: values.fullName,
        relationship: values.relationship,
        age: values.age === "" ? null : Number(values.age),
        gender: values.gender,
        idType: values.idType,
        idNumberLast4: values.idNumberLast4,
        notes: values.notes,
      },
      traveller?.id,
    );
    setSubmitting(false);
    toast.success(traveller ? "Traveller updated" : "Traveller saved");
    onSaved();
    onOpenChange(false);
  };

  const err = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{traveller ? "Edit traveller" : "Add a traveller"}</DialogTitle>
          <DialogDescription>
            Store only what speeds up a booking. We keep the last 4 digits of an ID, never the full number.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(submit)} className="grid gap-4" noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="tv-name">Full name</Label>
            <Input id="tv-name" maxLength={80} autoComplete="name" {...form.register("fullName")} />
            {err.fullName ? <p className="text-xs text-destructive">{err.fullName.message}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="tv-rel">Relationship</Label>
              <select
                id="tv-rel"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...form.register("relationship")}
              >
                {travellerRelationships.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="tv-age">Age (optional)</Label>
              <Input id="tv-age" inputMode="numeric" maxLength={3} {...form.register("age")} />
              {err.age ? <p className="text-xs text-destructive">{err.age.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="tv-gender">Gender</Label>
              <select
                id="tv-gender"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...form.register("gender")}
              >
                <option value="unspecified">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="tv-idtype">ID type</Label>
              <select
                id="tv-idtype"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...form.register("idType")}
              >
                {travellerIdTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="tv-id4">ID number — last 4 digits (optional)</Label>
            <Input id="tv-id4" inputMode="numeric" maxLength={4} {...form.register("idNumberLast4")} />
            {err.idNumberLast4 ? (
              <p className="text-xs text-destructive">{err.idNumberLast4.message}</p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="tv-notes">Notes (optional)</Label>
            <Textarea id="tv-notes" rows={2} maxLength={300} {...form.register("notes")} />
            {err.notes ? <p className="text-xs text-destructive">{err.notes.message}</p> : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {traveller ? "Save changes" : "Add traveller"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
