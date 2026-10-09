import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/fanecto/empty-state";
import { PageHeader } from "@/components/fanecto/page-header";
import { Stars } from "@/components/fanecto/stars";
import { InspectionPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime, formatNaira, inspectionSplit } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";
import { INSPECTION_DISCLAIMER } from "@/lib/fanecto/types";
import { cn } from "@/lib/utils";
import { z } from "zod";

const searchSchema = z.object({
  id: z.string().optional(),
  view: z.enum(["detail", "report"]).optional(),
});

export const Route = createFileRoute("/inspections")({
  component: InspectionsRoute,
  validateSearch: searchSchema,
});

function InspectionsRoute() {
  return (
    <RoleGate allow={["student", "seeker"]}>
      <InspectionsPage />
    </RoleGate>
  );
}

type Filter = "all" | "pending" | "upcoming" | "completed" | "cancelled";

function InspectionsPage() {
  const { id, view } = Route.useSearch();
  const user = useCurrentFanectoUser();
  const [filter, setFilter] = useState<Filter>("all");
  const inspections = useFanecto((s) => s.inspections.filter((i) => i.seekerId === user?.id));
  const properties = useFanecto((s) => s.properties);
  const users = useFanecto((s) => s.users);
  const conversations = useFanecto((s) => s.conversations);

  const filtered = useMemo(() => {
    return inspections.filter((i) => {
      if (filter === "pending")
        return [
          "payment_pending",
          "requested",
          "awaiting_confirmation",
          "paid",
          "awaiting_property_authorization",
        ].includes(i.status);
      if (filter === "upcoming") return ["confirmed", "scheduled", "in_progress"].includes(i.status);
      if (filter === "completed")
        return ["report_ready", "completed", "settlement_pending", "settled"].includes(i.status);
      if (filter === "cancelled")
        return ["declined", "access_declined", "cancelled", "disputed"].includes(i.status);
      return true;
    });
  }, [inspections, filter]);

  const selected =
    inspections.find((i) => i.id === id) ?? filtered[0] ?? inspections[0];
  const property = properties.find((p) => p.id === selected?.propertyId);
  const inspector = users.find((u) => u.id === selected?.inspectorId);
  const conv = conversations.find((c) => c.inspectionId === selected?.id);
  const hasReport =
    !!selected?.report &&
    ["report_ready", "completed", "settlement_pending", "settled"].includes(selected.status);
  const showReport = view === "report" && hasReport && selected;

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "upcoming", label: "Upcoming" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  if (!inspections.length) {
    return (
      <div className="space-y-6">
        <PageHeader
          kicker="Inspections"
          title="Inspections"
          description="Track your property inspections and view completed inspection reports."
        />
        <EmptyState
          title="No inspections yet"
          body="Open a home and book an inspector. Chat stays locked until payment succeeds. The report is physical observation — not a title search."
          action={
            <Button asChild>
              <Link to="/properties">Find a home</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (showReport && selected && property) {
    return (
      <ReportView
        inspectionId={selected.id}
        onBack={() => {
          /* navigation via Link */
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Inspections"
        title="Inspections"
        description="Track your property inspections and view completed inspection reports. Reports reflect what the inspector observed — not legal title."
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={cn(
              "min-h-10 rounded-full px-4 text-sm font-medium",
              filter === t.id ? "bg-primary text-primary-foreground" : "bg-secondary",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <ul className="space-y-2">
          {filtered.map((i) => {
            const p = properties.find((x) => x.id === i.propertyId);
            const insp = users.find((u) => u.id === i.inspectorId);
            const done = ["report_ready", "completed", "settlement_pending", "settled"].includes(
              i.status,
            );
            return (
              <li key={i.id}>
                <Link
                  to="/inspections"
                  search={{ id: i.id }}
                  className={cn(
                    "block rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)] transition-colors",
                    selected?.id === i.id ? "ring-2 ring-primary/30" : "hover:bg-secondary/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {p?.area}
                        {insp?.displayName ? ` · ${insp.displayName}` : ""}
                        {insp?.rating != null ? ` · ★ ${insp.rating}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatNaira(i.fee)}
                        {i.scheduledAt ? ` · ${formatDateTime(i.scheduledAt)}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <InspectionPill status={i.status} />
                      {done ? (
                        <span className="text-[10px] font-medium text-primary">View report</span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {selected && property ? (
          <InspectionDetail
            inspectionId={selected.id}
            propertyId={property.id}
            inspectorId={selected.inspectorId}
            conversationId={conv?.id}
            hasReport={hasReport}
          />
        ) : null}
      </div>
    </div>
  );
}

function InspectionDetail({
  inspectionId,
  propertyId,
  inspectorId,
  conversationId,
  hasReport,
}: {
  inspectionId: string;
  propertyId: string;
  inspectorId: string;
  conversationId?: string;
  hasReport: boolean;
}) {
  const inspection = useFanecto((s) => s.inspections.find((i) => i.id === inspectionId)!);
  const property = useFanecto((s) => s.properties.find((p) => p.id === propertyId)!);
  const inspector = useFanecto((s) => s.users.find((u) => u.id === inspectorId));
  const split = inspectionSplit(inspection.fee);

  return (
    <Card className="space-y-4 p-4 sm:p-6">
      {/* A. Property header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Inspection detail
          </p>
          <h2 className="font-display text-xl font-medium">{property.title}</h2>
          <p className="text-sm text-muted-foreground">
            {property.area}, {property.city}
          </p>
        </div>
        <InspectionPill status={inspection.status} />
      </div>

      {property.images[0] ? (
        <img
          src={property.images[0]}
          alt=""
          className="aspect-[16/9] w-full rounded-xl object-cover"
        />
      ) : null}

      {/* B–D. Inspector / Appointment / Fee — same structure always */}
      <div className="grid gap-3 sm:grid-cols-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Inspector</p>
          <p className="font-medium">{inspector?.displayName ?? "Inspector"}</p>
          {inspector?.rating != null ? (
            <p className="text-muted-foreground">★ {inspector.rating} platform rating</p>
          ) : null}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Appointment</p>
          <p className="font-medium">
            {inspection.scheduledAt ? formatDateTime(inspection.scheduledAt) : "To be confirmed"}
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs text-muted-foreground">Inspection fee</p>
          <p className="font-medium tabular-nums">{formatNaira(inspection.fee)}</p>
          <p className="text-xs text-muted-foreground">
            Client pays {formatNaira(inspection.fee)}. Fanecto 20% ({formatNaira(split.fanecto)}) ·
            Inspector 80% ({formatNaira(split.inspector)}) after report submission.
          </p>
        </div>
      </div>

      {/* State messages */}
      {inspection.status === "awaiting_property_authorization" ? (
        <p className="rounded-xl bg-secondary/60 px-3 py-2 text-sm">
          The inspector accepted your request. The landlord or authorized agent must approve property access
          before this inspection is confirmed.
        </p>
      ) : null}
      {inspection.status === "access_declined" ? (
        <p className="rounded-xl bg-secondary/60 px-3 py-2 text-sm">
          Property access was not authorized, so this inspection cannot proceed. You may request another time
          or choose another listing.
        </p>
      ) : null}
      {inspection.status === "declined" ? (
        <p className="rounded-xl bg-secondary/60 px-3 py-2 text-sm">
          This inspector declined the appointment. Payment status is under review.
        </p>
      ) : null}
      {inspection.status === "confirmed" || inspection.status === "scheduled" ? (
        <p className="rounded-xl bg-secondary/40 px-3 py-2 text-sm">
          ✓ Inspector accepted · ✓ Property access authorized
        </p>
      ) : null}
      {inspection.status === "awaiting_confirmation" || inspection.status === "paid" ? (
        <p className="rounded-xl bg-secondary/60 px-3 py-2 text-sm">
          Payment received. Waiting for the inspector to accept this appointment.
        </p>
      ) : null}

      {/* Actions — same area, state-aware */}
      <div className="flex flex-wrap gap-2 border-t pt-4">
        {hasReport ? (
          <Button asChild size="sm">
            <Link to="/inspections" search={{ id: inspectionId, view: "report" }}>
              View report
            </Link>
          </Button>
        ) : null}
        <Button asChild variant="outline" size="sm">
          <Link
            to="/properties/$id"
            params={{ id: property.id }}
            search={{ from: `/inspections?id=${inspectionId}` }}
          >
            View property
          </Link>
        </Button>
        {inspection.chatUnlocked && conversationId ? (
          <Button asChild variant="outline" size="sm">
            <Link to="/messages" search={{ c: conversationId }}>
              Message inspector
            </Link>
          </Button>
        ) : null}
      </div>

      {/* Rating — only when report ready and not yet rated */}
      {hasReport ? (
        <RateSection
          inspectionId={inspectionId}
          inspectorName={inspector?.displayName ?? "Inspector"}
          clientRating={inspection.clientRating}
          ratingSubmitted={!!inspection.ratingSubmitted}
        />
      ) : null}
    </Card>
  );
}

function RateSection({
  inspectionId,
  inspectorName,
  clientRating,
  ratingSubmitted,
}: {
  inspectionId: string;
  inspectorName: string;
  clientRating?: number;
  ratingSubmitted: boolean;
}) {
  const rateInspection = useFanecto((s) => s.rateInspection);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  if (ratingSubmitted && clientRating) {
    return (
      <div className="rounded-xl border p-4 space-y-2">
        <p className="text-sm font-medium">You rated {inspectorName}</p>
        <div className="flex items-center gap-2">
          <Stars value={clientRating} />
          <span className="text-sm text-muted-foreground">{clientRating}/5</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <p className="font-medium">Rate inspector</p>
      <p className="text-sm text-muted-foreground">How was your inspection experience with {inspectorName}?</p>
      <div className="flex flex-wrap gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} stars`}
            className="min-h-11 min-w-11 rounded-lg p-1"
            onClick={() => setRating(n)}
          >
            <Stars value={n <= rating ? n : 0} />
          </button>
        ))}
      </div>
      {rating > 0 ? (
        <p className="text-xs text-muted-foreground">{rating}/5 selected</p>
      ) : (
        <p className="text-xs text-muted-foreground">Select a rating to continue</p>
      )}
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Optional comment"
      />
      <Button
        size="sm"
        disabled={rating < 1}
        onClick={() => {
          rateInspection(inspectionId, rating, text);
          toast.success("Rating submitted");
        }}
      >
        Submit rating
      </Button>
    </div>
  );
}

function ReportView({
  inspectionId,
}: {
  inspectionId: string;
  onBack?: () => void;
}) {
  const inspection = useFanecto((s) => s.inspections.find((i) => i.id === inspectionId));
  const property = useFanecto((s) => s.properties.find((p) => p.id === inspection?.propertyId));
  const inspector = useFanecto((s) => s.users.find((u) => u.id === inspection?.inspectorId));
  const report = inspection?.report;

  if (!inspection || !property || !report) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Report not available.</p>
        <Button asChild variant="outline">
          <Link to="/inspections" search={{ id: inspectionId }}>
            Back
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Inspection report
          </p>
          <h1 className="font-display text-2xl font-medium">{property.title}</h1>
          <p className="text-sm text-muted-foreground">
            {property.area}, {property.city}
          </p>
        </div>
        <InspectionPill status={inspection.status} />
      </div>

      <Card className="space-y-1 p-4 text-sm">
        <p>
          <span className="text-muted-foreground">Inspected by</span>{" "}
          <span className="font-medium">{inspector?.displayName}</span>
          {inspector?.rating != null ? ` · ★ ${inspector.rating}` : ""}
        </p>
        <p>
          <span className="text-muted-foreground">Appointment</span>{" "}
          {inspection.scheduledAt ? formatDateTime(inspection.scheduledAt) : "—"}
        </p>
        <p>
          <span className="text-muted-foreground">Submitted</span>{" "}
          {inspection.submittedAt || report.completedAt
            ? formatDateTime(inspection.submittedAt ?? report.completedAt!)
            : "—"}
        </p>
      </Card>

      <ReportSection title="Summary">
        <div className="grid gap-2 sm:grid-cols-2">
          {report.generalCondition ? (
            <Row label="Overall condition" value={report.generalCondition} />
          ) : report.conditionSummary ? (
            <Row label="Condition summary" value={report.conditionSummary} />
          ) : null}
          {report.water?.status ? <Row label="Water" value={report.water.status} /> : null}
          {report.electricity?.condition ? (
            <Row label="Electricity" value={report.electricity.condition} />
          ) : null}
          {report.matchesListing ? (
            <Row label="Matches listing" value={report.matchesListing} />
          ) : null}
        </div>
      </ReportSection>

      {(report.propertyType || report.accessible) && (
        <ReportSection title="Property basics">
          {report.propertyType ? <Row label="Property type" value={report.propertyType} /> : null}
          {report.generalCondition ? (
            <Row label="General condition" value={report.generalCondition} />
          ) : null}
          {report.matchesListing ? (
            <Row label="Matches listing" value={report.matchesListing} />
          ) : null}
          {report.accessible ? <Row label="Accessible" value={report.accessible} /> : null}
        </ReportSection>
      )}

      {report.water && Object.keys(report.water).length > 0 && (
        <ReportSection title="Water">
          {report.water.status ? <Row label="Running water" value={report.water.status} /> : null}
          {report.water.source ? <Row label="Source" value={report.water.source} /> : null}
          {report.water.availability ? (
            <Row label="Availability" value={report.water.availability} />
          ) : null}
          {report.water.pressure ? <Row label="Pressure" value={report.water.pressure} /> : null}
          {report.water.notes ? <p className="text-sm text-muted-foreground">{report.water.notes}</p> : null}
        </ReportSection>
      )}

      {report.electricity && Object.keys(report.electricity).length > 0 && (
        <ReportSection title="Electricity">
          {report.electricity.available ? (
            <Row label="Available" value={report.electricity.available} />
          ) : null}
          {report.electricity.condition ? (
            <Row label="Condition" value={report.electricity.condition} />
          ) : null}
          {report.electricity.backup ? <Row label="Backup" value={report.electricity.backup} /> : null}
          {report.electricity.meter ? <Row label="Meter" value={report.electricity.meter} /> : null}
          {report.electricity.fittings ? (
            <Row label="Fittings" value={report.electricity.fittings} />
          ) : null}
        </ReportSection>
      )}

      {report.utilities ? (
        <ReportSection title="Utilities observed">
          <p className="text-sm">{report.utilities}</p>
        </ReportSection>
      ) : null}

      {report.visibleIssues?.length ? (
        <ReportSection title="Visible issues">
          <ul className="list-disc pl-5 text-sm">
            {report.visibleIssues.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </ReportSection>
      ) : null}

      {report.listingVsObserved ? (
        <ReportSection title="Listing vs observed">
          <p className="text-sm">{report.listingVsObserved}</p>
        </ReportSection>
      ) : null}

      <ReportSection title="Inspector notes">
        <p className="whitespace-pre-wrap text-sm">{report.notes}</p>
      </ReportSection>

      {report.evidence?.length ? (
        <ReportSection title="Inspection evidence">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {report.evidence.map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                <img src={url} alt="" className="aspect-square rounded-lg object-cover" />
              </a>
            ))}
          </div>
        </ReportSection>
      ) : null}

      {report.videoUrl ? (
        <ReportSection title="Inspection video">
          <video src={report.videoUrl} controls className="w-full rounded-xl" />
        </ReportSection>
      ) : null}

      <p className="rounded-xl border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
        {report.disclaimer || INSPECTION_DISCLAIMER}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link to="/inspections" search={{ id: inspectionId }}>
            Back to inspection
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link
            to="/properties/$id"
            params={{ id: property.id }}
            search={{ from: `/inspections?id=${inspectionId}` }}
          >
            View property
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-lg font-medium">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
