import { Link, useRouterState } from "@tanstack/react-router";
import {
  Banknote,
  ClipboardCheck,
  FileText,
  Handshake,
  Home,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Shield,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Logo } from "@/components/fanecto/logo";
import { NotificationCenter } from "@/components/fanecto/notification-center";
import { DemoSwitcher } from "@/components/layout/demo-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ROLE_HOME, ROLE_LABEL } from "@/lib/fanecto/constants";
import { initials } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";
import type { Role } from "@/lib/fanecto/types";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof Home };

const NAV: Record<Role, NavItem[]> = {
  student: [
    { to: "/dashboard", label: "Home", icon: LayoutDashboard },
    { to: "/properties", label: "Find home", icon: Search },
    { to: "/saved", label: "Saved", icon: Home },
    { to: "/roommates", label: "Roommates", icon: Users },
    { to: "/inspections", label: "Inspections", icon: ClipboardCheck },
    { to: "/messages", label: "Messages", icon: MessageSquare },
    { to: "/payments", label: "Payments", icon: Wallet },
    { to: "/settings", label: "Settings", icon: Settings },
    { to: "/profile", label: "Profile", icon: UserRound },
  ],
  seeker: [
    { to: "/dashboard", label: "Home", icon: LayoutDashboard },
    { to: "/properties", label: "Find home", icon: Search },
    { to: "/saved", label: "Saved", icon: Home },
    { to: "/inspections", label: "Inspections", icon: ClipboardCheck },
    { to: "/messages", label: "Messages", icon: MessageSquare },
    { to: "/payments", label: "Payments", icon: Wallet },
    { to: "/settings", label: "Settings", icon: Settings },
    { to: "/profile", label: "Profile", icon: UserRound },
  ],
  landlord: [
    { to: "/landlord", label: "Overview", icon: LayoutDashboard },
    { to: "/landlord/properties", label: "Properties", icon: Home },
    { to: "/landlord/inspections", label: "Inspections", icon: ClipboardCheck },
    { to: "/landlord/agents", label: "Agents", icon: Users },
    { to: "/landlord/agreements", label: "Agreements", icon: Handshake },
    { to: "/landlord/payments", label: "Payments", icon: Wallet },
    { to: "/landlord/messages", label: "Messages", icon: MessageSquare },
    { to: "/landlord/verification", label: "Verification", icon: Shield },
    { to: "/settings", label: "Settings", icon: Settings },
    { to: "/landlord/profile", label: "Profile", icon: UserRound },
  ],
  agent: [
    { to: "/agent", label: "Overview", icon: LayoutDashboard },
    { to: "/agent/properties", label: "Listings", icon: Home },
    { to: "/agent/leads", label: "Leads", icon: Users },
    { to: "/agent/inspections", label: "Inspections", icon: ClipboardCheck },
    { to: "/agent/agreements", label: "Agreements", icon: Handshake },
    { to: "/agent/availability", label: "Availability", icon: ClipboardCheck },
    { to: "/agent/payments", label: "Payments", icon: Banknote },
    { to: "/agent/messages", label: "Messages", icon: MessageSquare },
    { to: "/agent/verification", label: "Verification", icon: Shield },
    { to: "/settings", label: "Settings", icon: Settings },
    { to: "/agent/profile", label: "Profile", icon: UserRound },
  ],
  inspector: [
    { to: "/inspector/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/inspector/inspections", label: "Inspections", icon: ClipboardCheck },
    { to: "/inspector/reports", label: "Reports", icon: FileText },
    { to: "/inspector/availability", label: "Availability", icon: ClipboardCheck },
    { to: "/inspector/earnings", label: "Earnings", icon: Banknote },
    { to: "/settings", label: "Settings", icon: Settings },
    { to: "/inspector/profile", label: "Profile", icon: UserRound },
  ],
  admin: [
    { to: "/admin", label: "Overview", icon: LayoutDashboard },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/properties", label: "Properties", icon: Home },
    { to: "/admin/verification", label: "Verification", icon: Shield },
    { to: "/admin/inspections", label: "Inspections", icon: ClipboardCheck },
    { to: "/admin/payments", label: "Payments", icon: Wallet },
    { to: "/admin/reviews", label: "Reviews", icon: FileText },
    { to: "/admin/reports", label: "Reports", icon: FileText },
    { to: "/admin/suspensions", label: "Suspensions", icon: Shield },
    { to: "/admin/agreements", label: "Agreements", icon: Handshake },
    { to: "/admin/audit-logs", label: "Audit", icon: FileText },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ],
};

/** Primary bottom-nav destinations (max 4). Everything else opens in More. */
const MOBILE_PRIMARY: Record<Role, NavItem[]> = {
  student: [
    { to: "/dashboard", label: "Home", icon: LayoutDashboard },
    { to: "/properties", label: "Homes", icon: Search },
    { to: "/roommates", label: "Roommates", icon: Users },
    { to: "/messages", label: "Inbox", icon: MessageSquare },
  ],
  seeker: [
    { to: "/dashboard", label: "Home", icon: LayoutDashboard },
    { to: "/properties", label: "Homes", icon: Search },
    { to: "/messages", label: "Inbox", icon: MessageSquare },
    { to: "/payments", label: "Payments", icon: Wallet },
  ],
  landlord: [
    { to: "/landlord", label: "Home", icon: LayoutDashboard },
    { to: "/landlord/properties", label: "Listings", icon: Home },
    { to: "/landlord/messages", label: "Inbox", icon: MessageSquare },
    { to: "/landlord/payments", label: "Payments", icon: Wallet },
  ],
  agent: [
    { to: "/agent", label: "Home", icon: LayoutDashboard },
    { to: "/agent/properties", label: "Listings", icon: Home },
    { to: "/agent/leads", label: "Leads", icon: Users },
    { to: "/agent/messages", label: "Inbox", icon: MessageSquare },
  ],
  inspector: [
    { to: "/inspector/dashboard", label: "Home", icon: LayoutDashboard },
    { to: "/inspector/inspections", label: "Jobs", icon: ClipboardCheck },
    { to: "/inspector/reports", label: "Reports", icon: FileText },
    { to: "/inspector/earnings", label: "Pay", icon: Banknote },
  ],
  admin: [
    { to: "/admin", label: "Ops", icon: LayoutDashboard },
    { to: "/admin/verification", label: "Verify", icon: Shield },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/payments", label: "Pay", icon: Wallet },
  ],
};

