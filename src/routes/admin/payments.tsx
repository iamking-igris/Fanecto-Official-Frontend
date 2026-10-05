import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/fanecto/page-header";
import { PaymentPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/fanecto/format";
import { useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/admin/payments")({
  component: () => (
    <RoleGate allow={["admin"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const payments = useFanecto((s) => s.payments);
  const settlePayment = useFanecto((s) => s.settlePayment);
  return (
    <div className="space-y-6">
      <PageHeader
        invert
        kicker="Money"
        title="Payments"
        description="Mock captures only. Settlement pending means funds are staged — 20/80 on inspections, 5% on rent — not legal escrow."
      />
      <ul className="space-y-2">
        {payments.map((p) => (
          <li
            key={p.id}
            className="surface-ops flex flex-wrap items-center justify-between gap-3 p-4 text-sm"
          >
            <div className="min-w-0">
              <p className="font-medium capitalize">
                {p.kind} · {p.reference}
              </p>
              <p className="text-xs text-ops-foreground/50">
                {p.kind === "rental"
                  ? `${formatNaira(p.grossRent)} + fee ${formatNaira(p.fanectoFee)}`
                  : formatNaira(p.amount)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <PaymentPill status={p.status} />
              {p.status === "settlement_pending" ? (
                <Button size="sm" variant="outline" onClick={() => settlePayment(p.id)}>
                  Mark settled
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
