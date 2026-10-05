import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/fanecto/page-header";
import { WeekToggle } from "@/components/fanecto/kit";
import { RoleGate } from "@/components/layout/role-gate";
import { Switch } from "@/components/ui/switch";
import { formatNaira } from "@/lib/fanecto/format";
import { useCurrentFanectoUser } from "@/lib/fanecto/store";

export const Route = createFileRoute("/inspector/availability")({
  component: () => (
    <RoleGate allow={["inspector"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const user = useCurrentFanectoUser();
  const [on, setOn] = useState(true);
  const [days, setDays] = useState<Record<string, boolean>>({
    Mon: true,
    Tue: true,
    Wed: true,
    Thu: true,
    Fri: true,
    Sat: true,
    Sun: false,
  });
  return (
    <div className="max-w-xl space-y-6">
      <PageHeader
        kicker="Calendar"
        title="Availability"
        description="Open days for new inspection requests. Seekers still pay before chat unlocks."
      />
      <div className="surface p-5 space-y-4">
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>{on ? "Open for new inspections" : "Paused"}</span>
          <Switch checked={on} onCheckedChange={setOn} />
        </label>
        <p className="text-sm text-muted-foreground">
          Inspection fee on your profile: {formatNaira(user?.inspectionFee ?? 25000)}. After completion you receive 80%.
        </p>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">This week</p>
          <div className="mt-3">
            <WeekToggle value={days} onChange={setDays} />
          </div>
        </div>
        {user?.serviceAreas?.length ? (
          <p className="text-sm text-muted-foreground">Areas: {user.serviceAreas.join(", ")}</p>
        ) : null}
      </div>
    </div>
  );
}
