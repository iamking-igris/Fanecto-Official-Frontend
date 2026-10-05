import { createFileRoute } from "@tanstack/react-router";
import { ProfilePanel } from "@/components/fanecto/profile-panel";
import { RoleGate } from "@/components/layout/role-gate";

export const Route = createFileRoute("/profile")({ component: ProfileRoute });

function ProfileRoute() {
  return (
    <RoleGate allow={["student", "seeker"]}>
      <ProfilePanel />
    </RoleGate>
  );
}
