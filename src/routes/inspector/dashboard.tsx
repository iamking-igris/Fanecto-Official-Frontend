import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/fanecto/page-header";
import { Section, StatCard } from "@/components/fanecto/kit";
import { InspectionPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { formatNaira } from "@/lib/fanecto/format";
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
  const inspections = useFanecto((s) => s.inspections.filter((i) => i.inspectorId === user?.id));
  const upcoming = inspections.filter((i) => ["paid", "scheduled", "in_progress"].includes(i.status));
  const done = inspections.filter((i) =>
    ["completed", "report_ready", "settled", "settlement_pending"].includes(i.status),
  );
  const earnings = useFanecto((s) =>
    s.payments
      .filter(
        (p): p is Extract<Payment, { kind: "inspection" }> =>
          p.kind === "inspection" &&
          p.inspectorId === user?.id &&
          (p.status === "settled" || p.status === "settlement_pending"),
      )
      .reduce((a, p) => a + p.inspectorShare, 0),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Inspector"
        title={`Hello, ${user?.firstName}.`}
        description="Payment unlocks chat. After the visit you file a physical-observation report — not a title search. Settlement is 80% to you, 20% Fanecto."
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Upcoming" value={upcoming.length} href="/inspector/inspections" />
        <StatCard label="Completed" value={done.length} href="/inspector/reports" />
        <StatCard label="Your 80% share" value={formatNaira(earnings)} href="/inspector/earnings" />
      </div>
      <Section title="Jobs">
        <ul className="space-y-2">
          {inspections.map((i) => {
            const p = properties.find((x) => x.id === i.propertyId);
            return (
              <li key={i.id}>
                <Link
                  to="/inspector/inspections/$id"
                  params={{ id: i.id }}
                  className="surface lift flex items-center justify-between gap-3 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p?.title ?? i.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNaira(i.fee)} · chat {i.chatUnlocked ? "unlocked" : "locked"}
                    </p>
                  </div>
                  <InspectionPill status={i.status} />
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
}
