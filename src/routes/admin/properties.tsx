import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/fanecto/page-header";
import { PropertyPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { formatNaira } from "@/lib/fanecto/format";
import { useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/admin/properties")({
  component: () => (
    <RoleGate allow={["admin"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const properties = useFanecto((s) => s.properties);
  const users = useFanecto((s) => s.users);
  return (
    <div className="space-y-6">
      <PageHeader
        invert
        kicker="Marketplace"
        title="Properties"
        description="All inventory, including drafts and rented homes. Public search only shows published listings."
      />
      <ul className="space-y-2">
        {properties.map((p) => (
          <li key={p.id} className="surface-ops flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <div className="min-w-0">
              <Link to="/properties/$id" params={{ id: p.id }} className="font-medium hover:underline">
                {p.title}
              </Link>
              <p className="text-xs text-ops-foreground/50">
                {p.area} · {formatNaira(p.annualRent)} · {users.find((u) => u.id === p.landlordId)?.displayName}
                {p.agentId ? ` · ${users.find((u) => u.id === p.agentId)?.displayName}` : ""}
              </p>
            </div>
            <PropertyPill status={p.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}
