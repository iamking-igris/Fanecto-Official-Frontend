import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/fanecto/empty-state";
import { PageHeader } from "@/components/fanecto/page-header";
import { StatCard } from "@/components/fanecto/kit";
import { PaymentPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { formatDate, formatNaira } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";
import type { Payment } from "@/lib/fanecto/types";

export const Route = createFileRoute("/landlord/payments")({
  component: () => (
    <RoleGate allow={["landlord"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const user = useCurrentFanectoUser();
  const payments = useFanecto((s) =>
    s.payments.filter((p): p is Extract<Payment, { kind: "rental" }> => p.kind === "rental" && p.landlordId === user?.id),
  );
  const gross = payments.reduce((a, p) => a + p.grossRent, 0);
  const fees = payments.reduce((a, p) => a + p.fanectoFee, 0);
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Money"
        title="Payments"
        description="Rent paid through Fanecto includes a 5% platform fee, itemised before capture. Not described as legal escrow."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Gross rent captured" value={formatNaira(gross)} />
        <StatCard label="Fanecto 5%" value={formatNaira(fees)} />
      </div>
      {payments.length === 0 ? (
        <EmptyState title="No rent captured yet." body="When a seeker pays through Fanecto, the split will list here." />
      ) : (
        <ul className="space-y-3">
          {payments.map((p) => (
            <li key={p.id} className="surface flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium">{p.reference}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(p.createdAt)} · Rent {formatNaira(p.grossRent)} · fee {formatNaira(p.fanectoFee)}
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
