import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { DashboardShell, dashboardHead } from "@/components/customer/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCustomerSession } from "@/hooks/use-customer-session";
import { maskEmail, maskPhone } from "@/content/booking-access";
import { updateProfile, type CustomerProfile } from "@/content/customer-auth";

const HREF = "/customer/dashboard/profile";
const TITLE = "My Profile — South Zoom Tourism";
const DESCRIPTION = "Update the name, city and travel notes used on your bookings.";

export const Route = createFileRoute("/customer/dashboard/profile")({
  head: () => dashboardHead(HREF, TITLE, DESCRIPTION),
  component: ProfilePage,
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(80, "Keep it under 80 characters."),
  city: z.string().trim().max(60, "Keep it under 60 characters."),
  notes: z.string().trim().max(400, "Keep notes under 400 characters."),
});

type Values = z.infer<typeof schema>;

function ProfilePage() {
  return (
    <DashboardShell
      href={HREF}
      title="Profile"
      description="These details pre-fill your booking forms. Verified contact channels can only be changed by OTP."
    >
      {(profile) => <ProfileBody profile={profile} />}
    </DashboardShell>
  );
}

function ProfileBody({ profile }: { profile: CustomerProfile }) {
  const { refresh } = useCustomerSession();
  const [saving, setSaving] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: profile.fullName, city: profile.city ?? "", notes: profile.notes ?? "" },
  });

  const submit = (values: Values) => {
    setSaving(true);
    const updated = updateProfile(profile.id, values);
    setSaving(false);
    if (!updated) {
      toast.error("We couldn't save that. Please sign in again.");
      return;
    }
    refresh();
    toast.success("Profile updated");
  };

  const err = form.formState.errors;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
      <section aria-labelledby="pf-form" className="min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <h2 id="pf-form" className="text-lg font-bold tracking-tight">
          Your details
        </h2>
        <form onSubmit={form.handleSubmit(submit)} className="mt-4 grid gap-4" noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="pf-name">Full name</Label>
            <Input id="pf-name" maxLength={80} autoComplete="name" {...form.register("fullName")} />
            {err.fullName ? <p className="text-xs text-destructive">{err.fullName.message}</p> : null}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pf-city">City</Label>
            <Input id="pf-city" maxLength={60} autoComplete="address-level2" {...form.register("city")} />
            {err.city ? <p className="text-xs text-destructive">{err.city.message}</p> : null}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pf-notes">Travel preferences (optional)</Label>
            <Textarea
              id="pf-notes"
              rows={3}
              maxLength={400}
              placeholder="Window seat, vegetarian meals, ground-floor rooms…"
              {...form.register("notes")}
            />
            {err.notes ? <p className="text-xs text-destructive">{err.notes.message}</p> : null}
          </div>
          <div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </section>

      <aside className="min-w-0 space-y-4">
        <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <h2 className="text-base font-bold tracking-tight">Verified contact</h2>
          <dl className="mt-3 grid gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Mobile</dt>
              <dd className="font-medium">{profile.mobile ? maskPhone(profile.mobile) : "Not added"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd className="break-words font-medium">
                {profile.email ? maskEmail(profile.email) : "Not added"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Verified via</dt>
              <dd className="font-medium">
                {profile.verifiedVia === "mobile" ? "Mobile OTP" : "Email OTP"}
              </dd>
            </div>
          </dl>
          <p className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-2 rounded-xl bg-secondary/60 px-3 py-2.5 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0">
              Contact channels change only after a fresh OTP, because they control access to your booking
              documents.
            </span>
          </p>
        </section>
      </aside>
    </div>
  );
}
