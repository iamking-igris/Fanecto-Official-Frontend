import { createFileRoute } from "@tanstack/react-router";
import { ProfilePanel } from "@/components/fanecto/profile-panel";
import { RoleGate } from "@/components/layout/role-gate";

export const Route = createFileRoute("/agent/profile")({
  component: () => (
    <RoleGate allow={["agent"]}>
      <ProfilePanel />
    </RoleGate>
  ),
});
