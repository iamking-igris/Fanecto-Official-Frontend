import { createFileRoute, Link } from "@tanstack/react-router";
import { FanectoVerifiedBadge } from "@/components/fanecto/badges";
import { PageHeader } from "@/components/fanecto/page-header";
import { Section, SoftItem, SoftList, StatCard } from "@/components/fanecto/kit";
import { PropertyPill, VerificationPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { formatNaira, relativeTime } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/agent/")({
  component: () => (
    <RoleGate allow={["agent"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const user = useCurrentFanectoUser();
  const listings = useFanecto((s) => s.properties.filter((p) => p.agentId === user?.id));
  const leads = useFanecto((s) =>
    s.conversations.filter((c) => c.context === "rental" && c.participantIds.includes(user?.id ?? "")),
  );
  const agreements = useFanecto((s) => s.agreements.filter((a) => a.agentId === user?.id));
  const canPublish = user?.verificationStatus === "verified" && user.accountStatus === "active";

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Agent workspace"
        title={user?.displayName ?? "Agent"}
        description="No subscription plans. You publish only when verified and authorised by a landlord. Commission is negotiated on Fanecto."
        actions={
          canPublish ? (
            <Button asChild>
              <Link to="/agent/properties/new">New listing</Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link to="/agent/verification">Verification required</Link>
            </Button>
          )
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <FanectoVerifiedBadge user={user} />
        <VerificationPill status={user?.verificationStatus ?? "unverified"} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Listings" value={listings.length} href="/agent/properties" />
        <StatCard label="Open leads" value={leads.length} href="/agent/leads" />
        <StatCard label="Agreements" value={agreements.length} href="/agent/agreements" />
      </div>

      <Section
        title="Leads"
        action={
          <Link to="/agent/leads" className="text-sm text-primary">
            All leads
          </Link>
        }
      >
        <ul className="space-y-2">
          {leads.slice(0, 4).map((c) => (
            <li key={c.id} className="surface flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{c.title}</p>
                <p className="text-xs text-muted-foreground">{relativeTime(c.updatedAt)}</p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link to="/agent/messages">Open</Link>
              </Button>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Managed inventory">
        <SoftList>
          {listings.map((p) => (
            <SoftItem key={p.id}>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">{formatNaira(p.annualRent)}</p>
              </div>
              <PropertyPill status={p.status} />
            </SoftItem>
          ))}
        </SoftList>
      </Section>
    </div>
  );
}
