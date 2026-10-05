import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/layout/public-shell";

export function NotFoundPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-lg px-4 py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">404</p>
        <h1 className="mt-2 font-display text-4xl">This page isn’t listed</h1>
        <p className="mt-3 text-muted-foreground">
          The address doesn’t match a Fanecto route. Head back to homes — that’s the product.
        </p>
        <Button asChild className="mt-6">
          <Link to="/properties">Browse homes</Link>
        </Button>
      </div>
    </PublicShell>
  );
}
