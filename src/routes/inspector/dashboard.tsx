import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/fanecto/page-header";
import { Section, StatCard } from "@/components/fanecto/kit";
import { InspectionPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime, formatNaira, inspectionSplit } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";
import type { Payment } from "@/lib/fanecto/types";

export const Route = createFileRoute("/inspector/dashboard")({
  component: () => (
    <RoleGate allow={["inspector"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const user = useCurrentFanectoUser();
  const properties = useFanecto((s) => s.properties);
  const users = useFanecto((s) => s.users);
  const inspections = useFanecto((s) => s.inspections.filter((i) => i.inspectorId === user?.id));

  const newRequests = inspections.filter((i) =>
    ["awaiting_confirmation", "paid"].includes(i.status),
  );
  const awaitingAuth = inspections.filter((i) => i.status === "awaiting_property_authorization");
  const upcoming = inspections.filter((i) =>
    ["confirmed", "scheduled", "in_progress"].includes(i.status),
  );
  const completed = inspections.filter((i) =>
    ["completed", "report_ready", "settlement_pending", "settled"].includes(i.status),
  );
  const earnings = useFanecto((s) =>
    s.payments
      .filter(
        (p): p is Extract<Payment, { kind: "inspection" }> =>
          p.kind === "inspection" &&
          p.inspectorId === user?.id &&
          (p.status === "settled" || p.status === "settlement_pending" || p.status === "captured"),
      )
      .reduce((a, p) => a + p.inspectorShare, 0),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Inspector workspace"
        title={`Hello, ${user?.firstName}.`}
        description="Manage inspection requests, appointments and reports. Payout becomes eligible only after you submit the final report. Fanecto retains 20% of the inspection fee."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="New requests" value={newRequests.length} href="/inspector/inspections" />
        <StatCard label="Awaiting auth" value={awaitingAuth.length} href="/inspector/inspections" />
        <StatCard label="Upcoming" value={upcoming.length} href="/inspector/inspections" />
        <StatCard label="Completed" value={completed.length} href="/inspector/reports" />
        <StatCard label="Earnings (80%)" value={formatNaira(earnings)} href="/inspector/earnings" />
      </div>

      <Section
        title="New requests"
        action={
          <Link to="/inspector/inspections" className="text-sm font-medium text-primary">
            All jobs
          </Link>
        }
      >
        {newRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No new paid requests waiting for your response.</p>
        ) : (
          <ul className="space-y-3">
            {newRequests.slice(0, 4).map((i) => {
              const p = properties.find((x) => x.id === i.propertyId);
              const client = users.find((u) => u.id === i.seekerId);
              const split = inspectionSplit(i.fee);
              return (
                <Card key={i.id} className="p-4">
                  <div className="flex flex-wrap gap-4">
                    {p?.images[0] ? (
                      <img src={p.images[0]} alt="" className="size-20 shrink-0 rounded-xl object-cover" />
                    ) : (
                      <div className="size-20 shrink-0 rounded-xl bg-secondary" />
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{p?.title ?? "Property"}</p>
                        <InspectionPill status={i.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {p?.area}, {p?.city} · Requested by {client?.displayName ?? "Client"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {i.scheduledAt ? formatDateTime(i.scheduledAt) : "Time to confirm"}
                      </p>
                      <p className="text-sm tabular-nums">
                        Inspection {formatNaira(i.fee)} · Fanecto 20% {formatNaira(split.fanecto)} ·{" "}
                        <span className="font-medium">You {formatNaira(split.inspector)}</span>
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button asChild size="sm">
                          <Link to="/inspector/inspections/$id" params={{ id: i.id }}>
                            View request
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="Upcoming">
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No confirmed appointments yet.</p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((i) => {
              const p = properties.find((x) => x.id === i.propertyId);
              const client = users.find((u) => u.id === i.seekerId);
              const split = inspectionSplit(i.fee);
              return (
                <li key={i.id}>
                  <Link
                    to="/inspector/inspections/$id"
                    params={{ id: i.id }}
                    className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)] transition-colors hover:bg-secondary/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {client?.displayName} · {i.scheduledAt ? formatDateTime(i.scheduledAt) : "—"} · You{" "}
                        {formatNaira(split.inspector)}
                      </p>
                    </div>
                    <InspectionPill status={i.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </div>
  );
}
