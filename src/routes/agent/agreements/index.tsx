import { createFileRoute } from "@tanstack/react-router";
import { AgreementList } from "@/components/fanecto/agreement-view";
import { RoleGate } from "@/components/layout/role-gate";

export const Route = createFileRoute("/agent/agreements/")({
  component: () => (
    <RoleGate allow={["agent"]}>
      <AgreementList role="agent" />
    </RoleGate>
  ),
});
