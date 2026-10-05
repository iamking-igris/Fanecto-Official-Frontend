import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { EmptyState } from "@/components/fanecto/empty-state";
import { PageHeader } from "@/components/fanecto/page-header";
import { PaymentPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { formatDate, formatNaira } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/payments")({ component: PaymentsRoute });

function PaymentsRoute() {
  return (
    <RoleGate allow={["student", "seeker"]}>
      <PaymentsPage />
    </RoleGate>
  );
}

function PaymentsPage() {
  const user = useCurrentFanectoUser();
  const payments = useFanecto((s) => s.payments.filter((p) => "payerId" in p && p.payerId === user?.id));
  const requests = useFanecto((s) => s.paymentRequests.filter((r) => r.toUserId === user?.id));
  const properties = useFanecto((s) => s.properties);
  const payPaymentRequest = useFanecto((s) => s.payPaymentRequest);

  const openRequests = requests.filter((r) => r.status === "awaiting_payment");

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Payments"
        title="Payments"
        description="Review rental payment requests, inspections and completed captures. The 5% Fanecto fee is only applied when rent is paid through Fanecto."
      />

      <section className="space-y-3">
        <h2 className="font-display text-xl font-medium">Payment requests</h2>
        {openRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            When a landlord or agent sends you a rental payment request, it appears here with the full fee breakdown.
          </p>
        ) : (
          <ul className="space-y-3">
            {openRequests.map((r) => {
              const prop = properties.find((p) => p.id === r.propertyId);
              return (
                <li key={r.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                        Rental payment request
                      </p>
                      <p className="mt-1 font-medium">{prop?.title ?? "Property"}</p>
                      <p className="text-sm text-muted-foreground">
                        {prop?.area} · {r.periodStart} → {r.periodEnd}
                      </p>
                      <dl className="mt-3 space-y-1 text-sm">
                        <div className="flex justify-between gap-4">
                          <dt className="text-muted-foreground">Annual rent</dt>
                          <dd className="tabular-nums">{formatNaira(r.annualRent)}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-muted-foreground">Fanecto fee (5%)</dt>
                          <dd className="tabular-nums">{formatNaira(r.fanectoFee)}</dd>
                        </div>
                        {r.agentCommission ? (
                          <div className="flex justify-between gap-4">
                            <dt className="text-muted-foreground">Agreed agent commission</dt>
                            <dd className="tabular-nums">{formatNaira(r.agentCommission)}</dd>
                          </div>
                        ) : null}
                        <div className="flex justify-between gap-4 border-t border-border pt-1 font-semibold">
                          <dt>Total payable</dt>
                          <dd className="tabular-nums">{formatNaira(r.totalPayable)}</dd>
                        </div>
                      </dl>
                      <p className="mt-2 text-xs text-muted-foreground">Due {r.dueDate}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {prop ? (
                        <Button asChild size="sm" variant="outline">
                          <Link to="/properties/$id" params={{ id: prop.id }}>
                            View property
                          </Link>
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        onClick={() => {
                          const res = payPaymentRequest(r.id);
                          if (!res.ok) toast.error(res.error);
                          else toast.success("Payment successful. Receipt is in your history below.");
                        }}
                      >
                        Review & pay {formatNaira(r.totalPayable)}
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-medium">Transaction history</h2>
        {payments.length === 0 ? (
          <EmptyState
            title="No payments yet"
            body="Book an inspection, connect with a roommate, or pay a rental request through Fanecto."
            action={
              <Button asChild>
                <Link to="/properties">Find a home</Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-border)]">
            {payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium capitalize">{p.kind} payment</p>
                  <p className="text-xs text-muted-foreground">
                    {p.reference} · {formatDate(p.createdAt)}
                    {p.kind === "rental" ? ` · fee ${formatNaira(p.fanectoFee)}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="tabular-nums text-sm font-semibold">
                    {formatNaira(p.kind === "rental" ? p.grossRent + p.fanectoFee : p.amount)}
                  </p>
                  <PaymentPill status={p.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
