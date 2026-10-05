import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/fanecto/empty-state";
import { PageHeader } from "@/components/fanecto/page-header";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/admin/suspensions")({
  component: () => (
    <RoleGate allow={["admin"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const suspensions = useFanecto((s) => s.suspensions);
  const users = useFanecto((s) => s.users);
  const adminLift = useFanecto((s) => s.adminLift);
  return (
    <div className="space-y-6">
      <PageHeader
        invert
        kicker="Access"
        title="Suspensions"
        description="Restricted accounts cannot publish, inspect or receive new payouts until lifted."
      />
      {suspensions.length === 0 ? (
        <EmptyState title="No suspensions in this demo yet." body="Suspend a user from the Users queue to record one." />
      ) : (
        <ul className="space-y-3">
          {suspensions.map((s) => (
            <li key={s.id} className="surface-ops p-4 text-sm">
              <p>
                {users.find((u) => u.id === s.targetUserId)?.displayName} · {s.status}
              </p>
              <p className="text-ops-foreground/60">{s.reason}</p>
              {s.status === "active" ? (
                <Button size="sm" className="mt-3" onClick={() => adminLift(s.targetUserId)}>
                  Lift
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
