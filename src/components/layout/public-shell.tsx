import { Link, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Logo } from "@/components/fanecto/logo";
import { DemoSwitcher } from "@/components/layout/demo-switcher";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ROLE_HOME } from "@/lib/fanecto/constants";
import { useCurrentFanectoUser } from "@/lib/fanecto/store";
import { cn } from "@/lib/utils";

const links = [
  { to: "/properties", label: "Homes" },
  { to: "/roommates", label: "Roommates" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
];

export function PublicShell({ children }: { children: React.ReactNode }) {
  const user = useCurrentFanectoUser();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <Logo />
          <nav className="hidden items-center gap-7 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "relative text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground",
                  pathname.startsWith(l.to) && "text-foreground",
                )}
              >
                {l.label}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-px bg-primary transition-[width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    pathname.startsWith(l.to) ? "w-full" : "w-0",
                  )}
                />
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <DemoSwitcher compact />
            </div>
            {user ? (
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link to={ROLE_HOME[user.role]}>Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="sm" variant="charcoal" className="hidden sm:inline-flex">
                <Link to="/login">Sign in</Link>
              </Button>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="md:hidden" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Fanecto</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-4">
                  {links.map((l) => (
                    <Link key={l.to} to={l.to} className="text-base">
                      {l.label}
                    </Link>
                  ))}
                  <DemoSwitcher />
                  {user ? (
                    <Button asChild>
                      <Link to={ROLE_HOME[user.role]}>Dashboard</Link>
                    </Button>
                  ) : (
                    <Button asChild variant="charcoal">
                      <Link to="/login">Sign in</Link>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="page-enter">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            A Nigerian housing marketplace with identity checks, physical inspections and clear payments. Fanecto does
            not verify legal title from uploaded documents.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Product</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/properties" className="transition-colors hover:text-primary">Homes</Link></li>
            <li><Link to="/roommates" className="transition-colors hover:text-primary">Roommates</Link></li>
            <li><Link to="/how-it-works" className="transition-colors hover:text-primary">How it works</Link></li>
            <li><Link to="/pricing" className="transition-colors hover:text-primary">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Company</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/about" className="transition-colors hover:text-primary">About</Link></li>
            <li><Link to="/faq" className="transition-colors hover:text-primary">FAQ</Link></li>
            <li><Link to="/contact" className="transition-colors hover:text-primary">Contact</Link></li>
            <li><Link to="/help" className="transition-colors hover:text-primary">Help & support</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Legal</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/terms" className="transition-colors hover:text-primary">Terms</Link></li>
            <li><Link to="/privacy" className="transition-colors hover:text-primary">Privacy</Link></li>
            <li><Link to="/login" className="transition-colors hover:text-primary">Sign in</Link></li>
            <li><Link to="/register" className="transition-colors hover:text-primary">Create account</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
        © Fanecto · Fees: 5% rental · ₦3,000 roommate connection · Inspection 80/20 split
      </div>
    </footer>
  );
}
