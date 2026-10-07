import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/fanecto/page-header";
import { InspectionPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime, formatNaira, inspectionSplit } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";
import type { InspectionStatus } from "@/lib/fanecto/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inspector/inspections/")({
  component: () => (
    <RoleGate allow={["inspector"]}>
      <View />
    </RoleGate>
  ),
});

type Filter = "all" | "new" | "awaiting_auth" | "upcoming" | "completed" | "declined";

function View() {
  const user = useCurrentFanectoUser();
  const [filter, setFilter] = useState<Filter>("all");
  const properties = useFanecto((s) => s.properties);
  const users = useFanecto((s) => s.users);
  const inspections = useFanecto((s) => s.inspections.filter((i) => i.inspectorId === user?.id));

  const filtered = useMemo(() => {
    return inspections.filter((i) => {
      if (filter === "new") return ["awaiting_confirmation", "paid", "requested"].includes(i.status);
      if (filter === "awaiting_auth") return i.status === "awaiting_property_authorization";
      if (filter === "upcoming") return ["confirmed", "scheduled", "in_progress"].includes(i.status);
      if (filter === "completed")
        return ["report_ready", "completed", "settlement_pending", "settled"].includes(i.status);
      if (filter === "declined") return ["declined", "access_declined", "cancelled"].includes(i.status);
      return true;
    });
  }, [inspections, filter]);

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "new", label: "New" },
    { id: "awaiting_auth", label: "Awaiting auth" },
    { id: "upcoming", label: "Upcoming" },
    { id: "completed", label: "Completed" },
    { id: "declined", label: "Declined" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Jobs"
        title="Inspection requests"
        description="Accept or decline paid requests. Submit a report only after the physical visit. Payout becomes eligible after report submission."
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={cn(
              "min-h-10 rounded-full px-4 text-sm font-medium transition-colors",
              filter === t.id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No inspections in this filter.</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((i) => {
            const p = properties.find((x) => x.id === i.propertyId);
            const client = users.find((u) => u.id === i.seekerId);
            const split = inspectionSplit(i.fee);
            return (
              <Card key={i.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{p?.title ?? i.id}</p>
                      <InspectionPill status={i.status as InspectionStatus} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {p?.area} · {client?.displayName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {i.scheduledAt ? formatDateTime(i.scheduledAt) : "Schedule TBC"}
                    </p>
                    <p className="mt-1 text-sm tabular-nums">
                      {formatNaira(i.fee)} inspection · You {formatNaira(split.inspector)} after 20%
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link to="/inspector/inspections/$id" params={{ id: i.id }}>
                      View
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </ul>
      )}
    </div>
  );
}
