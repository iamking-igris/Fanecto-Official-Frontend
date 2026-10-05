import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/fanecto/empty-state";
import { PageHeader } from "@/components/fanecto/page-header";
import { PropertyCard } from "@/components/fanecto/property-card";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/saved")({ component: SavedRoute });

function SavedRoute() {
  return (
    <RoleGate allow={["student", "seeker"]}>
      <SavedPage />
    </RoleGate>
  );
}

function SavedPage() {
  const saved = useFanecto((s) => s.properties.filter((p) => s.savedIds.includes(p.id)));
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Shortlist"
        title="Saved homes"
        description="Hearts live on this device in the demo. Open a listing when you are ready to inspect."
      />
      {saved.length === 0 ? (
        <EmptyState
          title="Nothing saved yet."
          body="Tap the heart on a listing to keep it here. Saved homes stay on this device in the demo."
          action={
            <Button asChild>
              <Link to="/properties">Browse homes</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}
