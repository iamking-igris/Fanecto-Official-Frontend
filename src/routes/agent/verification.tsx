import { createFileRoute } from "@tanstack/react-router";
import { VerificationPanel } from "@/components/fanecto/verification-panel";
import { RoleGate } from "@/components/layout/role-gate";

export const Route = createFileRoute("/agent/verification")({
  component: () => (
    <RoleGate allow={["agent"]}>
      <VerificationPanel />
    </RoleGate>
  ),
});
