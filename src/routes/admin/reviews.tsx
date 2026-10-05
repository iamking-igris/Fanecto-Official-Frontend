import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/fanecto/page-header";
import { Stars } from "@/components/fanecto/stars";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/admin/reviews")({
  component: () => (
    <RoleGate allow={["admin"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const reviews = useFanecto((s) => s.reviews);
  const users = useFanecto((s) => s.users);
  const adminHideReview = useFanecto((s) => s.adminHideReview);
  return (
    <div className="space-y-6">
      <PageHeader
        invert
        kicker="Reputation"
        title="Reviews"
        description="One review per completed rental or inspection. Roommate listings have no reviews."
      />
      <ul className="space-y-3">
        {reviews.map((r) => (
          <li key={r.id} className="surface-ops p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Stars value={r.rating} />
              <p className="text-xs text-ops-foreground/50">
                {r.targetRole} · {users.find((u) => u.id === r.targetUserId)?.displayName} · {r.status}
              </p>
            </div>
            <p className="mt-2 text-sm">{r.text}</p>
            {r.status === "visible" ? (
              <Button size="sm" variant="outline" className="mt-3" onClick={() => adminHideReview(r.id)}>
                Hide
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
