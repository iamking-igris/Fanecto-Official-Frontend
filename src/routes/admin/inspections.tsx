import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/fanecto/page-header";
import { InspectionPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { formatNaira } from "@/lib/fanecto/format";
import { useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/admin/inspections")({
  component: () => (
    <RoleGate allow={["admin"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const inspections = useFanecto((s) => s.inspections);
  const properties = useFanecto((s) => s.properties);
  const users = useFanecto((s) => s.users);
  return (
    <div className="space-y-6">
      <PageHeader
        invert
        kicker="Trust"
        title="Inspections"
        description="Physical visits across the marketplace. Reports are observation, not legal title."
      />
      <ul className="space-y-2">
        {inspections.map((i) => {
          const p = properties.find((x) => x.id === i.propertyId);
          const inspector = users.find((u) => u.id === i.inspectorId);
          return (
            <li key={i.id} className="surface-ops flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <div className="min-w-0">
                <Link to="/properties/$id" params={{ id: i.propertyId }} className="font-medium hover:underline">
                  {p?.title ?? i.propertyId}
                </Link>
                <p className="text-xs text-ops-foreground/50">
                  {inspector?.displayName} · {formatNaira(i.fee)} · chat {i.chatUnlocked ? "open" : "locked"}
                </p>
              </div>
              <InspectionPill status={i.status} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
