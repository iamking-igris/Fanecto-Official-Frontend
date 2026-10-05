import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/fanecto/empty-state";
import { PageHeader } from "@/components/fanecto/page-header";
import { InspectionPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { formatDateTime, formatNaira } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/landlord/inspections")({ component: Page });

function Page() {
  return (
    <RoleGate allow={["landlord"]}>
      <View />
    </RoleGate>
  );
}

function View() {
  const user = useCurrentFanectoUser();
  const properties = useFanecto((s) => s.properties.filter((p) => p.landlordId === user?.id));
  const inspections = useFanecto((s) => s.inspections.filter((i) => properties.some((p) => p.id === i.propertyId)));
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Activity"
        title="Inspections on your homes"
        description="Seekers pay the inspector through Fanecto. You see the visit status; you do not receive the inspection fee."
      />
      {inspections.length === 0 ? (
        <EmptyState title="No inspections booked yet." body="When a seeker pays to visit one of your homes, it will list here." />
      ) : (
        <ul className="space-y-3">
          {inspections.map((i) => {
            const p = properties.find((x) => x.id === i.propertyId);
            return (
              <li key={i.id} className="surface lift flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <Link to="/properties/$id" params={{ id: p?.id ?? "" }} className="font-medium hover:text-primary">
                    {p?.title}
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
