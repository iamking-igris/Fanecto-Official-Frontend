import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/fanecto/empty-state";
import { PageHeader } from "@/components/fanecto/page-header";
import { InspectionPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime, formatNaira } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/landlord/inspections")({ component: Page });

function Page() {
  return (
    <RoleGate allow={["landlord", "agent"]}>
      <View />
    </RoleGate>
  );
}

function View() {
  const user = useCurrentFanectoUser();
  const properties = useFanecto((s) =>
    s.properties.filter((p) =>
      user?.role === "agent" ? p.agentId === user.id : p.landlordId === user?.id,
    ),
  );
  const propertyIds = new Set(properties.map((p) => p.id));
  const inspections = useFanecto((s) => s.inspections.filter((i) => propertyIds.has(i.propertyId)));
  const users = useFanecto((s) => s.users);
  const approve = useFanecto((s) => s.approvePropertyAccess);
  const decline = useFanecto((s) => s.declinePropertyAccess);
  const suggestTime = useFanecto((s) => s.suggestInspectionTime);

  const [declineId, setDeclineId] = useState<string | null>(null);

  const pendingAuth = inspections.filter(
    (i) => i.status === "awaiting_property_authorization" && i.propertyAuthorizationStatus === "pending",
  );
  const others = inspections.filter((i) => !pendingAuth.some((p) => p.id === i.id));

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Property access"
        title="Inspection requests"
        description="When an inspector accepts a job on your listing, you authorize access for that visit only. This is not a hire decision and is not a legal title check."
      />

      <section className="space-y-3">
        <h2 className="font-display text-lg font-medium">Access requests</h2>
        {pendingAuth.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No pending access requests. When an inspector accepts a paid inspection on your property, it appears
            here for approval.
          </p>
        ) : (
          <ul className="space-y-3">
            {pendingAuth.map((i) => {
              const p = properties.find((x) => x.id === i.propertyId);
              const inspector = users.find((u) => u.id === i.inspectorId);
              const client = users.find((u) => u.id === i.seekerId);
              return (
                <Card key={i.id} className="space-y-3 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                        Inspection access requested
                      </p>
                      <p className="mt-1 font-medium">{p?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {p?.area}, {p?.city}
                      </p>
                    </div>
                    <InspectionPill status={i.status} />
                  </div>
                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Inspector</p>
                      <p className="font-medium">{inspector?.displayName}</p>
                      {inspector?.rating ? (
                        <p className="text-xs text-muted-foreground">{inspector.rating} rating</p>
                      ) : null}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Requested</p>
                      <p className="font-medium">
                        {i.scheduledAt ? formatDateTime(i.scheduledAt) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Client</p>
                      <p className="font-medium">{client?.displayName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Inspection fee (client pays)</p>
                      <p className="font-medium tabular-nums">{formatNaira(i.fee)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Approving authorizes this inspector to access the property for this appointment only. You are
                    not hiring the inspector through Fanecto.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        approve(i.id);
                        toast.success("Access approved — inspection confirmed");
                      }}
                    >
                      Approve access
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setDeclineId(i.id)}>
                      Decline access
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const next = new Date();
                        next.setDate(next.getDate() + 2);
                        next.setHours(14, 0, 0, 0);
                        suggestTime(i.id, next.toISOString());
                        toast.success("Suggested another time — waiting for confirmation");
                      }}
                    >
                      Suggest another time
                    </Button>
                    {p ? (
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/properties/$id" params={{ id: p.id }}>
                          View property
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-medium">All inspections on your listings</h2>
        {others.length === 0 && pendingAuth.length === 0 ? (
          <EmptyState
            title="No inspections yet"
            body="When a seeker books an inspection on your home, it will list here."
          />
        ) : others.length === 0 ? (
          <p className="text-sm text-muted-foreground">No other inspections.</p>
        ) : (
          <ul className="space-y-2">
            {others.map((i) => {
              const p = properties.find((x) => x.id === i.propertyId);
              const inspector = users.find((u) => u.id === i.inspectorId);
              return (
                <li
                  key={i.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {inspector?.displayName} ·{" "}
                      {i.scheduledAt ? formatDateTime(i.scheduledAt) : "—"}
                      {i.propertyAuthorizationStatus === "approved" ? " · Access authorized" : ""}
                    </p>
                  </div>
                  <InspectionPill status={i.status} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Dialog open={!!declineId} onOpenChange={(o) => !o && setDeclineId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline inspection access?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            The inspector will not be authorized to access this property for this inspection. The client will be
            notified that the inspection cannot proceed.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclineId(null)}>
              Keep request
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (declineId) {
                  decline(declineId);
                  toast.success("Access declined");
                  setDeclineId(null);
                }
              }}
            >
              Decline access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
