import { createFileRoute } from "@tanstack/react-router";
import { AgreementDetail } from "@/components/fanecto/agreement-view";
import { RoleGate } from "@/components/layout/role-gate";

export const Route = createFileRoute("/agent/agreements/$id")({
  component: function Comp() {
    const { id } = Route.useParams();
    return (
      <RoleGate allow={["agent"]}>
        <AgreementDetail id={id} role="agent" />
      </RoleGate>
    );
  },
});
