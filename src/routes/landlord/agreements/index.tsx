import { createFileRoute } from "@tanstack/react-router";
import { AgreementList } from "@/components/fanecto/agreement-view";
import { RoleGate } from "@/components/layout/role-gate";

export const Route = createFileRoute("/landlord/agreements/")({
  component: () => (
    <RoleGate allow={["landlord"]}>
      <AgreementList role="landlord" />
    </RoleGate>
  ),
});
