import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/fanecto/empty-state";
import { PageHeader } from "@/components/fanecto/page-header";
import { InspectionPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { formatDateTime, formatNaira } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/inspector/inspections/")({
  component: () => (
    <RoleGate allow={["inspector"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const user = useCurrentFanectoUser();
  const inspections = useFanecto((s) => s.inspections.filter((i) => i.inspectorId === user?.id));
  const properties = useFanecto((s) => s.properties);
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Jobs"
        title="Inspections"
        description="Chat unlocks after the seeker pays. File a physical-observation report after the visit."
      />
      {inspections.length === 0 ? (
        <EmptyState title="No jobs assigned." body="When a seeker books you, the visit will appear here." />
      ) : (
        <ul className="space-y-3">
          {inspections.map((i) => {
            const p = properties.find((x) => x.id === i.propertyId);
            return (
              <li key={i.id}>
                <Link
                  to="/inspector/inspections/$id"
                  params={{ id: i.id }}
                  className="surface lift flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNaira(i.fee)} · chat {i.chatUnlocked ? "unlocked" : "locked"}
                      {i.scheduledAt ? ` · ${formatDateTime(i.scheduledAt)}` : ""}
                    </p>
                  </div>
                  <InspectionPill status={i.status} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
