import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Flag, Heart, MessageSquare, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FanectoVerifiedBadge, IdentityVerifiedBadge, InspectedBadge } from "@/components/fanecto/badges";
import { MockPay } from "@/components/fanecto/mock-pay";
import { Stars } from "@/components/fanecto/stars";
import { SmartShell } from "@/components/layout/smart-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ROLE_HOME } from "@/lib/fanecto/constants";
import {
  bedsLabel,
  formatDate,
  formatNaira,
  inspectionSplit,
  propertyTypeLabel,
  rentalFee,
  rentalTotal,
} from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";
import { INSPECTION_DISCLAIMER } from "@/lib/fanecto/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/properties/$id")({ component: PropertyDetailPage });

function PropertyDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const property = useFanecto((s) => s.properties.find((p) => p.id === id));
  const landlord = useFanecto((s) => s.users.find((u) => u.id === property?.landlordId));
  const agent = useFanecto((s) => s.users.find((u) => u.id === property?.agentId));
  const provider = agent ?? landlord;
  const reviews = useFanecto((s) => s.reviews.filter((r) => r.targetUserId === provider?.id && r.status === "visible"));
  const inspectors = useFanecto((s) =>
    s.users.filter(
      (u) =>
        u.role === "inspector" &&
        u.accountStatus === "active" &&
        u.verificationStatus === "verified" &&
        (!u.serviceAreas || u.serviceAreas.includes(property?.area ?? "") || u.city === property?.city),
    ),
  );
  const fallbackInspectors = useFanecto((s) => s.users.filter((u) => u.role === "inspector" && u.verificationStatus === "verified"));
  const list = inspectors.length ? inspectors : fallbackInspectors;
  const saved = useFanecto((s) => s.savedIds.includes(id));
  const toggleSave = useFanecto((s) => s.toggleSave);
  const user = useCurrentFanectoUser();
  const startRentalConversation = useFanecto((s) => s.startRentalConversation);
  const bookAndPayInspection = useFanecto((s) => s.bookAndPayInspection);
  const payRent = useFanecto((s) => s.payRent);
  const fileReport = useFanecto((s) => s.fileReport);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [inspectOpen, setInspectOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [inspectorId, setInspectorId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");

  if (!property) {
    return (
      <SmartShell allow={["student", "seeker"]}>
        <div className="mx-auto max-w-lg px-4 py-20">
          <h1 className="font-display text-3xl">Listing not found</h1>
          <Button asChild className="mt-4">
            <Link to="/properties">Back to homes</Link>
          </Button>
        </div>
      </SmartShell>
    );
  }

  const available = property.status === "published";
  const selectedInspector = list.find((i) => i.id === inspectorId);

  function requireSeeker(action: () => void) {
    if (!user) {
      toast.message("Sign in as a student or apartment seeker to continue.");
      void navigate({ to: "/login" });
      return;
    }
    if (user.role !== "student" && user.role !== "seeker") {
      toast.message("Switch to a student or seeker persona for this journey.");
      return;
    }
    action();
  }

  return (
    <SmartShell allow={["student", "seeker"]}>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Link to="/properties" className="text-sm text-muted-foreground hover:text-foreground">
          ← All homes
        </Link>

        <div className="mt-4 lg:hidden">
          <button type="button" onClick={() => setLightbox(true)} className="block w-full overflow-hidden rounded-3xl">
            <img
              src={property.images[active] ?? property.images[0]}
              alt=""
              className="media h-64 w-full object-cover sm:h-80"
            />
          </button>
          {property.images.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {property.images.map((src, i) => (
                <button key={src} type="button" onClick={() => setActive(i)} className="shrink-0">
                  <img
                    src={src}
                    alt=""
                    className={cn(
                      "media size-16 rounded-lg object-cover transition-opacity duration-150",
                      i === active ? "ring-2 ring-primary" : "opacity-70",
                    )}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="mt-4 hidden grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl lg:grid">
          {property.images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => {
                setActive(i);
                setLightbox(true);
              }}
              className={cn("relative min-h-28 overflow-hidden", i === 0 ? "col-span-2 row-span-2 min-h-80" : "")}
            >
              <img
                src={src}
                alt=""
                className="media h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-[1.03]"
              />
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div>
            <div className="flex flex-wrap gap-2">
              <InspectedBadge inspected={property.inspected} />
              {!available ? (
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium">
                  {property.status === "rented" ? "Rented" : "Unavailable"}
                </span>
              ) : null}
            </div>
            <h1 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">{property.title}</h1>
            <p className="mt-2 text-muted-foreground">
              {property.area}, {property.city} · {propertyTypeLabel(property.type)} · {bedsLabel(property.bedrooms)} ·{" "}
              {property.bathrooms} bath
            </p>
            <p className="mt-4 text-3xl font-semibold tabular-nums">
              {formatNaira(property.annualRent)}
              <span className="ml-2 text-sm font-normal text-muted-foreground">per year</span>
            </p>
            {property.serviceCharge ? (
              <p className="text-sm text-muted-foreground">Service charge {formatNaira(property.serviceCharge)} / year</p>
            ) : null}

            <div className="mt-8 space-y-3 text-[15px] leading-relaxed text-foreground/90">
              {property.description.split("\n").map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            <h2 className="mt-10 font-display text-2xl">Amenities</h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              {property.amenities.map((a) => (
                <li key={a} className="rounded-lg bg-card px-3 py-2 shadow-[var(--shadow-border)]">
                  {a}
                </li>
              ))}
            </ul>

            <h2 className="mt-10 font-display text-2xl">Who is listing this</h2>
            {provider ? (
              <Card className="mt-3 p-4">
                <div className="flex items-start gap-3">
                  <img src={provider.avatar} alt="" className="size-12 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{provider.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {agent ? "Verified agent (authorised)" : "Landlord · lists directly"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <FanectoVerifiedBadge user={provider} />
                      {provider.verificationStatus === "verified" ? <IdentityVerifiedBadge compact /> : null}
                    </div>
                    <Stars value={provider.rating} count={provider.reviewCount} />
                    <p className="mt-2 text-sm text-muted-foreground">{provider.bio}</p>
                  </div>
                </div>
                {agent && landlord ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Owner: {landlord.displayName}. Agent subscription plans are not part of Fanecto.
                  </p>
                ) : null}
              </Card>
            ) : null}

            {reviews.length ? (
              <div className="mt-8">
                <h2 className="font-display text-2xl">Reviews of this provider</h2>
                <ul className="mt-3 space-y-3">
                  {reviews.map((r) => (
                    <li key={r.id} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
                      <Stars value={r.rating} />
                      <p className="mt-2 text-sm">{r.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {property.inspected && property.lastInspectedAt ? (
              <p className="mt-8 text-xs text-muted-foreground">
                Last physical inspection {formatDate(property.lastInspectedAt)}. {INSPECTION_DISCLAIMER}
              </p>
            ) : (
              <p className="mt-8 text-xs text-muted-foreground">
                This home has not been inspected through Fanecto yet. Inspection confirms physical condition, not legal
                ownership.
              </p>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Available from {formatDate(property.availableFrom)}</p>
              {!available ? (
                <p className="mt-3 text-sm">This listing is no longer available for new applications.</p>
              ) : (
                <div className="mt-4 flex flex-col gap-2">
                  <Button
                    onClick={() =>
                      requireSeeker(() => {
                        setInspectOpen(true);
                      })
                    }
                  >
                    Book an inspection
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      requireSeeker(() => {
                        const cid = startRentalConversation(property.id);
                        toast.message("Conversation opened. Rental chats warn if you try to move payment off Fanecto.");
                        void navigate({ to: "/messages", search: { c: cid } });
                      })
                    }
                  >
                    <MessageSquare className="size-4" /> Message
                  </Button>
                  <Button variant="charcoal" onClick={() => requireSeeker(() => setPayOpen(true))}>
                    Pay rent through Fanecto
                  </Button>
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <Button variant="ghost" size="icon" aria-label="Save" onClick={() => toggleSave(property.id)}>
                  <Heart className={cn("size-4", saved && "fill-primary text-primary")} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Share"
                  onClick={() => {
                    void navigator.clipboard?.writeText(window.location.href);
                    toast.success("Link copied");
                  }}
                >
                  <Share2 className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Report" onClick={() => setReportOpen(true)}>
                  <Flag className="size-4" />
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Fanecto fee on rent paid here is 5% of total rent, shown before you pay. This demo does not move real
                money.
              </p>
            </Card>
          </aside>
        </div>
      </div>

      <Dialog open={inspectOpen} onOpenChange={setInspectOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book a physical inspection</DialogTitle>
            <DialogDescription>
              Choose an inspector, pay the fee, then chat unlocks. Funds are staged until the inspection completes (20%
              Fanecto / 80% inspector). Not legal escrow.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-3">
            {list.map((ins) => (
              <li key={ins.id}>
                <button
                  type="button"
                  onClick={() => setInspectorId(ins.id)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left",
                    inspectorId === ins.id ? "border-primary" : "border-border",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{ins.displayName}</span>
                    <span className="text-sm tabular-nums">{formatNaira(ins.inspectionFee ?? 25000)}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <FanectoVerifiedBadge user={ins} compact />
                    <Stars value={ins.rating} count={ins.reviewCount} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {ins.serviceAreas?.join(" · ")} · {ins.completedInspections} completed
                  </p>
                </button>
              </li>
            ))}
          </ul>
          {selectedInspector ? (
            <MockPay
              title="Inspection fee"
              lines={[
                { label: "Inspector fee", value: selectedInspector.inspectionFee ?? 25000 },
                {
                  label: "After completion: Fanecto 20%",
                  value: inspectionSplit(selectedInspector.inspectionFee ?? 25000).fanecto,
                  muted: true,
                },
                {
                  label: "After completion: Inspector 80%",
                  value: inspectionSplit(selectedInspector.inspectionFee ?? 25000).inspector,
                  muted: true,
                },
              ]}
              total={selectedInspector.inspectionFee ?? 25000}
              disclaimer="Chat unlocks only after this mock payment succeeds. Contact sharing is then allowed."
              successMessage="Payment captured. Chat unlocked — opening your inspections."
              onSuccess={() => {
                const iid = bookAndPayInspection(property.id, selectedInspector.id);
                setInspectOpen(false);
                toast.success("Inspection paid. Chat is unlocked.");
                void navigate({ to: "/inspections", search: { id: iid } });
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay rent through Fanecto</DialogTitle>
            <DialogDescription>
              {formatNaira(property.annualRent)} rent · Fanecto fee 5% = {formatNaira(rentalFee(property.annualRent))}.
              Agent commission is not added unless an agreement specifies it — and Fanecto may only record that
              agreement.
            </DialogDescription>
          </DialogHeader>
          <MockPay
            title="Rental payment"
            lines={[
              { label: "Annual rent", value: property.annualRent },
              { label: "Fanecto fee (5%)", value: rentalFee(property.annualRent) },
            ]}
            total={rentalTotal(property.annualRent)}
            disclaimer="Mock capture only. Availability is re-checked at commit. A failed uncaptured payment is not a refund."
            successMessage="Captured. Listing marked reserved. You may be asked to review the provider."
            onSuccess={() => {
              const res = payRent(property.id);
              if (!res.ok) {
                toast.error(res.error);
                return;
              }
              setPayOpen(false);
              toast.success("Rent captured (demo).");
              if (user) void navigate({ to: ROLE_HOME[user.role] });
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report this listing</DialogTitle>
            <DialogDescription>Reports go to Fanecto operations. Do not include National ID numbers.</DialogDescription>
          </DialogHeader>
          <Label htmlFor="rep">Reason</Label>
          <Textarea id="rep" value={reportReason} onChange={(e) => setReportReason(e.target.value)} />
          <Button
            onClick={() => {
              fileReport({
                reporterId: user?.id ?? "guest",
                targetType: "property",
                targetId: property.id,
                reason: reportReason || "Reported listing",
              });
              setReportOpen(false);
              toast.success("Report submitted to operations.");
            }}
          >
            Submit report
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent className="max-w-4xl border-0 bg-charcoal p-2 text-card sm:rounded-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Photo</DialogTitle>
          </DialogHeader>
          <img
            src={property.images[active]}
            alt=""
            className="max-h-[80vh] w-full rounded-xl object-contain"
          />
          {property.images.length > 1 ? (
            <div className="flex justify-between gap-2 px-2 pb-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActive((i) => (i === 0 ? property.images.length - 1 : i - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActive((i) => (i + 1) % property.images.length)}
              >
                Next
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {available ? (
        <div className="sticky bottom-0 z-20 border-t border-border bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => requireSeeker(() => setInspectOpen(true))}>
              Inspect
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => requireSeeker(() => setPayOpen(true))}>
              Pay rent
            </Button>
          </div>
        </div>
      ) : null}
    </SmartShell>
  );
}
