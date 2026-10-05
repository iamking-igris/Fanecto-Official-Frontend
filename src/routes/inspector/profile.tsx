import { createFileRoute } from "@tanstack/react-router";
import { ProfilePanel } from "@/components/fanecto/profile-panel";
import { RoleGate } from "@/components/layout/role-gate";

export const Route = createFileRoute("/inspector/profile")({
  component: () => (
    <RoleGate allow={["inspector"]}>
      <ProfilePanel />
    </RoleGate>
  ),
});
