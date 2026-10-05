import { createFileRoute } from "@tanstack/react-router";
import { ProfilePanel } from "@/components/fanecto/profile-panel";
import { RoleGate } from "@/components/layout/role-gate";

export const Route = createFileRoute("/landlord/profile")({
  component: () => (
    <RoleGate allow={["landlord"]}>
      <ProfilePanel />
    </RoleGate>
  ),
});
