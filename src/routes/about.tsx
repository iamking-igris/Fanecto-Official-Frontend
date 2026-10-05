import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">About</p>
        <h1 className="mt-2 font-display text-4xl font-medium sm:text-5xl">Less uncertainty around the housing journey.</h1>
        <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-foreground/90">
          <p>
            Fanecto is a Nigerian proptech marketplace. It connects students and apartment seekers with landlords and
            verified agents, and it gives inspectors a structured way to visit a home, document what they see, and get
            paid.
          </p>
          <p>
            Trust on Fanecto is layered on purpose. Identity verification is private. Fanecto Verified is discretionary.
            A physical inspection is evidence of condition. None of those, on their own, prove legal ownership of a
            property.
          </p>
          <p>
            Fanecto is built for the Nigerian housing journey — campus areas, annual rents, inspections before commitment,
            and fees that are shown before money moves.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <Fact label="Rental fee" value="5%" />
          <Fact label="Inspection split" value="20 / 80" />
          <Fact label="Roommate connect" value="₦3,000" />
        </div>

        <h2 className="mt-12 font-display text-2xl">What Fanecto does not claim</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {[
            "Legal title or government ownership verification",
            "That an uploaded document proves a landlord owns the building",
            "That an inspection guarantees the property or the people",
            "Agent subscription products — they are not in this product",
          ].map((item) => (
            <li key={item} className="surface px-4 py-3">
              {item}
            </li>
          ))}
        </ul>
        <Button asChild className="mt-10">
          <Link to="/properties">Browse homes</Link>
        </Button>
      </div>
    </PublicShell>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl">{value}</p>
    </div>
  );
}
