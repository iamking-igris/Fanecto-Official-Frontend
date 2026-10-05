import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/fanecto/page-header";
import { WeekToggle } from "@/components/fanecto/kit";
import { RoleGate } from "@/components/layout/role-gate";
import { Switch } from "@/components/ui/switch";
import { useCurrentFanectoUser } from "@/lib/fanecto/store";

export const Route = createFileRoute("/agent/availability")({
  component: () => (
    <RoleGate allow={["agent"]}>
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
        description="Let seekers know you are taking new enquiries this week. This is a signal, not a booking system."
      />
      <div className="surface p-5">
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>{on ? "Accepting enquiries" : "Away"}</span>
          <Switch checked={on} onCheckedChange={setOn} />
        </label>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">This week</p>
        <div className="mt-3">
          <WeekToggle value={days} onChange={setDays} />
        </div>
        {user?.serviceAreas?.length ? (
          <p className="mt-4 text-sm text-muted-foreground">Areas: {user.serviceAreas.join(", ")}</p>
        ) : null}
      </div>
    </div>
  );
}
