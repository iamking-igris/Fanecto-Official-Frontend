import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/fanecto/page-header";
import { Section, SoftItem, SoftList, StatCard } from "@/components/fanecto/kit";
import { PropertyPill, VerificationPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";
import type { Payment } from "@/lib/fanecto/types";

export const Route = createFileRoute("/landlord/")({ component: LandlordHome });

function LandlordHome() {
  return (
    <RoleGate allow={["landlord"]}>
      <View />
    </RoleGate>
  );
}

function View() {
  const user = useCurrentFanectoUser();
  const properties = useFanecto((s) => s.properties.filter((p) => p.landlordId === user?.id));
  const enquiries = useFanecto((s) =>
    s.conversations.filter((c) => c.context === "rental" && c.participantIds.includes(user?.id ?? "")),
  );
  const inspections = useFanecto((s) =>
    s.inspections.filter((i) => properties.some((p) => p.id === i.propertyId)),
  );
  const agreements = useFanecto((s) => s.agreements.filter((a) => a.landlordId === user?.id));
  const captured = useFanecto((s) =>
    s.payments.filter(
      (p): p is Extract<Payment, { kind: "rental" }> => p.kind === "rental" && p.landlordId === user?.id,
    ),
  );
  const gross = captured.reduce((a, p) => a + p.grossRent, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Landlord"
        title={`Hello, ${user?.firstName}.`}
        description="List directly. Agents are optional. Fanecto Verified is awarded separately from identity verification."
        actions={
          <Button asChild>
            <Link to="/landlord/properties/new">List a property</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Verification</span>
        <VerificationPill status={user?.verificationStatus ?? "unverified"} />
        {user?.verificationStatus !== "verified" ? (
          <Button asChild size="sm" variant="outline">
            <Link to="/landlord/verification">Complete verification</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Properties" value={properties.length} href="/landlord/properties" />
        <StatCard label="Enquiries" value={enquiries.length} href="/landlord/messages" />
        <StatCard label="Inspections" value={inspections.length} href="/landlord/inspections" />
        <StatCard label="Rent captured" value={formatNaira(gross)} href="/landlord/payments" />
      </div>

      <Section
        title="Your listings"
        action={
          <Link to="/landlord/properties" className="text-sm text-primary">
            Manage
          </Link>
        }
      >
        <SoftList>
          {properties.map((p) => (
            <SoftItem key={p.id}>
              <Link to="/properties/$id" params={{ id: p.id }} className="min-w-0">
                <p className="truncate text-sm font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {p.area} · {formatNaira(p.annualRent)}
                </p>
              </Link>
              <PropertyPill status={p.status} />
            </SoftItem>
          ))}
        </SoftList>
      </Section>

      <Section
        title="Agent agreements"
        action={
          <Link to="/landlord/agreements" className="text-sm text-primary">
            All
          </Link>
        }
      >
        <ul className="space-y-2 text-sm">
          {agreements.map((a) => (
            <li key={a.id} className="surface px-4 py-3">
              {a.commissionValue}
              {a.commissionType === "percent" ? "%" : ""} · {a.status}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
