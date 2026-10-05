import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { useCurrentFanectoUser } from "@/lib/fanecto/store";
import type { Role } from "@/lib/fanecto/types";

export function RoleGate({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const user = useCurrentFanectoUser();
  if (!user) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-lg px-4 py-20">
          <h1 className="font-display text-3xl">Sign in to continue</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This area is role-specific. Use the demo switcher or open the sign-in page to try a persona.
          </p>
          <Button asChild className="mt-6">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </PublicShell>
    );
  }
  if (!allow.includes(user.role)) {
    return (
      <AppShell role={user.role}>
        <h1 className="font-display text-3xl">This page isn’t for this role</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You’re signed in as {user.displayName}. Switch persona from the header to open another workspace.
        </p>
      </AppShell>
    );
  }
  return <AppShell role={user.role}>{children}</AppShell>;
}
