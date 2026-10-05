import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/fanecto/empty-state";
import { PageHeader } from "@/components/fanecto/page-header";
import { RoleGate } from "@/components/layout/role-gate";
import { formatDateTime } from "@/lib/fanecto/format";
import { useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/admin/audit-logs")({
  component: () => (
    <RoleGate allow={["admin"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const logs = useFanecto((s) => s.auditLogs);
  const users = useFanecto((s) => s.users);
  return (
    <div className="space-y-6">
      <PageHeader
        invert
        kicker="Trace"
        title="Audit logs"
        description="Every verification, suspension and settlement in this demo is recorded with a reason."
      />
      {logs.length === 0 ? (
        <EmptyState title="No audit events yet." body="Actions from this console will appear here." />
      ) : (
        <ul className="space-y-2">
          {logs.map((l) => (
            <li key={l.id} className="surface-ops p-4 text-sm">
              <p>
                {formatDateTime(l.createdAt)} · {users.find((u) => u.id === l.actorId)?.displayName ?? l.actorId}
              </p>
              <p className="text-ops-foreground/70">
                {l.action} → {l.target}
              </p>
              {l.reason ? <p className="mt-1 text-xs text-ops-foreground/50">{l.reason}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
