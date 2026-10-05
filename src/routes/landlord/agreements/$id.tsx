import { createFileRoute } from "@tanstack/react-router";
import { AgreementDetail } from "@/components/fanecto/agreement-view";
import { RoleGate } from "@/components/layout/role-gate";

export const Route = createFileRoute("/landlord/agreements/$id")({
  component: function Comp() {
    const { id } = Route.useParams();
    return (
      <RoleGate allow={["landlord"]}>
        <AgreementDetail id={id} role="landlord" />
      </RoleGate>
    );
  },
});
