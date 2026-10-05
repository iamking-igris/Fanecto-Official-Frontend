import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/fanecto/page-header";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { useFanecto } from "@/lib/fanecto/store";

const LOCKED = [
  { label: "Rental platform fee", value: "5% of gross rent, shown before capture" },
  { label: "Inspection split", value: "20% Fanecto / 80% inspector after completion" },
  { label: "Roommate connection", value: "₦3,000 paid by the person who wants to connect" },
  { label: "Agent subscriptions", value: "Not part of the product" },
  { label: "Payment provider", value: "Open decision — mock captures only" },
];

export const Route = createFileRoute("/admin/settings")({
  component: () => (
    <RoleGate allow={["admin"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const resetDemo = useFanecto((s) => s.resetDemo);
  return (
    <div className="max-w-xl space-y-6">
      <PageHeader
        invert
        kicker="Operations"
        title="Settings"
        description="Fees are locked product rules. This console does not let operations rewrite them."
      />
      <ul className="space-y-2">
        {LOCKED.map((row) => (
          <li key={row.label} className="surface-ops px-4 py-3">
            <p className="text-sm font-medium">{row.label}</p>
            <p className="text-xs text-ops-foreground/60">{row.value}</p>
          </li>
        ))}
      </ul>
      <div className="surface-ops p-5">
        <p className="text-sm">Reset demo data</p>
        <p className="mt-1 text-xs text-ops-foreground/60">
          Restores seed listings, inspections, chats and payments on this device.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => resetDemo()}>
          Reset demo data
        </Button>
      </div>
    </div>
  );
}
