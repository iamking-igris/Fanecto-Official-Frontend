import { createFileRoute } from "@tanstack/react-router";
import { Inbox } from "@/components/fanecto/inbox";
import { PageHeader } from "@/components/fanecto/page-header";
import { RoleGate } from "@/components/layout/role-gate";
import { z } from "zod";

const searchSchema = z.object({ c: z.string().optional() });

export const Route = createFileRoute("/landlord/messages")({
  component: Page,
  validateSearch: searchSchema,
});

function Page() {
  const { c } = Route.useSearch();
  return (
    <RoleGate allow={["landlord"]}>
      <div className="space-y-5">
        <PageHeader
          kicker="Inbox"
          title="Messages"
          description="Property inquiries stay linked to the listing. Repeated attempts to move rent off Fanecto are warned."
        />
        <Inbox initialId={c} />
      </div>
    </RoleGate>
  );
}
