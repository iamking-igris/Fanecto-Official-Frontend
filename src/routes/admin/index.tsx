import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/fanecto/page-header";
import { Section, StatCard } from "@/components/fanecto/kit";
import { RoleGate } from "@/components/layout/role-gate";
import { formatDateTime } from "@/lib/fanecto/format";
import { useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/admin/")({
  component: () => (
    <RoleGate allow={["admin"]}>
      <View />
    </RoleGate>
  ),
});

function View() {
  const users = useFanecto((s) => s.users);
  const properties = useFanecto((s) => s.properties);
  const pendingVer = useFanecto((s) => s.users.filter((u) => u.verificationStatus === "pending"));
  const inspections = useFanecto((s) =>
    s.inspections.filter((i) => ["paid", "scheduled", "in_progress", "disputed"].includes(i.status)),
  );
  const payIssues = useFanecto((s) =>
    s.payments.filter((p) => ["disputed", "failed", "settlement_pending"].includes(p.status)),
  );
  const reports = useFanecto((s) => s.reports.filter((r) => r.status === "open" || r.status === "reviewing"));
  const suspensions = useFanecto((s) => s.suspensions.filter((x) => x.status === "active"));
  const audit = useFanecto((s) => s.auditLogs.slice(0, 6));
  const auditCount = useFanecto((s) => s.auditLogs.length);

  return (
    <div className="space-y-8">
      <PageHeader
        invert
        kicker="Operations"
        title="Fanecto control"
        description="Internal console. Identity data stays private. Fanecto Verified is awarded here, not bought."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard invert label="Users" value={users.length} href="/admin/users" />
        <StatCard invert label="Properties" value={properties.length} href="/admin/properties" />
        <StatCard invert label="Pending verification" value={pendingVer.length} href="/admin/verification" />
        <StatCard invert label="Active inspections" value={inspections.length} href="/admin/inspections" />
        <StatCard invert label="Payment issues" value={payIssues.length} href="/admin/payments" />
        <StatCard invert label="Open reports" value={reports.length} href="/admin/reports" />
        <StatCard invert label="Suspensions" value={suspensions.length} href="/admin/suspensions" />
        <StatCard invert label="Audit events" value={auditCount} href="/admin/audit-logs" />
      </div>
      <Section title="Recent audit">
        <ul className="space-y-2">
          {audit.map((a) => (
            <li key={a.id} className="surface-ops px-4 py-3 text-sm text-ops-foreground/80">
              {formatDateTime(a.createdAt)} · {a.action} · {a.target}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
