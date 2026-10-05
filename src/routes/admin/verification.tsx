import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/fanecto/page-header";
import { ReasonDialog } from "@/components/fanecto/reason-dialog";
import { VerificationPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { ROLE_LABEL } from "@/lib/fanecto/constants";
import { useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/admin/verification")({
  component: () => (
    <RoleGate allow={["admin"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const users = useFanecto((s) =>
    s.users.filter((u) => ["pending", "rejected", "verified"].includes(u.verificationStatus)),
  );
  const records = useFanecto((s) => s.verifications);
  const adminSetVerification = useFanecto((s) => s.adminSetVerification);
  const adminToggleFanectoVerified = useFanecto((s) => s.adminToggleFanectoVerified);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [badgeId, setBadgeId] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      <PageHeader
        invert
        kicker="Trust"
        title="Verification queue"
        description="National ID remains private. Approving verification is not the same as awarding Fanecto Verified."
      />
      <ul className="space-y-3">
        {users.map((u) => {
          const rec = records.find((r) => r.userId === u.id);
          return (
            <li key={u.id} className="surface-ops p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {u.displayName} · {ROLE_LABEL[u.role]}
                  </p>
                  <div className="mt-1">
                    <VerificationPill status={u.verificationStatus} />
                  </div>
                  <p className="mt-2 text-xs text-ops-foreground/50">
                    ID on file: {rec?.hasIdOnFile ? "yes (hidden)" : "no"} · Phone on file:{" "}
                    {rec?.phoneOnFile ? "yes" : "no"}
                  </p>
                  {rec?.reason ? <p className="text-xs text-destructive">{rec.reason}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => adminSetVerification(u.id, "verified")}>
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setRejectId(u.id)}>
                    Reject / resubmit
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setBadgeId(u.id)}>
                    {u.fanectoVerified ? "Revoke badge" : "Award Fanecto Verified"}
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <ReasonDialog
        open={Boolean(rejectId)}
        onOpenChange={() => setRejectId(null)}
        title="Reject verification"
        description="Explain what to resubmit. Never display ID numbers in public UI."
        onConfirm={(reason) => rejectId && adminSetVerification(rejectId, "rejected", reason)}
      />
      <ReasonDialog
        open={Boolean(badgeId)}
        onOpenChange={() => setBadgeId(null)}
        title="Fanecto Verified"
        description="This designation is discretionary. Record why it is awarded or revoked."
        onConfirm={(reason) => {
          if (!badgeId) return;
          const u = useFanecto.getState().users.find((x) => x.id === badgeId);
          adminToggleFanectoVerified(badgeId, !u?.fanectoVerified, reason);
        }}
      />
    </div>
  );
}
