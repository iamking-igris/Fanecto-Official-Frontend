import { createFileRoute } from "@tanstack/react-router";
import { Inbox } from "@/components/fanecto/inbox";
import { PageHeader } from "@/components/fanecto/page-header";
import { RoleGate } from "@/components/layout/role-gate";
import { z } from "zod";

const searchSchema = z.object({ c: z.string().optional() });

export const Route = createFileRoute("/messages")({
  component: MessagesRoute,
  validateSearch: searchSchema,
});

function MessagesRoute() {
  const { c } = Route.useSearch();
  return (
    <RoleGate allow={["student", "seeker"]}>
      <div className="space-y-5">
        <PageHeader
          kicker="Inbox"
          title="Messages"
          description="Rental chats stay on Fanecto because of the 5% fee. Inspection and roommate threads unlock contact sharing after payment."
        />
        <Inbox initialId={c} />
      </div>
    </RoleGate>
  );
}
