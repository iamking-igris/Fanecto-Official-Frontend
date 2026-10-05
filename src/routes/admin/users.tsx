import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FanectoVerifiedBadge } from "@/components/fanecto/badges";
import { PageHeader } from "@/components/fanecto/page-header";
import { ReasonDialog } from "@/components/fanecto/reason-dialog";
import { VerificationPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROLE_LABEL } from "@/lib/fanecto/constants";
import { useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/admin/users")({
  component: () => (
    <RoleGate allow={["admin"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const users = useFanecto((s) => s.users);
  const adminSuspend = useFanecto((s) => s.adminSuspend);
  const adminLift = useFanecto((s) => s.adminLift);
  const [q, setQ] = useState("");
  const [target, setTarget] = useState<string | null>(null);
  const rows = useMemo(
    () => users.filter((u) => `${u.displayName} ${u.email} ${u.role}`.toLowerCase().includes(q.toLowerCase())),
    [users, q],
  );
  return (
    <div className="space-y-6">
      <PageHeader
        invert
        kicker="Directory"
        title="Users"
        description="Identity numbers stay private. Suspend with a reason — the action is audited."
      />
      <Input
        className="max-w-sm bg-ops-foreground/5"
        placeholder="Search name, email or role"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-ops-foreground/50">
            <tr>
              <th className="py-2">Name</th>
              <th>Role</th>
              <th>Verification</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-ops-foreground/10">
                <td className="py-3">
                  {u.displayName}
                  <div>
                    <FanectoVerifiedBadge user={u} compact />
                  </div>
                </td>
                <td>{ROLE_LABEL[u.role]}</td>
                <td>
                  <VerificationPill status={u.verificationStatus} />
                </td>
                <td className="text-right">
                  {u.accountStatus === "active" ? (
                    <Button size="sm" variant="outline" onClick={() => setTarget(u.id)}>
                      Suspend
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => adminLift(u.id)}>
                      Lift
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 md:hidden">
        {rows.map((u) => (
          <li key={u.id} className="surface-ops p-4">
            <p className="font-medium">{u.displayName}</p>
            <p className="text-xs text-ops-foreground/50">{ROLE_LABEL[u.role]}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <VerificationPill status={u.verificationStatus} />
              <FanectoVerifiedBadge user={u} compact />
            </div>
            <div className="mt-3">
              {u.accountStatus === "active" ? (
                <Button size="sm" variant="outline" onClick={() => setTarget(u.id)}>
                  Suspend
                </Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => adminLift(u.id)}>
                  Lift
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <ReasonDialog
        open={Boolean(target)}
        onOpenChange={() => setTarget(null)}
        title="Suspend account"
        description="Record a reason. This action is audited."
        confirmLabel="Suspend"
        onConfirm={(reason) => target && adminSuspend(target, reason)}
      />
    </div>
  );
}
