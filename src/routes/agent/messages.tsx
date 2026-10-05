import { createFileRoute } from "@tanstack/react-router";
import { Inbox } from "@/components/fanecto/inbox";
import { PageHeader } from "@/components/fanecto/page-header";
import { RoleGate } from "@/components/layout/role-gate";

export const Route = createFileRoute("/agent/messages")({
  component: () => (
    <RoleGate allow={["agent"]}>
      <div className="space-y-5">
        <PageHeader
          kicker="Inbox"
          title="Messages"
          description="Leads stay attached to the home you manage. Commission is negotiated in agreements — not in chat."
        />
        <Inbox />
      </div>
    </RoleGate>
  ),
});
