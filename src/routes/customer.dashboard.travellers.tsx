import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell, dashboardHead } from "@/components/customer/dashboard/dashboard-shell";
import { EmptyState } from "@/components/customer/dashboard/empty-state";
import { TravellerDialog } from "@/components/customer/dashboard/traveller-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useClientData } from "@/hooks/use-client-data";
import { deleteTraveller, listTravellers, type SavedTraveller } from "@/content/customer-data";
import type { CustomerProfile } from "@/content/customer-auth";

const HREF = "/customer/dashboard/travellers";
const TITLE = "Saved Travellers — South Zoom Tourism";
const DESCRIPTION = "Reusable traveller details so future bookings take seconds to complete.";

export const Route = createFileRoute("/customer/dashboard/travellers")({
  head: () => dashboardHead(HREF, TITLE, DESCRIPTION),
  component: TravellersPage,
});

function TravellersPage() {
  return (
    <DashboardShell
      href={HREF}
      title="Saved travellers"
      description="Save the people you usually travel with. We store only the last 4 digits of any ID."
    >
      {(profile) => <TravellersBody profile={profile} />}
    </DashboardShell>
  );
}

function TravellersBody({ profile }: { profile: CustomerProfile }) {
  const { data, loading, reload } = useClientData(() => listTravellers(profile), [profile.id]);
  const [editing, setEditing] = useState<SavedTraveller | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<SavedTraveller | null>(null);

  if (loading) return <Skeleton className="h-56 w-full rounded-2xl" aria-busy="true" />;

  const travellers = data ?? [];

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{travellers.length} saved</p>
        <Button size="sm" className="gap-1.5" onClick={openNew}>
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Add traveller
        </Button>
      </div>

      {travellers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No saved travellers"
          body="Add family, colleagues or frequent co-travellers once and reuse their details on every booking."
        >
          <Button size="sm" onClick={openNew}>
            Add your first traveller
          </Button>
        </EmptyState>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {travellers.map((traveller) => (
            <li key={traveller.id} className="min-w-0 rounded-2xl border border-border bg-card p-4">
              <p className="truncate text-sm font-bold">{traveller.fullName}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {traveller.relationship}
                {traveller.age != null ? ` · ${traveller.age} yrs` : ""}
                {traveller.gender !== "unspecified" ? ` · ${traveller.gender}` : ""}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {traveller.idType}
                {traveller.idNumberLast4 ? ` ending ${traveller.idNumberLast4}` : " — not provided"}
              </p>
              {traveller.notes ? <p className="mt-2 break-words text-sm">{traveller.notes}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => {
                    setEditing(traveller);
                    setDialogOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-destructive hover:text-destructive"
                  onClick={() => setPendingDelete(traveller)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <TravellerDialog
        profile={profile}
        open={dialogOpen}
        traveller={editing}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        onSaved={reload}
      />

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {pendingDelete?.fullName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This only removes the saved details from your account. Existing bookings are unaffected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) {
                  deleteTraveller(profile, pendingDelete.id);
                  toast.success("Traveller removed");
                  reload();
                }
                setPendingDelete(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
