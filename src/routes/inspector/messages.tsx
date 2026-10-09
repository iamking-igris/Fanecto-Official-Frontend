import { createFileRoute } from "@tanstack/react-router";
import { Inbox } from "@/components/fanecto/inbox";
import { PageHeader } from "@/components/fanecto/page-header";
import { RoleGate } from "@/components/layout/role-gate";
import { z } from "zod";

const searchSchema = z.object({ c: z.string().optional() });

export const Route = createFileRoute("/inspector/messages")({
  component: () => (
    <RoleGate allow={["inspector"]}>
      <View />
    </RoleGate>
  ),
  validateSearch: searchSchema,
});

function View() {
  const { c } = Route.useSearch();
  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Inbox"
        title="Messages"
        description="Inspection chats unlock after the client pays. Keep the conversation linked to the job."
      />
      <Inbox initialId={c} />
    </div>
  );
}
