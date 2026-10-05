import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Inbox } from "@/components/fanecto/inbox";
import { InspectionPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime, formatNaira, inspectionSplit } from "@/lib/fanecto/format";
import { useFanecto } from "@/lib/fanecto/store";
import { INSPECTION_DISCLAIMER } from "@/lib/fanecto/types";
import { useState } from "react";

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

function View({ id }: { id: string }) {
  const inspection = useFanecto((s) => s.inspections.find((i) => i.id === id));
  const property = useFanecto((s) => s.properties.find((p) => p.id === inspection?.propertyId));
  const conv = useFanecto((s) => s.conversations.find((c) => c.inspectionId === id));
  const scheduleInspection = useFanecto((s) => s.scheduleInspection);
  const completeInspection = useFanecto((s) => s.completeInspection);
  const setInspectionStatus = useFanecto((s) => s.setInspectionStatus);
  const [summary, setSummary] = useState("Physical condition matches a lived-in, maintained unit.");
  const [utilities, setUtilities] = useState("Meter and water checked during the visit.");
  const [issues, setIssues] = useState("None beyond ordinary wear.");
  const [diff, setDiff] = useState("Photos are a fair representation unless noted.");
  if (!inspection || !property) return <p>Inspection not found.</p>;
  const split = inspectionSplit(inspection.fee);
  return (
    <div className="space-y-8">
      <div>
        <Link to="/inspector/inspections" className="text-sm text-muted-foreground">
          ← All jobs
        </Link>
        <h1 className="mt-2 font-display text-3xl">{property.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <InspectionPill status={inspection.status} />
          <span className="text-sm text-muted-foreground">
            Fee {formatNaira(inspection.fee)} · after completion {formatNaira(split.inspector)} to you /{" "}
            {formatNaira(split.fanecto)} Fanecto
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{INSPECTION_DISCLAIMER}</p>
      </div>

      {inspection.chatUnlocked ? (
        <section>
          <h2 className="mb-3 font-display text-2xl">Coordination</h2>
          {conv ? <Inbox initialId={conv.id} /> : <p className="text-sm">Chat unlocked — thread will appear here.</p>}
        </section>
      ) : (
        <p className="text-sm">Chat stays closed until the seeker pays.</p>
      )}

      <div className="flex flex-wrap gap-2">
        {inspection.status === "paid" ? (
          <Button
            onClick={() => {
              scheduleInspection(inspection.id, new Date(Date.now() + 86400000).toISOString());
              toast.success("Scheduled for tomorrow morning (demo).");
            }}
          >
            Schedule visit
          </Button>
        ) : null}
        {inspection.status === "scheduled" ? (
          <Button variant="outline" onClick={() => setInspectionStatus(inspection.id, "in_progress")}>
            Mark in progress
          </Button>
        ) : null}
        {["paid", "scheduled", "in_progress"].includes(inspection.status) ? (
          <Button variant="ghost" onClick={() => setInspectionStatus(inspection.id, "no_show")}>
            Mark no-show
          </Button>
        ) : null}
      </div>

      {["scheduled", "in_progress", "paid"].includes(inspection.status) ? (
        <form
          className="max-w-xl space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            completeInspection(inspection.id, {
              roomsChecked: ["Living", "Bedroom", "Kitchen", "Bathroom"],
              conditionSummary: summary,
              utilities,
              visibleIssues: [issues],
              listingVsObserved: diff,
              notes: "Report submitted from inspector workspace.",
              evidence: property.images.slice(0, 2),
              disclaimer: INSPECTION_DISCLAIMER,
              completedAt: new Date().toISOString(),
            });
            toast.success("Report submitted. Settlement moves to pending (20/80).");
          }}
        >
          <h2 className="font-display text-2xl">Physical observation report</h2>
          <div>
            <Label>Condition observations</Label>
            <Textarea className="mt-1.5" value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>
          <div>
            <Label>Utilities</Label>
            <Textarea className="mt-1.5" value={utilities} onChange={(e) => setUtilities(e.target.value)} />
          </div>
          <div>
            <Label>Visible issues</Label>
            <Input className="mt-1.5" value={issues} onChange={(e) => setIssues(e.target.value)} />
          </div>
          <div>
            <Label>Listing vs observed</Label>
            <Textarea className="mt-1.5" value={diff} onChange={(e) => setDiff(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">{INSPECTION_DISCLAIMER}</p>
          <Button type="submit">Submit report</Button>
        </form>
      ) : null}

      {inspection.report ? (
        <article className="max-w-xl rounded-xl bg-card p-4 text-sm shadow-[var(--shadow-border)]">
          <h2 className="font-medium">Submitted report</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {inspection.report.completedAt ? formatDateTime(inspection.report.completedAt) : null}
          </p>
          <p className="mt-3">{inspection.report.conditionSummary}</p>
          <p className="mt-2 text-muted-foreground">{inspection.report.utilities}</p>
          <p className="mt-2">Issues: {inspection.report.visibleIssues.join("; ")}</p>
          <p className="mt-2">{inspection.report.listingVsObserved}</p>
          <p className="mt-3 text-xs text-muted-foreground">{INSPECTION_DISCLAIMER}</p>
        </article>
      ) : null}
    </div>
  );
}
