import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy, MessageSquarePlus, Send } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell, dashboardHead } from "@/components/customer/dashboard/dashboard-shell";
import { EmptyState } from "@/components/customer/dashboard/empty-state";
import { ToneBadge } from "@/components/customer/dashboard/status-badge";
import { SupportDialog } from "@/components/customer/dashboard/support-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientData } from "@/hooks/use-client-data";
import {
  addSupportReply,
  formatDateTime,
  listCustomerBookings,
  listSupportRequests,
  supportStatusMeta,
} from "@/content/customer-data";
import type { CustomerProfile } from "@/content/customer-auth";

const HREF = "/customer/dashboard/support";
const TITLE = "Support Requests — South Zoom Tourism";
const DESCRIPTION = "Raise a question about a booking and follow the reply thread with our team.";

export const Route = createFileRoute("/customer/dashboard/support")({
  head: () => dashboardHead(HREF, TITLE, DESCRIPTION),
  component: SupportPage,
});

function SupportPage() {
  return (
    <DashboardShell
      href={HREF}
      title="Support requests"
      description="Ask about a booking, a document or a payment. We reply within one working day."
    >
      {(profile) => <SupportBody profile={profile} />}
    </DashboardShell>
  );
}

function SupportBody({ profile }: { profile: CustomerProfile }) {
  const { data, loading, reload } = useClientData(
    () => ({ requests: listSupportRequests(profile), bookings: listCustomerBookings(profile) }),
    [profile.id],
  );
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  if (loading || !data) return <Skeleton className="h-56 w-full rounded-2xl" aria-busy="true" />;

  const sendReply = (reference: string) => {
    const body = (drafts[reference] ?? "").trim();
    if (body.length < 2) return;
    addSupportReply(profile, reference, body);
    setDrafts((prev) => ({ ...prev, [reference]: "" }));
    toast.success("Reply added to the thread");
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{data.requests.length} requests</p>
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
          New request
        </Button>
      </div>

      {data.requests.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="No support requests"
          body="Have a question about a booking, an invoice or a document? Raise a request and track the reply here."
          secondary={{ href: "/contact-us", label: "Other ways to reach us" }}
        >
          <Button size="sm" onClick={() => setOpen(true)}>
            Raise a request
          </Button>
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {data.requests.map((request) => (
            <li key={request.reference} className="min-w-0 rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {request.reference} · {request.category}
                    {request.bookingReference ? ` · ${request.bookingReference}` : ""}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-bold">{request.subject}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Raised {formatDateTime(request.createdAt)}
                  </p>
                </div>
                <ToneBadge {...supportStatusMeta[request.status]} />
              </div>

              <p className="mt-3 rounded-xl bg-secondary/60 px-3 py-2.5 text-sm">{request.message}</p>

              {request.replies.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {request.replies.map((reply) => (
                    <li
                      key={reply.id}
                      className={`rounded-xl border px-3 py-2.5 text-sm ${
                        reply.author === "team" ? "border-primary/30 bg-primary/5" : "border-border"
                      }`}
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {reply.author === "team" ? "South Zoom team" : "You"} · {formatDateTime(reply.createdAt)}
                      </p>
                      <p className="mt-1 break-words">{reply.body}</p>
                    </li>
                  ))}
                </ul>
              ) : null}

              {request.status !== "closed" ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <div className="min-w-0">
                    <label htmlFor={`reply-${request.reference}`} className="text-xs text-muted-foreground">
                      Add to this thread
                    </label>
                    <Textarea
                      id={`reply-${request.reference}`}
                      rows={2}
                      maxLength={800}
                      value={drafts[request.reference] ?? ""}
                      onChange={(event) =>
                        setDrafts((prev) => ({ ...prev, [request.reference]: event.target.value }))
                      }
                    />
                  </div>
                  <Button size="sm" className="gap-1.5" onClick={() => sendReply(request.reference)}>
                    <Send className="h-4 w-4" aria-hidden="true" />
                    Send
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <SupportDialog
        profile={profile}
        open={open}
        bookings={data.bookings}
        onOpenChange={setOpen}
        onCreated={reload}
      />
    </div>
  );
}
