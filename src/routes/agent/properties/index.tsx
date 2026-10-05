import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/fanecto/empty-state";
import { PageHeader } from "@/components/fanecto/page-header";
import { PropertyPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/agent/properties/")({
  component: () => (
    <RoleGate allow={["agent"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const user = useCurrentFanectoUser();
  const rows = useFanecto((s) => s.properties.filter((p) => p.agentId === user?.id));
  const canPublish = user?.verificationStatus === "verified" && user.accountStatus === "active";
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Inventory"
        title="Listings you manage"
        description="You publish only when verified and authorised by a landlord. No agent subscription plans."
        actions={
          canPublish ? (
            <Button asChild>
              <Link to="/agent/properties/new">New listing</Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link to="/agent/verification">Verification required</Link>
            </Button>
          )
        }
      />
      {rows.length === 0 ? (
        <EmptyState title="No managed listings." body="Ask a landlord to authorise you, then publish a home." />
      ) : (
        <ul className="space-y-3">
          {rows.map((p) => (
            <li key={p.id} className="surface flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <img src={p.images[0]} alt="" className="hidden size-14 rounded-lg object-cover sm:block" />
                <div className="min-w-0">
                  <Link to="/properties/$id" params={{ id: p.id }} className="font-medium hover:text-primary">
                    {p.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {p.area} · {formatNaira(p.annualRent)}
                  </p>
                </div>
              </div>
              <PropertyPill status={p.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
