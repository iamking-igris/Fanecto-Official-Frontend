import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/fanecto/empty-state";
import { PageHeader } from "@/components/fanecto/page-header";
import { PropertyPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime, formatNaira } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/landlord/properties/")({ component: Page });

function Page() {
  return (
    <RoleGate allow={["landlord"]}>
      <View />
    </RoleGate>
  );
}

function View() {
  const user = useCurrentFanectoUser();
  const rows = useFanecto((s) => s.properties.filter((p) => p.landlordId === user?.id));
  const history = useFanecto((s) => s.availabilityChanges);
  const users = useFanecto((s) => s.users);
  const updatePropertyStatus = useFanecto((s) => s.updatePropertyStatus);
  const updateAvailability = useFanecto((s) => s.updateAvailability);

  const [editId, setEditId] = useState<string | null>(null);
  const [nextAvail, setNextAvail] = useState("");
  const [reason, setReason] = useState("");

  const editing = rows.find((p) => p.id === editId);
  const total = editing ? editing.totalUnits ?? 1 : 1;
  const prev = editing ? editing.availableUnits ?? total : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Inventory"
        title="Properties"
        description="List directly. Agents are optional. Update unit availability anytime — changes are logged."
        actions={
          <Button asChild>
            <Link to="/landlord/properties/new">New listing</Link>
          </Button>
        }
      />
      {rows.length === 0 ? (
        <EmptyState
          title="No properties yet."
          body="Add a home. You can list it yourself or authorise a verified agent later."
          action={
            <Button asChild>
              <Link to="/landlord/properties/new">List a property</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {rows.map((p) => {
            const t = p.totalUnits ?? 1;
            const a = p.availableUnits ?? t;
            const o = t - a;
            return (
              <li key={p.id} className="surface space-y-3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <img src={p.images[0]} alt="" className="hidden size-14 rounded-lg object-cover sm:block" />
                    <div className="min-w-0">
                      <Link to="/landlord/properties/$id" params={{ id: p.id }} className="font-medium hover:text-primary">
                        {p.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {p.area} · {formatNaira(p.annualRent)}
                        {p.agentId ? " · agent-assisted" : " · listed directly"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <PropertyPill status={p.status} />
                    {p.status === "published" ? (
                      <Button size="sm" variant="outline" onClick={() => updatePropertyStatus(p.id, "unavailable")}>
                        Mark unavailable
                      </Button>
                    ) : p.status === "unavailable" || p.status === "draft" ? (
                      <Button size="sm" variant="outline" onClick={() => updatePropertyStatus(p.id, "published")}>
                        Publish
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditId(p.id);
                        setNextAvail(String(a));
                        setReason("");
                      }}
                    >
                      Update units
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>
                    Total <strong className="text-foreground">{t}</strong>
                  </span>
                  <span>
                    Available <strong className="text-foreground">{a}</strong>
                  </span>
                  <span>
                    Occupied <strong className="text-foreground">{o}</strong>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-xl font-medium">Availability history</h2>
        {history.filter((h) => rows.some((r) => r.id === h.propertyId)).length === 0 ? (
          <p className="text-sm text-muted-foreground">No availability changes yet. Updates appear here after you confirm.</p>
        ) : (
          <ul className="space-y-2">
            {history
              .filter((h) => rows.some((r) => r.id === h.propertyId))
              .slice(0, 12)
              .map((h) => {
                const prop = rows.find((r) => r.id === h.propertyId);
                const actor = users.find((u) => u.id === h.actorId);
                const delta = h.newAvailable - h.previousAvailable;
                return (
                  <li key={h.id} className="rounded-xl bg-card px-4 py-3 text-sm shadow-[var(--shadow-border)]">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-medium">{prop?.title ?? h.propertyId}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(h.createdAt)}</p>
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      {actor?.displayName ?? "Someone"} · {h.previousAvailable} → {h.newAvailable}{" "}
                      <span className="tabular-nums">
                        ({delta > 0 ? `+${delta}` : delta} units)
                      </span>
                      {h.reason ? ` · ${h.reason}` : ""}
                    </p>
                  </li>
                );
              })}
          </ul>
        )}
      </section>

      <Dialog open={Boolean(editId)} onOpenChange={(o) => !o && setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update availability</DialogTitle>
            <DialogDescription>
              {editing
                ? `You're changing available units on “${editing.title}” from ${prev} to a new number (total units: ${total}).`
                : "Update available units."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="avail">Available units</Label>
              <Input
                id="avail"
                type="number"
                min={0}
                max={total}
                className="mt-1.5"
                value={nextAvail}
                onChange={(e) => setNextAvail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason (optional)</Label>
              <Input
                id="reason"
                className="mt-1.5"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Unit 3 rented off-platform"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Occupied will show as {total - Math.max(0, Math.min(total, Number(nextAvail) || 0))}.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!editId) return;
                const res = updateAvailability(editId, Number(nextAvail), reason || undefined);
                if (!res.ok) toast.error(res.error);
                else {
                  toast.success("Availability updated.");
                  setEditId(null);
                }
              }}
            >
              Confirm update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
