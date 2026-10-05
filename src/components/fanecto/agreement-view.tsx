import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AgreementCompose } from "@/components/fanecto/agreement-compose";
import { AgreementPill } from "@/components/fanecto/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateTime } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";

export function AgreementList({ role }: { role: "landlord" | "agent" | "admin" }) {
  const user = useCurrentFanectoUser();
  const agreements = useFanecto((s) =>
    s.agreements.filter((a) => {
      if (role === "admin") return true;
      if (role === "landlord") return a.landlordId === user?.id;
      return a.agentId === user?.id;
    }),
  );
  const users = useFanecto((s) => s.users);
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-3xl">Agreements</h1>
        {role !== "admin" ? <AgreementCompose role={role} /> : null}
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Both parties must accept before an agreement becomes active. Fanecto records the terms; this frontend does not
        settle commission.
      </p>
      {agreements.length === 0 ? (
        <p className="text-sm text-muted-foreground">No agreements yet. Draft terms when both sides are ready.</p>
      ) : (
      <ul className="space-y-3">
        {agreements.map((a) => {
          const landlord = users.find((u) => u.id === a.landlordId);
          const agent = users.find((u) => u.id === a.agentId);
          return (
            <li key={a.id}>
              <AgreementLink role={role} id={a.id}>
                <div>
                  <p className="font-medium">
                    {landlord?.displayName} · {agent?.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {a.commissionValue}
                    {a.commissionType === "percent" ? "%" : " ₦"} · v{a.version}
                  </p>
                </div>
                <AgreementPill status={a.status} />
              </AgreementLink>
            </li>
          );
        })}
      </ul>
      )}
    </div>
  );
}

function AgreementLink({
  role,
  id,
  children,
}: {
  role: "landlord" | "agent" | "admin";
  id: string;
  children: React.ReactNode;
}) {
  const className = "flex items-center justify-between rounded-xl bg-card p-4 shadow-[var(--shadow-border)]";
  if (role === "landlord") {
    return (
      <Link to="/landlord/agreements/$id" params={{ id }} className={className}>
        {children}
      </Link>
    );
  }
  if (role === "agent") {
    return (
      <Link to="/agent/agreements/$id" params={{ id }} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <Link to="/admin/agreements/$id" params={{ id }} className={className}>
      {children}
    </Link>
  );
}

export function AgreementDetail({ id, role }: { id: string; role: "landlord" | "agent" | "admin" }) {
  const agreement = useFanecto((s) => s.agreements.find((a) => a.id === id));
  const users = useFanecto((s) => s.users);
  const properties = useFanecto((s) => s.properties);
  const user = useCurrentFanectoUser();
  const acceptAgreement = useFanecto((s) => s.acceptAgreement);
  const rejectAgreement = useFanecto((s) => s.rejectAgreement);
  const endAgreement = useFanecto((s) => s.endAgreement);
  const proposeAgreementChange = useFanecto((s) => s.proposeAgreementChange);
  const [counter, setCounter] = useState("");
  if (!agreement) return <p>Agreement not found.</p>;
  const landlord = users.find((u) => u.id === agreement.landlordId);
  const agent = users.find((u) => u.id === agreement.agentId);
  const covered = properties.filter((p) => agreement.propertyIds.includes(p.id));
  const canAct =
    user &&
    (user.id === agreement.landlordId || user.id === agreement.agentId) &&
    agreement.status !== "ended" &&
    agreement.status !== "rejected";

  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl">Commission agreement</h1>
        <AgreementPill status={agreement.status} />
      </div>
      <p className="text-sm">
        {landlord?.displayName} and {agent?.displayName}
      </p>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">Commission</dt>
          <dd>
            {agreement.commissionValue}
            {agreement.commissionType === "percent" ? "%" : ""} · {agreement.paymentBasis}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Timing</dt>
          <dd>{agreement.paymentTiming}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-muted-foreground">Properties</dt>
          <dd>{covered.map((p) => p.title).join("; ") || "None linked"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-muted-foreground">Responsibilities</dt>
          <dd>{agreement.responsibilities}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-muted-foreground">Additional terms</dt>
          <dd>{agreement.additionalTerms}</dd>
        </div>
      </dl>
      <p className="text-xs text-muted-foreground">
        Landlord accepted: {agreement.landlordAccepted ? "yes" : "no"} · Agent accepted:{" "}
        {agreement.agentAccepted ? "yes" : "no"} · Version {agreement.version}
      </p>
      {canAct ? (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              acceptAgreement(agreement.id, user.id);
              toast.success("Acceptance recorded.");
            }}
          >
            Accept
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              rejectAgreement(agreement.id, user.id, "Declined on demo");
            }}
          >
            Reject
          </Button>
          <Button variant="ghost" onClick={() => endAgreement(agreement.id, user.id)}>
            End
          </Button>
        </div>
      ) : null}
      {canAct ? (
        <div className="space-y-2 rounded-xl bg-secondary p-4">
          <Label htmlFor="counter">Propose a different commission %</Label>
          <div className="flex gap-2">
            <Input
              id="counter"
              value={counter}
              onChange={(e) => setCounter(e.target.value)}
              placeholder={String(agreement.commissionValue)}
            />
            <Button
              variant="outline"
              onClick={() => {
                const n = Number(counter);
                if (!n) return;
                proposeAgreementChange(
                  agreement.id,
                  user.id,
                  `Proposed ${n}% (was ${agreement.commissionValue}%)`,
                  n,
                );
                toast.message("Change proposed. The other party must accept again.");
                setCounter("");
              }}
            >
              Propose
            </Button>
          </div>
        </div>
      ) : null}
      {role === "admin" ? (
        <p className="text-xs text-muted-foreground">Admin view — actions are audited when used from operations tools.</p>
      ) : null}
      <h2 className="font-medium">History</h2>
      <ol className="space-y-2 text-sm">
        {agreement.history.map((h, i) => (
          <li key={i} className="text-muted-foreground">
            {formatDateTime(h.at)} · {users.find((u) => u.id === h.actorId)?.displayName} · {h.action}
            {h.note ? ` — ${h.note}` : ""}
          </li>
        ))}
      </ol>
    </Card>
  );
}
