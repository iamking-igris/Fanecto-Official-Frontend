import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/fanecto/empty-state";
import { PageHeader } from "@/components/fanecto/page-header";
import { PaymentPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { formatDate, formatNaira } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";
import type { Payment } from "@/lib/fanecto/types";

export const Route = createFileRoute("/agent/payments")({
  component: () => (
    <RoleGate allow={["agent"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const user = useCurrentFanectoUser();
  const payments = useFanecto((s) =>
    s.payments.filter((p): p is Extract<Payment, { kind: "rental" }> => p.kind === "rental" && p.agentId === user?.id),
  );
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Money"
        title="Payments & earnings"
        description="Commission is recorded in agreements. This view does not invent a Fanecto commission payout. Agent subscriptions are not part of the product."
      />
      {payments.length === 0 ? (
        <EmptyState
          title="No rental captures on your listings yet."
          body="When rent is paid through Fanecto on a home you manage, it will list here."
        />
      ) : (
        <ul className="space-y-3">
          {payments.map((p) => (
            <li key={p.id} className="surface flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium">{p.reference}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(p.createdAt)} · rent {formatNaira(p.grossRent)} · 5% {formatNaira(p.fanectoFee)}
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