function isActivePath(pathname: string, to: string, home: string) {
  if (to === home) return pathname === to;
  return pathname === to || pathname.startsWith(to + "/");
}

export function AppShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: Role;
}) {
  const user = useCurrentFanectoUser();
  const signOut = useFanecto((s) => s.signOut);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = NAV[role];
  const primary = MOBILE_PRIMARY[role];
  const dark = role === "admin";
  const [moreOpen, setMoreOpen] = useState(false);

  const moreItems = useMemo(() => {
    const primaryTos = new Set(primary.map((p) => p.to));
    return items.filter((item) => !primaryTos.has(item.to));
  }, [items, primary]);

  const moreActive = moreItems.some((item) => isActivePath(pathname, item.to, ROLE_HOME[role]));

  return (
    <div className={cn("min-h-dvh bg-background", dark && "bg-ops")}>
      <div className="flex min-h-dvh">
        <aside
          className={cn(
            "sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r lg:flex",
            dark ? "border-ops-foreground/10 bg-ops text-ops-foreground" : "border-border bg-card",
          )}
        >
          <div className="flex h-16 items-center px-4">
            <Logo invert={dark} to={ROLE_HOME[role]} />
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-3">
            {items.map((item) => {
              const active = isActivePath(pathname, item.to, ROLE_HOME[role]);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? dark
                        ? "bg-ops-foreground/10 text-ops-foreground"
                        : "bg-secondary text-foreground"
                      : dark
                        ? "text-ops-foreground/65 hover:bg-ops-foreground/5 hover:text-ops-foreground"
                        : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div
            className={cn(
              "border-t px-4 py-3 text-xs",
              dark ? "border-ops-foreground/10 text-ops-foreground/60" : "border-border text-muted-foreground",
            )}
          >
            {ROLE_LABEL[role]}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className={cn(
              "sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b px-4",
              dark
                ? "border-ops-foreground/10 bg-ops/90 text-ops-foreground backdrop-blur"
                : "border-border bg-background/90 backdrop-blur",
            )}
          >
            <div className="flex min-w-0 items-center gap-3 lg:hidden">
              <Logo invert={dark} wordmark to={ROLE_HOME[role]} />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <DemoSwitcher compact />
              <NotificationCenter dark={dark} />
              {user ? (
                <Avatar className="size-8">
                  <AvatarImage src={user.avatar} alt="" />
                  <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
                </Avatar>
              ) : null}
            </div>
          </header>
          <div
            className={cn(
              "page-enter flex-1 px-4 py-6 pb-28 lg:px-8 lg:pb-10",
              dark && "text-ops-foreground",
            )}
          >
            {user && user.accountStatus !== "active" ? (
              <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
                This account is {user.accountStatus}. Eligible actions are limited.
              </div>
            ) : null}
            {children}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav: 4 primary + More */}
      <nav
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t lg:hidden",
          "pb-[max(0.35rem,env(safe-area-inset-bottom))]",
          dark ? "border-ops-foreground/10 bg-ops text-ops-foreground" : "border-border bg-card",
        )}
      >
        {primary.map((item) => {
          const active = isActivePath(pathname, item.to, ROLE_HOME[role]);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors duration-150",
                active ? "text-primary" : dark ? "text-ops-foreground/60" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("size-4 transition-transform duration-150", active && "scale-110")} />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={cn(
            "flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors duration-150",
            moreActive || moreOpen
              ? "text-primary"
              : dark
                ? "text-ops-foreground/60"
                : "text-muted-foreground",
          )}
        >
          <Menu className={cn("size-4 transition-transform duration-150", (moreActive || moreOpen) && "scale-110")} />
          More
        </button>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="max-h-[85dvh] rounded-t-3xl pb-[max(1rem,env(safe-area-inset-bottom))]">
          <SheetHeader className="text-left">
            <SheetTitle>More</SheetTitle>
            <p className="text-sm text-muted-foreground">
              {user ? `${user.displayName} · ${ROLE_LABEL[role]}` : ROLE_LABEL[role]}
            </p>
          </SheetHeader>
          <div className="mt-4 grid gap-1">
            {moreItems.map((item) => {
              const active = isActivePath(pathname, item.to, ROLE_HOME[role]);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                    active ? "bg-secondary text-foreground" : "text-foreground hover:bg-secondary/70",
                  )}
                >
                  <Icon className="size-4 shrink-0 text-primary" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/help"
              onClick={() => setMoreOpen(false)}
              className="flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground hover:bg-secondary/70"
            >
              <FileText className="size-4 shrink-0 text-primary" />
              Help & support
            </Link>
            <Button
              type="button"
              variant="outline"
              className="mt-2 w-full"
              onClick={() => {
                setMoreOpen(false);
                signOut();
              }}
            >
              Sign out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
