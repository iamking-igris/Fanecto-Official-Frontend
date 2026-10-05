import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/fanecto/empty-state";
import { PageHeader } from "@/components/fanecto/page-header";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { relativeTime } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/agent/leads")({
  component: () => (
    <RoleGate allow={["agent"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const user = useCurrentFanectoUser();
  const users = useFanecto((s) => s.users);
  const leads = useFanecto((s) =>
    s.conversations.filter((c) => c.context === "rental" && c.participantIds.includes(user?.id ?? "")),
  );
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Pipeline"
        title="Leads"
        description="Enquiries on homes you manage. Follow up in messages — do not move rent off Fanecto."
      />
      {leads.length === 0 ? (
        <EmptyState title="No open leads." body="When a seeker messages a listing you manage, it will appear here." />
      ) : (
        <ul className="space-y-3">
          {leads.map((c) => {
            const other = users.find((u) => c.participantIds.includes(u.id) && u.id !== user?.id);
            return (
              <li key={c.id} className="surface lift flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {other?.displayName} · {relativeTime(c.updatedAt)}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link to="/agent/messages">Open</Link>
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
