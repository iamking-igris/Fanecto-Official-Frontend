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
import { useState } from "react";

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
  const notifications = useFanecto((s) => s.notifications.filter((n) => n.recipientId === user?.id).slice(0, 4));
  const prompts = useFanecto((s) =>
    s.reviewPrompts.filter((p) => p.reviewerId === user?.id && !s.dismissedPrompts.includes(p.id)),
  );
  const upcoming = inspections.find((i) => i.status === "scheduled" || i.status === "paid");
  const inspector = useFanecto((s) => s.users.find((u) => u.id === upcoming?.inspectorId));
  const roommates = useFanecto((s) =>
    user?.role === "student"
      ? s.roommateListings.filter(
          (l) => l.creatorId === user.id || s.roommateConnections.some((c) => c.seekerId === user.id && c.listingId === l.id),
        )
      : [],
  );

  return (
    <div className="space-y-8">
      <PageHeader
        kicker={user?.role === "student" ? "Student workspace" : "Seeker workspace"}
        title={`Hello, ${user?.firstName}.`}
        description="Find a home, request inspections, and manage payments from here — not the public marketing site."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/properties">Find a home</Link>
            </Button>
            {user?.role === "student" ? (
              <Button asChild variant="outline">
                <Link to="/roommates">Roommates</Link>
              </Button>
            ) : null}
          </div>
        }
      />

      {prompts.map((p) => (
        <ReviewCard key={p.id} promptId={p.id} title={p.title} />
      ))}

      {upcoming ? (
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Upcoming inspection</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">{inspector?.displayName}</p>
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

      <Section
        title="Saved homes"
        action={
          <Link to="/saved" className="text-sm text-primary">
            All saved
          </Link>
        }
      >
        {saved.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {saved.slice(0, 3).map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Save homes you want to come back to.</p>
        )}
      </Section>

      <Section
        title="Recommended"
        action={
          <Link to="/properties" className="text-sm text-primary">
            Browse
          </Link>
        }
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.slice(0, 3).map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </Section>

      {user?.role === "student" ? (
        <Section
          title="Roommates"
          action={
            <Link to="/roommates" className="text-sm text-primary">
              Open roommate marketplace
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
            <div className="rounded-xl bg-card px-4 py-5 text-sm shadow-[var(--shadow-border)]">
              <p className="text-muted-foreground">No roommate activity yet.</p>
              <Button asChild className="mt-3" variant="outline" size="sm">
                <Link to="/roommates">Browse roommate listings</Link>
              </Button>
            </div>
          )}
        </Section>
      ) : null}

      <Section title="Alerts">
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li key={n.id} className="rounded-xl bg-card px-4 py-3 text-sm shadow-[var(--shadow-border)]">
              <p className="font-medium">{n.title}</p>
              <p className="text-muted-foreground">{n.body}</p>
            </li>
          ))}
        </ul>
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
          <button key={n} type="button" onClick={() => setRating(n)} className="text-sm">
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
