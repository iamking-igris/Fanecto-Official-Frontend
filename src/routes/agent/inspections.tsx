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

export const Route = createFileRoute("/agent/inspections")({
  component: () => (
    <RoleGate allow={["agent"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const user = useCurrentFanectoUser();
  // Only properties this agent manages
  const properties = useFanecto((s) => s.properties.filter((p) => p.agentId === user?.id));
  const propertyIds = new Set(properties.map((p) => p.id));
  const inspections = useFanecto((s) => s.inspections.filter((i) => propertyIds.has(i.propertyId)));
  const users = useFanecto((s) => s.users);
  const approve = useFanecto((s) => s.approvePropertyAccess);
  const decline = useFanecto((s) => s.declinePropertyAccess);
  const suggestTime = useFanecto((s) => s.suggestInspectionTime);

  const [declineId, setDeclineId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pendingAuth = inspections.filter(
    (i) =>
      i.status === "awaiting_property_authorization" &&
      i.propertyAuthorizationStatus === "pending",
  );
  const others = inspections.filter((i) => !pendingAuth.some((p) => p.id === i.id));
  const selected = inspections.find((i) => i.id === selectedId);

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Managed listings"
        title="Inspections"
        description="Authorize inspector access on homes you manage. Approving does not hire the inspector — it only allows the scheduled visit on that listing."
      />

      <section className="space-y-3">
        <h2 className="font-display text-lg font-medium">Access requests</h2>
        {pendingAuth.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No pending access requests on your managed listings.
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
                      {inspector?.rating != null ? (
                        <p className="text-xs text-muted-foreground">★ {inspector.rating}</p>
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
                    You are the authorized agent on this listing. Approving authorizes this inspector for this
                    appointment only.
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
        {inspections.length === 0 ? (
          <EmptyState
            title="No inspections on your listings"
            body="When a seeker books a visit on a home you manage, it appears here."
          />
        ) : others.length === 0 ? (
          <p className="text-sm text-muted-foreground">No other inspections.</p>
        ) : (
          <ul className="space-y-2">
            {others.map((i) => {
              const p = properties.find((x) => x.id === i.propertyId);
              const inspector = users.find((u) => u.id === i.inspectorId);
              return (
                <li key={i.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(i.id === selectedId ? null : i.id)}
                    className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 text-left shadow-[var(--shadow-border)] transition-colors hover:bg-secondary/40"
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
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {selected ? (
          <Card className="space-y-2 p-4 text-sm">
            <p className="font-medium">
              {properties.find((p) => p.id === selected.propertyId)?.title}
            </p>
            <p className="text-muted-foreground">
              Status: {selected.status}
              {selected.propertyAuthorizationStatus
                ? ` · Auth: ${selected.propertyAuthorizationStatus}`
                : ""}
            </p>
            <Button asChild size="sm" variant="outline">
              <Link
                to="/properties/$id"
                params={{ id: selected.propertyId }}
              >
                View property
              </Link>
            </Button>
          </Card>
        ) : null}
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
