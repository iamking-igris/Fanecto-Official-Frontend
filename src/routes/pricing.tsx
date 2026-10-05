import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pricing")({ component: PricingPage });

function PricingPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Pricing</p>
        <h1 className="mt-2 max-w-2xl font-display text-4xl font-medium tracking-tight sm:text-5xl">
          Transparent fees. No subscription tiers.
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Fanecto charges only when a transaction moves through the platform. There are no agent subscription plans and
          no hidden service charge on the property listing form.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <PriceCard
            title="Rental through Fanecto"
            price="5%"
            unit="of annual rent"
            points={[
              "Itemised before you pay",
              "Listing form shows annual rent only",
              "Agent commission (if any) is separate",
              "No Fanecto wallet or stored balance",
            ]}
          />
          <PriceCard
            title="Roommate connection"
            price="₦3,000"
            unit="one-time fee"
            highlight
            points={[
              "Posting a roommate listing is free",
              "The person who connects pays",
              "Chat unlocks after payment",
              "No roommate reviews or subscriptions",
            ]}
          />
          <PriceCard
            title="Physical inspection"
            price="Per job"
            unit="fee set per inspector"
            points={[
              "Pay before inspector chat unlocks",
              "80% to inspector · 20% to Fanecto",
              "Structured condition report",
              "Not a legal title verification",
            ]}
          />
        </div>

        <div className="mt-12 rounded-3xl bg-secondary/50 p-6 sm:p-8">
          <h2 className="font-display text-2xl font-medium">What is not charged</h2>
          <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> Browsing and searching homes</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> Creating a student or seeker account</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> Posting a roommate listing</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> Landlord listing form (no platform fee line)</li>
          </ul>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Fanecto does not claim legal ownership or title verification from uploaded documents. Always do your own legal
          due diligence.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild><Link to="/properties">Browse homes</Link></Button>
          <Button asChild variant="outline"><Link to="/how-it-works">How it works</Link></Button>
        </div>
      </div>
    </PublicShell>
  );
}

function PriceCard({
  title, price, unit, points, highlight,
}: { title: string; price: string; unit: string; points: string[]; highlight?: boolean }) {
  return (
    <div className={`flex flex-col rounded-3xl p-6 shadow-[var(--shadow-border)] ${highlight ? "bg-charcoal text-card" : "bg-card"}`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.12em] ${highlight ? "text-card/60" : "text-muted-foreground"}`}>{title}</p>
      <p className="mt-3 font-display text-4xl font-medium tracking-tight">{price}</p>
      <p className={`mt-1 text-sm ${highlight ? "text-card/70" : "text-muted-foreground"}`}>{unit}</p>
      <ul className="mt-6 flex-1 space-y-2.5">
        {points.map((p) => (
          <li key={p} className="flex gap-2 text-sm">
            <CheckCircle2 className={`mt-0.5 size-4 shrink-0 ${highlight ? "text-card/80" : "text-primary"}`} />
            <span className={highlight ? "text-card/90" : "text-muted-foreground"}>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
