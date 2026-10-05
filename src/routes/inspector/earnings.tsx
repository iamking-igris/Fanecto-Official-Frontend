import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/fanecto/empty-state";
import { PageHeader } from "@/components/fanecto/page-header";
import { StatCard } from "@/components/fanecto/kit";
import { PaymentPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { formatDate, formatNaira } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";
import type { Payment } from "@/lib/fanecto/types";

export const Route = createFileRoute("/inspector/earnings")({
  component: () => (
    <RoleGate allow={["inspector"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const user = useCurrentFanectoUser();
  const payments = useFanecto((s) =>
    s.payments.filter(
      (p): p is Extract<Payment, { kind: "inspection" }> => p.kind === "inspection" && p.inspectorId === user?.id,
    ),
  );
  const share = payments
    .filter((p) => p.status === "settled" || p.status === "settlement_pending")
    .reduce((a, p) => a + p.inspectorShare, 0);
  const platform = payments.reduce((a, p) => a + p.fanectoShare, 0);
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Money"
        title="Earnings"
        description="80% of the inspection fee after completion. 20% Fanecto. Not described as legal escrow."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Your 80% share" value={formatNaira(share)} />
        <StatCard label="Fanecto 20%" value={formatNaira(platform)} />
      </div>
      {payments.length === 0 ? (
        <EmptyState title="No inspection payments yet." body="When a seeker pays for a visit, the split will list here." />
      ) : (
        <ul className="space-y-3">
          {payments.map((p) => (
            <li key={p.id} className="surface flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium">{p.reference}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(p.createdAt)} · your share {formatNaira(p.inspectorShare)}
                </p>
              </div>
              <PaymentPill status={p.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
