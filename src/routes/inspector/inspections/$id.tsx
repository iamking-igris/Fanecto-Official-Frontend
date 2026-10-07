import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { Inbox } from "@/components/fanecto/inbox";
import { InspectionPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime, formatNaira, inspectionSplit } from "@/lib/fanecto/format";
import { useFanecto } from "@/lib/fanecto/store";
import { INSPECTION_DISCLAIMER, type InspectionReport } from "@/lib/fanecto/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inspector/inspections/$id")({
  component: function Comp() {
    const { id } = Route.useParams();
    return (
      <RoleGate allow={["inspector"]}>
        <View id={id} />
      </RoleGate>
    );
  },
});

const CHOICE = ["Good", "Fair", "Poor", "Not available", "Not inspected", "Not tested"] as const;

function emptyReport(): InspectionReport {
  return {
    roomsChecked: [],
    conditionSummary: "",
    utilities: "",
    visibleIssues: [],
    listingVsObserved: "",
    notes: "",
    evidence: [],
    disclaimer: INSPECTION_DISCLAIMER,
    propertyType: "",
    generalCondition: "",
    matchesListing: "",
    accessible: "",
    water: {},
    electricity: {},
    interior: { living: {}, bedroom: {}, kitchen: {}, bathroom: {} },
    environment: {},
    security: {},
    presentDuring: "",
    photos: [],
    isDraft: true,
  };
}

