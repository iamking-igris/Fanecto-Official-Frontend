import { createFileRoute, Link } from "@tanstack/react-router";
import { PropertyCard } from "@/components/fanecto/property-card";
import { PageHeader } from "@/components/fanecto/page-header";
import { Section } from "@/components/fanecto/kit";
import { Stars } from "@/components/fanecto/stars";
import { InspectionPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime, formatNaira } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/dashboard")({ component: DashboardRoute });

function DashboardRoute() {
  return (
    <RoleGate allow={["student", "seeker"]}>
      <StudentDashboard />
    </RoleGate>
  );
}

function StudentDashboard() {
  const user = useCurrentFanectoUser();
  const properties = useFanecto((s) => s.properties.filter((p) => p.status === "published"));
  const saved = useFanecto((s) => s.properties.filter((p) => s.savedIds.includes(p.id)));
  const inspections = useFanecto((s) => s.inspections.filter((i) => i.seekerId === user?.id));
  const notifications = useFanecto((s) =>
    s.notifications.filter((n) => n.recipientId === user?.id).slice(0, 5),
  );
  const prompts = useFanecto((s) =>
    s.reviewPrompts.filter((p) => p.reviewerId === user?.id && !s.dismissedPrompts.includes(p.id)),
  );
  const paymentRequests = useFanecto((s) =>
    s.paymentRequests.filter((r) => r.toUserId === user?.id && r.status === "awaiting_payment"),
  );
  const conversations = useFanecto((s) =>
    s.conversations.filter((c) => user && c.participantIds.includes(user.id)),
  );
  const users = useFanecto((s) => s.users);
  const allProperties = useFanecto((s) => s.properties);

  const upcoming = inspections.find((i) => i.status === "scheduled" || i.status === "paid");
  const inspector = useFanecto((s) => s.users.find((u) => u.id === upcoming?.inspectorId));
  const roommates = useFanecto((s) =>
    user?.role === "student"
      ? s.roommateListings.filter(
          (l) =>
            l.creatorId === user.id ||
            s.roommateConnections.some((c) => c.seekerId === user.id && c.listingId === l.id),
        )
      : [],
  );

  const inquiries = useMemo(() => {
    return conversations
      .filter((c) => c.context === "rental" && c.propertyId)
      .slice(0, 4)
      .map((c) => {
        const other = users.find((u) => c.participantIds.includes(u.id) && u.id !== user?.id);
        const prop = allProperties.find((p) => p.id === c.propertyId);
        return { conv: c, other, prop };
      });
  }, [conversations, users, allProperties, user?.id]);

  const recommended = useMemo(() => {
    const savedSet = new Set(saved.map((p) => p.id));
    return properties.filter((p) => !savedSet.has(p.id)).slice(0, 3);
  }, [properties, saved]);

  if (!user) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        kicker={user.role === "student" ? "Student workspace" : "Seeker workspace"}
        title={`Hello, ${user.firstName}.`}
        description="Find a home, request inspections, and manage payments from here — not the public marketing site."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/properties">Find a home</Link>
            </Button>
            {user.role === "student" ? (
              <Button asChild variant="outline">
                <Link to="/roommates">Roommates</Link>
              </Button>
            ) : null}
          </div>
        }
      />

      {/* Review prompts */}
      {prompts.map((p) => (
        <ReviewCard key={p.id} promptId={p.id} title={p.title} />
      ))}

      {/* Actionable: payment requests */}
      {paymentRequests.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-medium">Payment requests</h2>
          <ul className="space-y-3">
            {paymentRequests.map((r) => {
              const prop = allProperties.find((p) => p.id === r.propertyId);
              return (
                <Card key={r.id} className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                        Awaiting payment
                      </p>
                      <p className="mt-1 font-medium">{prop?.title ?? "Property"}</p>
                      <p className="text-sm text-muted-foreground">
                        {prop?.area} · due {r.dueDate}
                      </p>
                      <p className="mt-2 text-sm tabular-nums">
                        Rent {formatNaira(r.annualRent)} + Fanecto 5% {formatNaira(r.fanectoFee)}
                      </p>
                      <p className="font-semibold tabular-nums">Total {formatNaira(r.totalPayable)}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button asChild size="sm">
                        <Link to="/payments">Review & pay</Link>
                      </Button>
                      {prop ? (
                        <Button asChild size="sm" variant="outline">
                          <Link to="/properties/$id" params={{ id: prop.id }}>
                            View property
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </Card>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* Upcoming inspection */}
      {upcoming ? (
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Upcoming inspection
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">{inspector?.displayName ?? "Inspector"}</p>
              <p className="text-sm text-muted-foreground">
                {upcoming.scheduledAt ? formatDateTime(upcoming.scheduledAt) : "Awaiting a time"} ·{" "}
                {formatNaira(upcoming.fee)}
              </p>
            </div>
            <InspectionPill status={upcoming.status} />
          </div>
          <Button asChild variant="outline" className="mt-3">
            <Link to="/inspections">View inspections</Link>
          </Button>
        </Card>
      ) : null}

      {/* Active inquiries */}
      <Section
        title="Active inquiries"
        action={
          <Link to="/messages" className="text-sm font-medium text-primary">
            All messages
          </Link>
        }
      >
        {inquiries.length === 0 ? (
          <div className="rounded-2xl bg-card px-4 py-5 text-sm shadow-[var(--shadow-border)]">
            <p className="text-muted-foreground">
              When you message a landlord or agent about a home, the conversation stays linked to that property
              here.
            </p>
            <Button asChild className="mt-3" variant="outline" size="sm">
              <Link to="/properties">Find a home to inquire about</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {inquiries.map(({ conv, other, prop }) => (
              <li key={conv.id}>
                <Link
                  to="/messages"
                  search={{ c: conv.id }}
                  className="flex items-center gap-3 rounded-xl bg-card px-3 py-3 shadow-[var(--shadow-border)] transition-colors hover:bg-secondary/40"
                >
                  {prop?.images[0] ? (
                    <img
                      src={prop.images[0]}
                      alt=""
                      className="size-12 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="size-12 shrink-0 rounded-lg bg-secondary" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{prop?.title ?? conv.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {other?.displayName ?? "Provider"} · {prop?.area ?? "Property inquiry"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-primary">Open</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Saved homes */}
      <Section
        title="Saved homes"
        action={
          <Link to="/saved" className="text-sm font-medium text-primary">
            All saved
          </Link>
        }
      >
        {saved.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {saved.slice(0, 3).map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-card px-4 py-5 text-sm shadow-[var(--shadow-border)]">
            <p className="text-muted-foreground">
              No saved homes yet. Save listings you want to return to without searching again.
            </p>
            <Button asChild className="mt-3" variant="outline" size="sm">
              <Link to="/properties">Browse homes</Link>
            </Button>
          </div>
        )}
      </Section>

      {/* Recommended */}
      <Section
        title="Recommended for you"
        action={
          <Link to="/properties" className="text-sm font-medium text-primary">
            Browse all
          </Link>
        }
      >
        {recommended.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No published homes to recommend right now.</p>
        )}
      </Section>

      {/* Roommates — student only */}
      {user.role === "student" ? (
        <Section
          title="Roommates"
          action={
            <Link to="/roommates" className="text-sm font-medium text-primary">
              Marketplace
            </Link>
          }
        >
          {roommates.length ? (
            <ul className="space-y-2">
              {roommates.map((r) => (
                <li key={r.id}>
                  <Link
                    to="/roommates/$id"
                    params={{ id: r.id }}
                    className="flex items-center justify-between rounded-xl bg-card px-4 py-3 text-sm shadow-[var(--shadow-border)] transition-colors hover:text-primary"
                  >
                    <span>
                      {r.displayName} · {r.preferredArea}
                    </span>
                    <span className="text-xs text-muted-foreground">View</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl bg-card px-4 py-5 text-sm shadow-[var(--shadow-border)]">
              <p className="text-muted-foreground">
                Post for free or connect with someone for ₦3,000. Chat opens after payment. No roommate reviews.
              </p>
              <Button asChild className="mt-3" variant="outline" size="sm">
                <Link to="/roommates">Browse roommate listings</Link>
              </Button>
            </div>
          )}
        </Section>
      ) : null}

      {/* Alerts */}
      <Section
        title="Recent alerts"
        action={
          notifications.length > 0 ? (
            <span className="text-xs text-muted-foreground">{notifications.length} shown</span>
          ) : null
        }
      >
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No alerts yet. Messages, inspections and payments will show here.</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li key={n.id}>
                {n.href ? (
                  <Link
                    to={n.href}
                    className="block rounded-xl bg-card px-4 py-3 text-sm shadow-[var(--shadow-border)] transition-colors hover:bg-secondary/40"
                  >
                    <p className="font-medium">{n.title}</p>
                    <p className="text-muted-foreground">{n.body}</p>
                  </Link>
                ) : (
                  <div className="rounded-xl bg-card px-4 py-3 text-sm shadow-[var(--shadow-border)]">
                    <p className="font-medium">{n.title}</p>
                    <p className="text-muted-foreground">{n.body}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function ReviewCard({ promptId, title }: { promptId: string; title: string }) {
  const submitReview = useFanecto((s) => s.submitReview);
  const dismissPrompt = useFanecto((s) => s.dismissPrompt);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  return (
    <Card className="p-5">
      <p className="font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">
        One review per completed interaction. Not shown on roommate listings.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className="min-h-10 min-w-10 rounded-lg px-1 text-sm"
            aria-label={`${n} stars`}
          >
            <Stars value={n <= rating ? n : 0} />
          </button>
        ))}
      </div>
      <Textarea
        className="mt-3"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What should the next person know?"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={() => submitReview(promptId, rating, text || "Completed without written notes.")}>
          Submit review
        </Button>
        <Button variant="ghost" onClick={() => dismissPrompt(promptId)}>
          Later
        </Button>
      </div>
    </Card>
  );
}
