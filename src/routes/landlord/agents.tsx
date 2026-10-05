import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { FanectoVerifiedBadge } from "@/components/fanecto/badges";
import { EmptyState } from "@/components/fanecto/empty-state";
import { PageHeader } from "@/components/fanecto/page-header";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/landlord/agents")({
  component: () => (
    <RoleGate allow={["landlord"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const user = useCurrentFanectoUser();
  const authz = useFanecto((s) => s.authorizations.filter((a) => a.landlordId === user?.id));
  const users = useFanecto((s) => s.users);
  const revokeAuthorization = useFanecto((s) => s.revokeAuthorization);
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="People"
        title="Agents"
        description="Authorising an agent is optional. Only verified agents can publish. Revoking stops future management but keeps history."
        actions={
          <Button asChild variant="outline">
            <Link to="/landlord/agreements">Agreements</Link>
          </Button>
        }
      />
      {authz.length === 0 ? (
        <EmptyState
          title="No agents authorised."
          body="You can list homes yourself. If you want help, draft an agreement with a verified agent."
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {authz.map((a) => {
            const agent = users.find((u) => u.id === a.agentId);
            if (!agent) return null;
            return (
              <li key={a.id} className="surface p-5">
                <div className="flex items-start gap-3">
                  <img src={agent.avatar} alt="" className="size-12 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="font-medium">{agent.displayName}</p>
                    <FanectoVerifiedBadge user={agent} />
                    <p className="mt-1 text-xs text-muted-foreground">Status: {a.status}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/landlord/agreements">Open agreements</Link>
                  </Button>
                  {a.status === "active" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        revokeAuthorization(a.id);
                        toast.message("Authorisation revoked. Existing chats remain in history.");
                      }}
                    >
                      Revoke
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
