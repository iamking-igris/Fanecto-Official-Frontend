import { createFileRoute } from "@tanstack/react-router";
import { AgreementList } from "@/components/fanecto/agreement-view";
import { RoleGate } from "@/components/layout/role-gate";

export const Route = createFileRoute("/admin/agreements/")({
  component: () => (
    <RoleGate allow={["admin"]}>
      <AgreementList role="admin" />
    </RoleGate>
  ),
});
