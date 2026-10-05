import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/fanecto/empty-state";
import { PageHeader } from "@/components/fanecto/page-header";
import { InspectionPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
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
  const props = useFanecto((s) => s.properties.filter((p) => p.agentId === user?.id));
  const inspections = useFanecto((s) => s.inspections.filter((i) => props.some((p) => p.id === i.propertyId)));
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Listings"
        title="Inspections"
        description="Visits on homes you manage. The inspector is paid 80% after completion; Fanecto keeps 20%."
      />
      {inspections.length === 0 ? (
        <EmptyState title="No inspections on your listings." body="When a seeker books a visit, it will appear here." />
      ) : (
        <ul className="space-y-3">
          {inspections.map((i) => {
            const p = props.find((x) => x.id === i.propertyId);
            return (
              <li key={i.id} className="surface lift flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <Link to="/properties/$id" params={{ id: p?.id ?? "" }} className="font-medium hover:text-primary">
                    {p?.title ?? i.propertyId}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {formatNaira(i.fee)}
                    {i.scheduledAt ? ` · ${formatDateTime(i.scheduledAt)}` : ""}
                  </p>
                </div>
                <InspectionPill status={i.status} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
