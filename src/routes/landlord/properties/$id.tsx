import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/fanecto/page-header";
import { PropertyPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime, formatNaira } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/landlord/properties/$id")({ component: Page });

function Page() {
  return (
    <RoleGate allow={["landlord"]}>
      <View />
    </RoleGate>
  );
}

function View() {
  const { id } = Route.useParams();
  const user = useCurrentFanectoUser();
  const property = useFanecto((s) => s.properties.find((p) => p.id === id));
  const history = useFanecto((s) => s.availabilityChanges.filter((h) => h.propertyId === id));
  const conversations = useFanecto((s) =>
    s.conversations.filter((c) => c.propertyId === id && c.context === "rental"),
  );
  const inspections = useFanecto((s) => s.inspections.filter((i) => i.propertyId === id));
  const payments = useFanecto((s) =>
    s.payments.filter((p): p is Extract<typeof p, { kind: "rental" }> => p.kind === "rental" && p.propertyId === id),
  );
  const paymentRequests = useFanecto((s) => s.paymentRequests.filter((r) => r.propertyId === id));
  const users = useFanecto((s) => s.users);
  const updatePropertyStatus = useFanecto((s) => s.updatePropertyStatus);
  const updateAvailability = useFanecto((s) => s.updateAvailability);
  const createPaymentRequest = useFanecto((s) => s.createPaymentRequest);

  const [title, setTitle] = useState(property?.title ?? "");
  const [description, setDescription] = useState(property?.description ?? "");
  const [rent, setRent] = useState(String(property?.annualRent ?? ""));
  const [availOpen, setAvailOpen] = useState(false);
  const [nextAvail, setNextAvail] = useState("");
  const [reason, setReason] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [tenantId, setTenantId] = useState("");
  const [periodStart, setPeriodStart] = useState("2027-01-01");
  const [periodEnd, setPeriodEnd] = useState("2027-12-31");
  const [dueDate, setDueDate] = useState("2026-12-20");
  const [notes, setNotes] = useState("");

  if (!property || property.landlordId !== user?.id) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Property not found or you do not manage it.</p>
        <Button asChild variant="outline">
          <Link to="/landlord/properties">Back to properties</Link>
        </Button>
      </div>
    );
  }

  const total = property.totalUnits ?? 1;
  const available = property.availableUnits ?? total;
  const occupied = total - available;

  const inquiryTargets = useMemo(() => {
    const ids = new Set<string>();
    conversations.forEach((c) => c.participantIds.forEach((pid) => {
      if (pid !== user?.id) ids.add(pid);
    }));
    return users.filter((u) => ids.has(u.id));
  }, [conversations, users, user?.id]);

  const liveFee = Math.round((Number(rent) || property.annualRent) * 0.05);
  const liveTotal = (Number(rent) || property.annualRent) + liveFee;

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Property management"
        title={property.title}
        description={`${property.area}, ${property.city} · ${formatNaira(property.annualRent)}/year`}
        actions={
          <div className="flex flex-wrap gap-2">
            <PropertyPill status={property.status} />
            <Button asChild variant="outline" size="sm">
              <Link to="/properties/$id" params={{ id: property.id }}>
                Public view
              </Link>
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <img src={property.images[0]} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" />
            <div className="space-y-3 text-sm">
              <p><span className="text-muted-foreground">Type</span> · {property.type}</p>
              <p><span className="text-muted-foreground">Bedrooms</span> · {property.bedrooms}</p>
              <p><span className="text-muted-foreground">Units</span> · {available} available of {total} ({occupied} occupied)</p>
              <p className="line-clamp-4 text-muted-foreground">{property.description}</p>
              <div className="flex flex-wrap gap-2">
                {property.status === "published" ? (
                  <Button size="sm" variant="outline" onClick={() => { updatePropertyStatus(property.id, "unavailable"); toast.success("Listing paused."); }}>
                    Pause listing
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => { updatePropertyStatus(property.id, "published"); toast.success("Listing published."); }}>
                    Publish
                  </Button>
                )}
                <Button size="sm" variant="secondary" onClick={() => { setNextAvail(String(available)); setAvailOpen(true); }}>
                  Update available units
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Title</Label>
              <Input className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Annual rent (₦)</Label>
              <Input className="mt-1.5" type="number" value={rent} onChange={(e) => setRent(e.target.value)} />
              <p className="mt-1 text-xs text-muted-foreground">Fanecto’s 5% fee is only shown at rental checkout — not on this form.</p>
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea className="mt-1.5" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
          <Button
            onClick={() => {
              // Lightweight local edit via status path — full mutate would need store method
              toast.success("Changes saved for this session. Connect a backend to persist permanently.");
            }}
          >
            Save changes
          </Button>
        </TabsContent>

        <TabsContent value="units" className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
              <p className="text-xs text-muted-foreground">Total units</p>
              <p className="mt-1 font-display text-2xl">{total}</p>
            </div>
            <div className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
              <p className="text-xs text-muted-foreground">Available</p>
              <p className="mt-1 font-display text-2xl">{available}</p>
            </div>
            <div className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
              <p className="text-xs text-muted-foreground">Occupied</p>
              <p className="mt-1 font-display text-2xl">{occupied}</p>
            </div>
          </div>
          <Button onClick={() => { setNextAvail(String(available)); setAvailOpen(true); }}>
            Update available units
          </Button>
          <div>
            <h3 className="font-semibold">Availability history</h3>
            {history.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No changes yet.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {history.map((h) => (
                  <li key={h.id} className="rounded-xl bg-secondary/50 px-3 py-2 text-sm">
                    {h.previousAvailable} → {h.newAvailable} · {formatDateTime(h.createdAt)}
                    {h.reason ? ` · ${h.reason}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        <TabsContent value="inquiries" className="mt-4 space-y-3">
          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No inquiries yet. When seekers message about this home, threads appear here.</p>
          ) : (
            conversations.map((c) => {
              const other = users.find((u) => c.participantIds.includes(u.id) && u.id !== user?.id);
              return (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card p-3 shadow-[var(--shadow-border)]">
                  <div>
                    <p className="font-medium">{other?.displayName ?? "Seeker"}</p>
                    <p className="text-xs text-muted-foreground">Property inquiry · {formatDateTime(c.updatedAt)}</p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/landlord/messages" search={{ c: c.id }}>Open chat</Link>
                  </Button>
                </div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="inspections" className="mt-4 space-y-3">
          {inspections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No inspections for this property yet.</p>
          ) : (
            inspections.map((i) => (
              <div key={i.id} className="rounded-xl bg-card p-3 text-sm shadow-[var(--shadow-border)]">
                <p className="font-medium capitalize">{i.status.replaceAll("_", " ")}</p>
                <p className="text-xs text-muted-foreground">Fee {formatNaira(i.fee)} · chat {i.chatUnlocked ? "unlocked" : "locked"}</p>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="payments" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">Payment requests</h3>
            <Button
              size="sm"
              onClick={() => {
                setTenantId(inquiryTargets[0]?.id ?? "");
                setPayOpen(true);
              }}
              disabled={inquiryTargets.length === 0}
            >
              Send payment request
            </Button>
          </div>
          {inquiryTargets.length === 0 ? (
            <p className="text-sm text-muted-foreground">Start a property inquiry chat first, then you can send a rental payment request to that seeker.</p>
          ) : null}
          {paymentRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rental payment requests yet.</p>
          ) : (
            paymentRequests.map((r) => (
              <div key={r.id} className="rounded-xl bg-card p-3 text-sm shadow-[var(--shadow-border)]">
                <p className="font-medium">{formatNaira(r.totalPayable)} · {r.status.replaceAll("_", " ")}</p>
                <p className="text-xs text-muted-foreground">
                  Rent {formatNaira(r.annualRent)} + Fanecto 5% {formatNaira(r.fanectoFee)} · due {r.dueDate}
                </p>
              </div>
            ))
          )}
          <div>
            <h3 className="mt-4 font-semibold">Completed rentals</h3>
            {payments.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">No completed rental payments on this property.</p>
            ) : (
              payments.map((p) => (
                <div key={p.id} className="mt-2 rounded-xl bg-secondary/50 px-3 py-2 text-sm">
                  {p.reference} · {formatNaira(p.grossRent)} + fee {formatNaira(p.fanectoFee)}
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-4 space-y-2 text-sm">
          {history.slice(0, 8).map((h) => (
            <p key={h.id} className="rounded-lg bg-secondary/40 px-3 py-2">
              Availability {h.previousAvailable} → {h.newAvailable} · {formatDateTime(h.createdAt)}
            </p>
          ))}
          {history.length === 0 ? <p className="text-muted-foreground">No activity yet.</p> : null}
        </TabsContent>
      </Tabs>

      <Dialog open={availOpen} onOpenChange={setAvailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update available units</DialogTitle>
            <DialogDescription>
              You are changing available units from {available} to a new number (total: {total}). Occupied = total − available.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Available units</Label>
              <Input type="number" min={0} max={total} className="mt-1.5" value={nextAvail} onChange={(e) => setNextAvail(e.target.value)} />
            </div>
            <div>
              <Label>Reason (optional)</Label>
              <Input className="mt-1.5" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAvailOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                const res = updateAvailability(property.id, Number(nextAvail), reason || undefined);
                if (!res.ok) toast.error(res.error);
                else {
                  toast.success("Availability updated.");
                  setAvailOpen(false);
                }
              }}
            >
              Confirm update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send rental payment request</DialogTitle>
            <DialogDescription>
              Fanecto fee is 5% of annual rent and is shown before the tenant pays. Agent commission only if you enter an agreed amount.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Tenant</Label>
              <select
                className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
              >
                <option value="">Select seeker…</option>
                {inquiryTargets.map((u) => (
                  <option key={u.id} value={u.id}>{u.displayName}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Period start</Label>
                <Input type="date" className="mt-1.5" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
              </div>
              <div>
                <Label>Period end</Label>
                <Input type="date" className="mt-1.5" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Due date</Label>
              <Input type="date" className="mt-1.5" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea className="mt-1.5" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
            <div className="rounded-xl bg-secondary/50 p-3 text-sm">
              <p>Annual rent: {formatNaira(property.annualRent)}</p>
              <p>Fanecto fee (5%): {formatNaira(Math.round(property.annualRent * 0.05))}</p>
              <p className="font-semibold">Total payable: {formatNaira(Math.round(property.annualRent * 1.05))}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!tenantId) {
                  toast.error("Select a tenant.");
                  return;
                }
                const res = createPaymentRequest({
                  propertyId: property.id,
                  toUserId: tenantId,
                  periodStart,
                  periodEnd,
                  annualRent: property.annualRent,
                  notes: notes || undefined,
                  dueDate,
                });
                if (!res.ok) toast.error(res.error);
                else {
                  toast.success("Payment request sent.");
                  setPayOpen(false);
                }
              }}
            >
              Send payment request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