function View({ id }: { id: string }) {
  const inspection = useFanecto((s) => s.inspections.find((i) => i.id === id));
  const property = useFanecto((s) => s.properties.find((p) => p.id === inspection?.propertyId));
  const client = useFanecto((s) => s.users.find((u) => u.id === inspection?.seekerId));
  const conversations = useFanecto((s) => s.conversations);
  const acceptInspection = useFanecto((s) => s.acceptInspection);
  const declineInspection = useFanecto((s) => s.declineInspection);
  const saveDraft = useFanecto((s) => s.saveInspectionReportDraft);
  const completeInspection = useFanecto((s) => s.completeInspection);

  const [acceptOpen, setAcceptOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState<InspectionReport>(() => inspection?.report ?? emptyReport());
  const [section, setSection] = useState(0);

  const conv = useMemo(
    () => conversations.find((c) => c.inspectionId === id),
    [conversations, id],
  );

  if (!inspection || !property) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Inspection not found.</p>
        <Button asChild variant="outline">
          <Link to="/inspector/inspections">Back to jobs</Link>
        </Button>
      </div>
    );
  }

  const split = inspectionSplit(inspection.fee);
  const canRespond = ["awaiting_confirmation", "paid"].includes(inspection.status);
  const awaitingAuth = inspection.status === "awaiting_property_authorization";
  const canStart =
    ["confirmed", "scheduled"].includes(inspection.status) &&
    inspection.propertyAuthorizationStatus === "approved";
  const canSubmitReport = ["confirmed", "scheduled", "in_progress"].includes(inspection.status) &&
    (inspection.propertyAuthorizationStatus === "approved" || inspection.status === "in_progress");
  const isDone = ["report_ready", "completed", "settlement_pending", "settled"].includes(
    inspection.status,
  );

  const sections = [
    "Property basics",
    "Water",
    "Electricity",
    "Interior",
    "Environment",
    "Security & access",
    "Notes & evidence",
    "Review",
  ];

  function setField(path: string, value: string) {
    setReport((r) => {
      const next = { ...r };
      if (path.startsWith("water.")) {
        next.water = { ...next.water, [path.slice(6)]: value };
      } else if (path.startsWith("electricity.")) {
        next.electricity = { ...next.electricity, [path.slice(12)]: value };
      } else if (path.startsWith("env.")) {
        next.environment = { ...next.environment, [path.slice(4)]: value };
      } else if (path.startsWith("sec.")) {
        next.security = { ...next.security, [path.slice(4)]: value };
      } else if (path.startsWith("int.")) {
        const [, area, key] = path.split(".");
        next.interior = {
          ...next.interior,
          [area]: { ...(next.interior as any)?.[area], [key]: value },
        };
      } else {
        (next as any)[path] = value;
      }
      return next;
    });
  }

  function validateForSubmit(): string | null {
    if (!report.generalCondition) return "Please set general condition.";
    if (!report.water?.status) return "Please complete the water assessment.";
    if (!report.electricity?.available) return "Please complete the electricity assessment.";
    if (!report.notes?.trim()) return "Overall inspection notes are required.";
    return null;
  }

  function handleSaveDraft() {
    saveDraft(id, report);
    toast.success("Draft saved");
  }

  function handleSubmit() {
    const err = validateForSubmit();
    if (err) {
      toast.error(err);
      return;
    }
    const finalReport: InspectionReport = {
      ...report,
      conditionSummary: report.conditionSummary || report.generalCondition || "See checklist",
      utilities: [
        report.water?.status && `Water: ${report.water.status}`,
        report.electricity?.condition && `Power: ${report.electricity.condition}`,
      ]
        .filter(Boolean)
        .join(". "),
      listingVsObserved: report.matchesListing
        ? `Matches listing: ${report.matchesListing}`
        : report.listingVsObserved,
      roomsChecked: report.roomsChecked.length
        ? report.roomsChecked
        : ["Living area", "Bedroom", "Kitchen", "Bathroom"],
      evidence:
        report.evidence.length > 0
          ? report.evidence
          : report.photos?.map((p) => p.url) ?? [],
      isDraft: false,
      disclaimer: INSPECTION_DISCLAIMER,
    };
    completeInspection(id, finalReport);
    setSubmitOpen(false);
    setShowReport(false);
    toast.success("Inspection report submitted");
  }

  function ChoiceRow({
    label,
    value,
    onChange,
    options = CHOICE as unknown as string[],
  }: {
    label: string;
    value?: string;
    onChange: (v: string) => void;
    options?: string[];
  }) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex flex-wrap gap-2">
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              className={cn(
                "min-h-10 rounded-full border px-3 text-sm transition-colors",
                value === o
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-secondary",
              )}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Inspection job
          </p>
          <h1 className="font-display text-2xl font-medium">{property.title}</h1>
          <p className="text-sm text-muted-foreground">
            {property.area}, {property.city}
          </p>
        </div>
        <InspectionPill status={inspection.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-3 p-4 lg:col-span-2">
          {property.images[0] ? (
            <img
              src={property.images[0]}
              alt=""
              className="aspect-[16/9] w-full rounded-xl object-cover"
            />
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Client</p>
              <p className="font-medium">{client?.displayName ?? "Client"}</p>
              <p className="text-sm text-muted-foreground capitalize">{client?.role}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Appointment</p>
              <p className="font-medium">
                {inspection.scheduledAt ? formatDateTime(inspection.scheduledAt) : "To confirm"}
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/properties/$id" params={{ id: property.id }}>
              View property
            </Link>
          </Button>
        </Card>

        <Card className="space-y-3 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Fee breakdown
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Inspection price</span>
              <span className="tabular-nums font-medium">{formatNaira(inspection.fee)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Fanecto · 20%</span>
              <span className="tabular-nums">{formatNaira(split.fanecto)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-medium">
              <span>Your estimated amount</span>
              <span className="tabular-nums">{formatNaira(split.inspector)}</span>
            </div>
          </div>
          {inspection.payoutStatus ? (
            <p className="text-xs text-muted-foreground">
              Payout: {inspection.payoutStatus}
              {inspection.reportStatus ? ` · Report: ${inspection.reportStatus}` : ""}
            </p>
          ) : null}
        </Card>
      </div>

      {canRespond ? (
        <Card className="flex flex-wrap gap-2 p-4">
          <Button onClick={() => setAcceptOpen(true)}>Accept inspection</Button>
          <Button variant="outline" onClick={() => setDeclineOpen(true)}>
            Decline inspection
          </Button>
        </Card>
      ) : null}

      {awaitingAuth ? (
        <Card className="space-y-2 p-4">
          <p className="font-medium">Waiting for property authorization</p>
          <p className="text-sm text-muted-foreground">
            You accepted this job. The landlord or authorized agent must approve access before the appointment is
            confirmed. You cannot start the inspection or submit a report yet.
          </p>
        </Card>
      ) : null}

      {inspection.status === "access_declined" ? (
        <Card className="p-4 text-sm text-muted-foreground">
          Property access was not authorized. This inspection cannot proceed.
        </Card>
      ) : null}

      {canSubmitReport || isDone || canStart ? (
        <Card className="flex flex-wrap gap-2 p-4">
          {canStart ? (
            <Button
              variant="outline"
              onClick={() => {
                useFanecto.getState().startInspection(id);
                toast.success("Inspection marked in progress");
              }}
            >
              Start inspection
            </Button>
          ) : null}
          {canSubmitReport ? (
            <Button
              onClick={() => {
                setReport(inspection.report ?? emptyReport());
                setShowReport(true);
                setSection(0);
              }}
            >
              Submit inspection
            </Button>
          ) : null}
          {isDone && inspection.report ? (
            <Button variant="outline" onClick={() => setShowReport(true)}>
              View report
            </Button>
          ) : null}
          {conv && inspection.chatUnlocked ? (
            <Button asChild variant="outline">
              <Link to="/messages" search={{ c: conv.id }}>
                Message client
              </Link>
            </Button>
          ) : null}
        </Card>
      ) : null}

      {inspection.chatUnlocked && conv ? (
        <div className="space-y-2">
          <h2 className="font-display text-lg font-medium">Messages</h2>
          <div className="overflow-hidden rounded-2xl border">
            <Inbox initialId={conv.id} />
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Chat unlocks after the client pays the inspection fee.
        </p>
      )}

      {/* Accept modal */}
      <Dialog open={acceptOpen} onOpenChange={setAcceptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept this inspection?</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p className="font-medium">{property.title}</p>
            <p className="text-muted-foreground">
              {property.area} ·{" "}
              {inspection.scheduledAt ? formatDateTime(inspection.scheduledAt) : "Time TBC"}
            </p>
            <p>
              Inspection price {formatNaira(inspection.fee)} · Your amount after Fanecto 20%{" "}
              {formatNaira(split.inspector)}
            </p>
            <p className="text-muted-foreground">
              Accepting does not authorize property access. The landlord or agent must still approve before the
              visit is confirmed.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                acceptInspection(id);
                setAcceptOpen(false);
                toast.success("Accepted — waiting for property authorization");
              }}
            >
              Accept inspection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline modal */}
      <Dialog open={declineOpen} onOpenChange={setDeclineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline inspection?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will notify the client that you cannot take the appointment. If payment was already
            made, payment status will show as under review.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclineOpen(false)}>
              Keep request
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                declineInspection(id);
                setDeclineOpen(false);
                toast.success("Inspection declined");
              }}
            >
              Decline inspection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report workflow */}
      {showReport ? (
        <Card className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-xl font-medium">Inspection report</h2>
              <p className="text-sm text-muted-foreground">
                {isDone ? "Submitted — read only" : `Section ${section + 1} of ${sections.length}: ${sections[section]}`}
              </p>
            </div>
            {!isDone ? (
              <Button variant="outline" size="sm" onClick={handleSaveDraft}>
                Save progress
              </Button>
            ) : null}
          </div>

          {!isDone ? (
            <div className="flex gap-1 overflow-x-auto pb-1">
              {sections.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSection(i)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
                    i === section ? "bg-primary text-primary-foreground" : "bg-secondary",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}

          <div className="space-y-4">
            {(isDone || section === 0) && (
              <div className="space-y-4">
                {!isDone && <h3 className="font-medium">Property basics</h3>}
                {isDone && <h3 className="font-medium">Property basics</h3>}
                <ChoiceRow
                  label="Property type"
                  value={report.propertyType}
                  onChange={(v) => !isDone && setField("propertyType", v)}
                  options={["Self-contained", "Mini-flat", "1 bedroom", "2 bedroom", "3 bedroom", "Duplex", "Other"]}
                />
                <ChoiceRow
                  label="General condition"
                  value={report.generalCondition}
                  onChange={(v) => !isDone && setField("generalCondition", v)}
                  options={["Excellent", "Good", "Fair", "Poor"]}
                />
                <ChoiceRow
                  label="Condition matches listing"
                  value={report.matchesListing}
                  onChange={(v) => !isDone && setField("matchesListing", v)}
                  options={["Yes", "Partially", "No"]}
                />
                <ChoiceRow
                  label="Property accessible during inspection"
                  value={report.accessible}
                  onChange={(v) => !isDone && setField("accessible", v)}
                  options={["Yes", "No"]}
                />
              </div>
            )}

            {(isDone || section === 1) && (
              <div className="space-y-4">
                <h3 className="font-medium">Water</h3>
                <ChoiceRow label="Running water" value={report.water?.status} onChange={(v) => !isDone && setField("water.status", v)} />
                <ChoiceRow
                  label="Water source"
                  value={report.water?.source}
                  onChange={(v) => !isDone && setField("water.source", v)}
                  options={["Borehole", "Public supply", "Well", "Water tank", "Other"]}
                />
                <ChoiceRow
                  label="Availability"
                  value={report.water?.availability}
                  onChange={(v) => !isDone && setField("water.availability", v)}
                  options={["Consistent", "Intermittent", "Unavailable"]}
                />
                <ChoiceRow label="Water pressure" value={report.water?.pressure} onChange={(v) => !isDone && setField("water.pressure", v)} />
                <div>
                  <Label>Water notes</Label>
                  <Textarea
                    className="mt-1"
                    disabled={isDone}
                    value={report.water?.notes ?? ""}
                    onChange={(e) => setField("water.notes", e.target.value)}
                  />
                </div>
              </div>
            )}

            {(isDone || section === 2) && (
              <div className="space-y-4">
                <h3 className="font-medium">Electricity</h3>
                <ChoiceRow
                  label="Electricity available"
                  value={report.electricity?.available}
                  onChange={(v) => !isDone && setField("electricity.available", v)}
                  options={["Yes", "No"]}
                />
                <ChoiceRow
                  label="Power condition observed"
                  value={report.electricity?.condition}
                  onChange={(v) => !isDone && setField("electricity.condition", v)}
                  options={["Good", "Fair", "Poor"]}
                />
                <ChoiceRow
                  label="Backup power"
                  value={report.electricity?.backup}
                  onChange={(v) => !isDone && setField("electricity.backup", v)}
                  options={["Generator", "Inverter", "Solar", "None", "Other"]}
                />
                <ChoiceRow
                  label="Meter"
                  value={report.electricity?.meter}
                  onChange={(v) => !isDone && setField("electricity.meter", v)}
                  options={["Prepaid", "Postpaid", "Unknown"]}
                />
                <ChoiceRow
                  label="Electrical fittings"
                  value={report.electricity?.fittings}
                  onChange={(v) => !isDone && setField("electricity.fittings", v)}
                  options={["Good", "Fair", "Poor"]}
                />
              </div>
            )}

            {(isDone || section === 3) && (
              <div className="space-y-4">
                <h3 className="font-medium">Interior</h3>
                {(["living", "bedroom", "kitchen", "bathroom"] as const).map((area) => (
                  <div key={area} className="rounded-xl border p-3 space-y-2">
                    <p className="text-sm font-medium capitalize">{area}</p>
                    <ChoiceRow
                      label="Condition"
                      value={(report.interior as any)?.[area]?.condition}
                      onChange={(v) => !isDone && setField(`int.${area}.condition`, v)}
                    />
                  </div>
                ))}
              </div>
            )}

            {(isDone || section === 4) && (
              <div className="space-y-4">
                <h3 className="font-medium">Environment</h3>
                <ChoiceRow label="Drainage" value={report.environment?.drainage} onChange={(v) => !isDone && setField("env.drainage", v)} options={["Good", "Fair", "Poor", "Not assessed"]} />
                <ChoiceRow label="Road / access" value={report.environment?.roadAccess} onChange={(v) => !isDone && setField("env.roadAccess", v)} options={["Good", "Fair", "Poor"]} />
                <ChoiceRow label="Flooding signs observed" value={report.environment?.floodingSigns} onChange={(v) => !isDone && setField("env.floodingSigns", v)} options={["Yes", "No", "Unknown"]} />
                <ChoiceRow label="Noise" value={report.environment?.noise} onChange={(v) => !isDone && setField("env.noise", v)} options={["Low", "Moderate", "High"]} />
                <ChoiceRow label="General environment" value={report.environment?.general} onChange={(v) => !isDone && setField("env.general", v)} options={["Good", "Fair", "Poor"]} />
              </div>
            )}

            {(isDone || section === 5) && (
              <div className="space-y-4">
                <h3 className="font-medium">Security & access</h3>
                <ChoiceRow label="Property access" value={report.security?.access} onChange={(v) => !isDone && setField("sec.access", v)} options={["Easy", "Moderate", "Difficult"]} />
                <ChoiceRow label="Gate / security observed" value={report.security?.gate} onChange={(v) => !isDone && setField("sec.gate", v)} options={["Good", "Fair", "Poor", "None"]} />
                <ChoiceRow label="General surroundings" value={report.security?.surroundings} onChange={(v) => !isDone && setField("sec.surroundings", v)} options={["Quiet", "Moderate activity", "Busy"]} />
                <div>
                  <Label>Security features observed</Label>
                  <Textarea
                    className="mt-1"
                    disabled={isDone}
                    value={report.security?.featuresObserved ?? ""}
                    onChange={(e) => setField("sec.featuresObserved", e.target.value)}
                    placeholder="What you observed only — not a security certification."
                  />
                </div>
                <ChoiceRow
                  label="Who was present?"
                  value={report.presentDuring}
                  onChange={(v) => !isDone && setField("presentDuring", v)}
                  options={["Landlord", "Agent", "Caretaker", "Other"]}
                />
              </div>
            )}

            {(isDone || section === 6) && (
              <div className="space-y-4">
                <h3 className="font-medium">Overall notes & evidence</h3>
                <div>
                  <Label>Overall inspection notes (required)</Label>
                  <Textarea
                    className="mt-1 min-h-28"
                    disabled={isDone}
                    value={report.notes}
                    onChange={(e) => setField("notes", e.target.value)}
                    placeholder="Anything important that does not fit the checklist."
                  />
                </div>
                <div>
                  <Label>Visible issues (comma-separated)</Label>
                  <Input
                    className="mt-1"
                    disabled={isDone}
                    value={report.visibleIssues.join(", ")}
                    onChange={(e) =>
                      setReport((r) => ({
                        ...r,
                        visibleIssues: e.target.value
                          .split(",")
                          .map((x) => x.trim())
                          .filter(Boolean),
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Evidence image URL (mock)</Label>
                  <Input
                    className="mt-1"
                    disabled={isDone}
                    placeholder="Paste image URL to add"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const v = (e.target as HTMLInputElement).value.trim();
                        if (v) {
                          setReport((r) => ({ ...r, evidence: [...r.evidence, v] }));
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {report.evidence.map((url) => (
                      <img key={url} src={url} alt="" className="size-20 rounded-lg object-cover" />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(isDone || section === 7) && !isDone && (
              <div className="space-y-3">
                <h3 className="font-medium">Review before submission</h3>
                <ul className="space-y-2 text-sm">
                  {[
                    ["Property basics", !!report.generalCondition],
                    ["Water", !!report.water?.status],
                    ["Electricity", !!report.electricity?.available],
                    ["Notes", !!report.notes?.trim()],
                  ].map(([label, ok]) => (
                    <li key={String(label)} className="flex justify-between rounded-lg bg-secondary/50 px-3 py-2">
                      <span>{label}</span>
                      <span className={ok ? "text-primary" : "text-muted-foreground"}>
                        {ok ? "Complete" : "Needs attention"}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground">{INSPECTION_DISCLAIMER}</p>
              </div>
            )}

            {isDone && inspection.report ? (
              <div className="space-y-3 border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Submitted{" "}
                  {inspection.submittedAt
                    ? formatDateTime(inspection.submittedAt)
                    : inspection.report.completedAt
                      ? formatDateTime(inspection.report.completedAt)
                      : ""}
                </p>
                <p className="text-sm whitespace-pre-wrap">{inspection.report.notes}</p>
                <p className="text-xs text-muted-foreground">{INSPECTION_DISCLAIMER}</p>
              </div>
            ) : null}
          </div>

          {!isDone ? (
            <div className="sticky bottom-0 flex flex-wrap gap-2 border-t bg-card pt-3">
              {section > 0 ? (
                <Button variant="outline" onClick={() => setSection((s) => s - 1)}>
                  Back
                </Button>
              ) : null}
              {section < sections.length - 1 ? (
                <Button onClick={() => setSection((s) => s + 1)}>Continue</Button>
              ) : (
                <Button onClick={() => setSubmitOpen(true)}>Submit inspection report</Button>
              )}
              <Button variant="ghost" onClick={() => setShowReport(false)}>
                Close
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setShowReport(false)}>
              Close
            </Button>
          )}
        </Card>
      ) : null}

      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit inspection report?</DialogTitle>
          </DialogHeader>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>The inspection will be marked as completed.</li>
            <li>The report will become available to the client.</li>
            <li>Your inspection payout will become eligible for processing according to Fanecto&apos;s payout terms.</li>
            <li>Submitted information is treated as the final report.</li>
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitOpen(false)}>
              Go back
            </Button>
            <Button onClick={handleSubmit}>Submit report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
