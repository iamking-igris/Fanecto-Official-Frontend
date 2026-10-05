import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { NotificationCenter } from "@/components/fanecto/notification-center";
import { PageHeader } from "@/components/fanecto/page-header";
import { InspectionPill } from "@/components/fanecto/status-pill";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime, formatNaira, initials } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/inspections/$id")({
  component: InspectionDetailRoute,
});

function InspectionDetailRoute() {
  const { id } = Route.useParams();
  const user = useCurrentFanectoUser();
  const inspection = useFanecto((s) => s.inspections.find((item) => item.id === id));
  const property = useFanecto((s) => s.properties.find((item) => item.id === inspection?.propertyId));
  const inspector = useFanecto((s) => s.users.find((item) => item.id === inspection?.inspectorId));
  const payment = useFanecto((s) =>
    s.payments.find((item) => item.kind === "inspection" && item.inspectionId === inspection?.id),
  );
  const conversation = useFanecto(
    (s) => s.conversations.find((item) => item.context === "inspection" && item.inspectionId === inspection?.id),
  );
  const [policyAcknowledged, setPolicyAcknowledged] = useState(false);

  if (!inspection || !property) {
    return (
      <div className="space-y-4">
        <Link to="/inspections" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="size-4" />
          Inspections
        </Link>
        <Card className="p-6 text-sm text-muted-foreground">Inspection not found.</Card>
      </div>
    );
  }

  const canChat = inspection.chatUnlocked && !["cancelled", "no_show", "disputed"].includes(inspection.status);
  const appointmentDate = inspection.scheduledAt ? formatDateTime(inspection.scheduledAt) : "To be confirmed";
  const inspectionStatusLabel =
    inspection.status === "payment_pending"
      ? "Pending payment"
      : inspection.status === "paid" && !inspection.scheduledAt
        ? "Awaiting confirmation"
        : inspection.status === "completed" || inspection.status === "report_ready" || inspection.status === "settled"
          ? "Completed"
          : inspection.status === "cancelled" || inspection.status === "no_show" || inspection.status === "disputed"
            ? "Cancelled"
            : inspection.status === "scheduled" || inspection.status === "in_progress"
              ? "Confirmed"
              : "Payment processing";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link to="/inspections" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          Inspections
        </Link>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          {user ? (
            <Avatar className="size-8">
              {user.avatar ? <AvatarImage src={user.avatar} alt={user.displayName} /> : null}
              <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
            </Avatar>
          ) : null}
        </div>
      </div>

      <PageHeader
        kicker="Inspection details"
        title={property.title}
        description="Follow the appointment, payment status and inspection details for this property visit."
      />

      <Card className="overflow-hidden p-0">
        <div className="grid gap-0 md:grid-cols-[260px_1fr]">
          <img src={property.images[0]} alt={property.title} className="h-full min-h-52 w-full object-cover" />
          <div className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <InspectionPill status={inspection.status} />
              <span className="text-sm font-medium text-foreground">{formatNaira(inspection.fee)}</span>
            </div>

            <h2 className="mt-4 font-display text-2xl font-medium tracking-tight">{property.title}</h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {property.area}, {property.city}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/properties/$id" params={{ id: property.id }}>
                  View property
                </Link>
              </Button>
              {canChat ? (
                <Button asChild variant="outline">
                  <Link
                    to="/messages"
                    search={{ c: conversation?.id ?? "" }}
                    className="inline-flex items-center gap-2"
                  >
                    <MessageSquareText className="size-4" />
                    Message inspector
                  </Link>
                </Button>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
                  <ShieldCheck className="size-3.5" />
                  Chat unlocks after inspection payment.
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-xl">Inspection appointment</h3>
            <InspectionPill status={inspection.status} />
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center gap-3 text-foreground/80">
              <CalendarDays className="size-4 text-muted-foreground" />
              <span>{appointmentDate}</span>
            </div>
            <div className="flex items-center gap-3 text-foreground/80">
              <Clock3 className="size-4 text-muted-foreground" />
              <span>{inspection.scheduledAt ? new Date(inspection.scheduledAt).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" }) : "Time to be confirmed"}</span>
            </div>
            <div className="flex items-center gap-3 text-foreground/80">
              <CheckCircle2 className="size-4 text-muted-foreground" />
              <span>Status: {inspectionStatusLabel}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display text-xl">Inspector</h3>
          <div className="mt-4 flex items-center gap-3">
            <Avatar className="size-12 border border-border bg-secondary">
              {inspector?.avatar ? <AvatarImage src={inspector.avatar} alt={inspector.displayName} /> : null}
              <AvatarFallback>{inspector ? initials(inspector.displayName) : "IN"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium">{inspector?.displayName ?? "Inspector assigned"}</p>
              <div className="mt-1 flex items-center gap-1 text-sm text-amber-600">
                <Star className="size-3.5 fill-current" />
                <span>{inspector?.rating ? inspector.rating.toFixed(1) : "4.8"}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/messages" search={{ c: conversation?.id ?? "" }}>
                View profile
              </Link>
            </Button>
            <span className="ml-auto self-center text-xs text-muted-foreground">
              {inspector?.completedInspections ?? 32} inspections
            </span>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-xl">Inspection location</h3>
          <Button asChild variant="outline" size="sm">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(`${property.area}, ${property.city}`)}`}
              target="_blank"
              rel="noreferrer"
            >
              Get directions
            </a>
          </Button>
        </div>
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-secondary/20 p-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-4 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">{property.area}, {property.city}</p>
              <p className="mt-1 text-sm text-muted-foreground">{property.addressHint}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5" id="payment-policy">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-xl">Payment status</h3>
          <span className="text-sm text-muted-foreground">{payment?.status ? payment.status : "Pending"}</span>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-secondary/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Inspection fee</p>
            <p className="font-medium">{formatNaira(inspection.fee)}</p>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Payment status</p>
            <p className="font-medium">{inspection.chatUnlocked ? "Paid" : "Pending"}</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Fanecto processes and holds inspection payments while your inspection is being arranged and completed. Your
          payment and any applicable cancellation or refund outcome are governed by Fanecto&apos;s inspection payment policy.
        </p>

        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <h4 className="font-medium">How your inspection payment works</h4>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>You pay Fanecto.</li>
            <li>Fanecto holds the inspection payment while the inspection is being arranged and completed.</li>
            <li>The inspection takes place.</li>
            <li>The payment is handled according to Fanecto&apos;s inspection payment, cancellation and refund terms.</li>
          </ol>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <a href="#payment-policy">View payment & refund policy</a>
          </Button>
          <Button
            size="sm"
            variant={policyAcknowledged ? "secondary" : "default"}
            onClick={() => {
              setPolicyAcknowledged(true);
              toast.success("Inspection payment policy acknowledged.");
            }}
          >
            {policyAcknowledged ? "Policy acknowledged" : "I understand the inspection payment and refund policy"}
          </Button>
        </div>
      </Card>

      {inspection.status === "requested" || inspection.status === "payment_pending" ? (
        <Card className="p-5">
          <h3 className="font-display text-xl">Before you pay</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Fanecto processes and holds inspection payments while your inspection is being arranged and completed.
            Your payment and any applicable cancellation or refund outcome are governed by Fanecto&apos;s inspection
            payment policy.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/payments">Pay {formatNaira(inspection.fee)}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/inspections">Read payment & refund policy</Link>
            </Button>
          </div>
        </Card>
      ) : null}

      {inspection.report ? (
        <Card className="p-5">
          <h3 className="font-display text-xl">Inspection report</h3>
          <p className="mt-2 text-sm text-muted-foreground">{inspection.report.conditionSummary}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {inspection.report.evidence.map((src) => (
              <img key={src} src={src} alt="Inspection evidence" className="h-40 w-full rounded-xl object-cover" />
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
