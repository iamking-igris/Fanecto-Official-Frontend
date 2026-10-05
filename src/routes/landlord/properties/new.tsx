import { createFileRoute } from "@tanstack/react-router";
import { ListingWizard } from "@/components/fanecto/listing-wizard";
import { RoleGate } from "@/components/layout/role-gate";

export const Route = createFileRoute("/landlord/properties/new")({
  component: () => (
    <RoleGate allow={["landlord"]}>
      <ListingWizard mode="landlord" />
    </RoleGate>
  ),
});
