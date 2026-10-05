import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/fanecto/empty-state";
import { PageHeader } from "@/components/fanecto/page-header";
import { InspectionPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { formatDate } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/inspector/reports")({
  component: () => (
    <RoleGate allow={["inspector"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const user = useCurrentFanectoUser();
  const properties = useFanecto((s) => s.properties);
  const reports = useFanecto((s) => s.inspections.filter((i) => i.inspectorId === user?.id && i.report));
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Evidence"
        title="Reports"
        description="Physical observation only. These notes do not prove legal ownership or that utilities will stay on."
      />
      {reports.length === 0 ? (
        <EmptyState title="No reports filed yet." body="Complete a visit and write what you physically observed." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {reports.map((i) => {
            const p = properties.find((x) => x.id === i.propertyId);
            return (
              <li key={i.id}>
                <Link
                  to="/inspector/inspections/$id"
                  params={{ id: i.id }}
                  className="surface lift block h-full p-5"
                >
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{p?.area}</p>
                  <h2 className="mt-1 font-display text-xl font-medium">{p?.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{i.report?.conditionSummary}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <InspectionPill status={i.status} />
                    {i.report?.completedAt ? (
                      <span className="text-xs text-muted-foreground">{formatDate(i.report.completedAt)}</span>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
