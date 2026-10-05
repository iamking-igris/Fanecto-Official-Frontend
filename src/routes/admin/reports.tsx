import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/fanecto/empty-state";
import { PageHeader } from "@/components/fanecto/page-header";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/admin/reports")({
  component: () => (
    <RoleGate allow={["admin"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const reports = useFanecto((s) => s.reports);
  const adminResolveReport = useFanecto((s) => s.adminResolveReport);
  return (
    <div className="space-y-6">
      <PageHeader
        invert
        kicker="Flags"
        title="Reports"
        description="User-submitted flags on listings, people or chats. Resolution is audited."
      />
      {reports.length === 0 ? (
        <EmptyState title="No reports." body="Flags from the marketplace will queue here." />
      ) : (
        <ul className="space-y-3">
          {reports.map((r) => (
            <li key={r.id} className="surface-ops p-4 text-sm">
              <p className="font-medium">
                {r.targetType} · {r.status}
              </p>
              <p className="mt-1 text-ops-foreground/70">{r.reason}</p>
              {r.status === "open" || r.status === "reviewing" ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => adminResolveReport(r.id, "Resolved in demo", "resolved")}>
                    Resolve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => adminResolveReport(r.id, "Dismissed", "dismissed")}>
                    Dismiss
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
