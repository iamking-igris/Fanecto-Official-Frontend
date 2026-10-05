import { AppShell } from "@/components/layout/app-shell";
import { PublicShell } from "@/components/layout/public-shell";
import { useCurrentFanectoUser } from "@/lib/fanecto/store";
import type { Role } from "@/lib/fanecto/types";

/**
 * Uses authenticated AppShell when the signed-in role is allowed,
 * otherwise PublicShell. Keeps discovery pages usable by guests
 * while students/seekers stay inside their workspace chrome.
 */
export function SmartShell({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const user = useCurrentFanectoUser();
  if (user && allow.includes(user.role)) {
    return <AppShell role={user.role}>{children}</AppShell>;
  }
  return <PublicShell>{children}</PublicShell>;
}
