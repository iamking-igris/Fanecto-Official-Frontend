import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  Home,
  Search,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PropertyCard } from "@/components/fanecto/property-card";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  const properties = useFanecto((s) => s.properties);
  const featured = useMemo(
    () => properties.filter((p) => p.status === "published").slice(0, 6),
    [properties],
  );
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  return (
    <PublicShell>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=80"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-charcoal/60" />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 sm:py-24 lg:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-card/70">
            Nigerian housing · Trust first
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-medium leading-[1.08] text-card sm:text-5xl lg:text-6xl">
            Find a home you can actually trust.
          </h1>
          <p className="max-w-xl text-base text-card/85 sm:text-lg">
            Search real listings, understand who listed them, book a physical inspection, and pay with fees shown
            upfront — no hidden charges at checkout.
          </p>
          <form
            className="flex w-full max-w-xl flex-col gap-2 rounded-2xl bg-card p-2 shadow-[var(--shadow-lift)] sm:flex-row sm:items-center"
            onSubmit={(e) => {
              e.preventDefault();
              void navigate({ to: "/properties", search: { q } });
            }}
          >
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Yaba, Akoka, Wuse 2, campus…"
              aria-label="Search area"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <Button type="submit" className="shrink-0 sm:px-6">
              <Search className="mr-2 size-4" />
              Search homes
            </Button>
          </form>
          <div className="flex flex-wrap gap-3 text-sm text-card/75">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4" /> Identity checks
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-4" /> Physical inspections
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Wallet className="size-4" /> Transparent fees
            </span>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <TrustTile
            icon={<Home className="size-5" />}
            title="Homes first"
            body="Browse real units by area and budget before you talk to anyone."
          />
          <TrustTile
            icon={<ShieldCheck className="size-5" />}
            title="Clear trust signals"
            body="Identity, business, and listing review shown separately — never one vague “verified” badge."
          />
          <TrustTile
            icon={<ClipboardCheck className="size-5" />}
            title="Inspect before you pay"
            body="Book a physical inspection. Report comes first; rent payment is optional after."
          />
          <TrustTile
            icon={<Wallet className="size-5" />}
            title="Fees shown upfront"
            body="5% platform fee on rent paid through Fanecto. No surprise service charges at checkout."
          />
        </div>
      </section>

      {/* Featured homes */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Marketplace</p>
            <h2 className="mt-1 font-display text-3xl font-medium tracking-tight">Featured homes</h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/properties">
              View all homes <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Pricing</p>
            <h2 className="mt-1 font-display text-3xl font-medium tracking-tight">Simple, transparent fees</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              No agent subscription plans. No hidden platform charges on the listing form. What you see below is what
              applies when money moves through Fanecto.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <PriceCard
              title="Rental through Fanecto"
              price="5%"
              unit="of annual rent"
              points={[
                "Shown clearly before you pay",
                "Landlord listing form shows annual rent only",
                "Agent commission (if any) is separate",
                "No Fanecto wallet or stored balance",
              ]}
              cta={{ label: "Browse homes", to: "/properties" }}
            />
            <PriceCard
              title="Roommate connection"
              price="₦3,000"
              unit="one-time"
              points={[
                "Posting a roommate listing is free",
                "The person who wants to connect pays",
                "Chat unlocks after payment",
                "No roommate reviews",
              ]}
              cta={{ label: "Find roommates", to: "/roommates" }}
              highlight
            />
            <PriceCard
              title="Physical inspection"
              price="Per job"
              unit="fee set per inspector"
              points={[
                "Pay before chat opens with the inspector",
                "80% to inspector · 20% to Fanecto",
                "Structured report, not a legal title check",
                "Walk away free if the unit isn’t right",
              ]}
              cta={{ label: "How inspections work", to: "/how-it-works" }}
            />
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Fanecto does not claim legal ownership or title verification from uploaded documents. Inspections confirm
            condition and listing accuracy — not legal title.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">How it works</p>
            <h2 className="mt-1 font-display text-3xl font-medium tracking-tight">
              Discover → inspect → pay → settle
            </h2>
            <ol className="mt-8 space-y-5">
              {[
                {
                  n: "1",
                  t: "Discover",
                  d: "Search by area, campus, budget and type. Open a listing to see provider and property trust signals.",
                },
                {
                  n: "2",
                  t: "Inspect",
                  d: "Request a verified inspector. Pay the inspection fee, then chat unlocks. Review the report before renting.",
                },
                {
                  n: "3",
                  t: "Connect",
                  d: "Message landlords or agents on-platform. Rental chats stay on Fanecto so the 5% fee isn’t sidestepped.",
                },
                {
                  n: "4",
                  t: "Transact",
                  d: "Pay rent through Fanecto with the 5% fee itemised. Provider settlement is handled separately from your total.",
                },
              ].map((step) => (
                <li key={step.n} className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {step.n}
                  </span>
                  <div>
                    <p className="font-semibold">{step.t}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{step.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Button asChild className="mt-8">
              <Link to="/how-it-works">
                Full journey <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
          <div className="overflow-hidden rounded-3xl shadow-[var(--shadow-lift)]">
            <img
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80"
              alt="Apartment interior"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Who Fanecto is for</p>
            <h2 className="mt-1 font-display text-3xl font-medium tracking-tight">One platform, clear roles</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <AudienceCard
              icon={<Users className="size-5" />}
              title="Students"
              body="Find housing near campus, inspect before you pay, connect with roommates, and manage payments in one place."
              to="/register"
            />
            <AudienceCard
              icon={<Home className="size-5" />}
              title="Apartment seekers"
              body="Search beyond student housing with the same trust signals, inspections and transparent checkout."
              to="/register"
            />
            <AudienceCard
              icon={<Building2 className="size-5" />}
              title="Landlords & agents"
              body="List units with annual rent, manage availability, optional agent agreements, and receive settlements."
              to="/register"
            />
            <AudienceCard
              icon={<ClipboardCheck className="size-5" />}
              title="Inspectors"
              body="Accept jobs in your service area, submit structured reports, and earn 80% of each inspection fee."
              to="/register"
            />
          </div>
        </div>
      </section>

      {/* Roommates + landlords CTAs */}
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 lg:grid-cols-2">
        <div className="lift rounded-3xl bg-secondary/50 p-8 shadow-[var(--shadow-border)]">
          <Users className="size-5 text-primary" />
          <h3 className="mt-4 font-display text-2xl">Roommates without the dating energy</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Students post for free. Connecting costs ₦3,000. Chat opens after payment. Housing compatibility only — no
            roommate reviews.
          </p>
          <Button asChild className="mt-6">
            <Link to="/roommates">Browse roommate listings</Link>
          </Button>
        </div>
        <div className="lift rounded-3xl bg-card p-8 shadow-[var(--shadow-border)]">
          <Building2 className="size-5 text-primary" />
          <h3 className="mt-4 font-display text-2xl">Landlords list directly</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Agents are optional. Only verified agents can publish. Commission is negotiated on Fanecto and becomes active
            only when both sides accept.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/register">List a property</Link>
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">FAQ</p>
          <h2 className="mt-1 text-center font-display text-3xl font-medium tracking-tight">Common questions</h2>
          <dl className="mt-10 space-y-6">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
                <dt className="font-semibold">{f.q}</dt>
                <dd className="mt-2 text-sm text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="overflow-hidden rounded-3xl bg-charcoal px-6 py-12 text-center text-card sm:px-12">
          <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Ready to find a home with fewer surprises?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-card/75">
            Start with a search, or create an account for your role — student, seeker, landlord, agent or inspector.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/properties">Browse homes</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="border border-card/20 bg-transparent text-card hover:bg-card/10"
            >
              <Link to="/register">Create account</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

const FAQS = [
  {
    q: "Does Fanecto verify legal ownership of a property?",
    a: "No. Fanecto reviews identity, business documents where relevant, and listing evidence. That is not a legal title guarantee. Always treat ownership claims with care.",
  },
  {
    q: "What does the 5% fee cover?",
    a: "When rent is paid through Fanecto, a 5% platform fee is calculated on the annual rent and shown before you pay. It is not added as a hidden service charge on the landlord’s listing form.",
  },
  {
    q: "Do I have to use an agent?",
    a: "No. Landlords can list directly. Agents are optional and must be verified before publishing. Any agent commission is separate from Fanecto’s 5% platform fee.",
  },
  {
    q: "How do roommate connections work?",
    a: "Posting is free. The person who wants to connect pays ₦3,000 once. After payment, chat unlocks. There are no roommate reviews.",
  },
  {
    q: "Is an inspection required before renting?",
    a: "Inspection is strongly recommended and available before you commit, but you choose whether to proceed after the report. Inspection is about condition and listing accuracy — not legal title.",
  },
];

function TrustTile({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-primary">{icon}</div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

function PriceCard({
  title,
  price,
  unit,
  points,
  cta,
  highlight,
}: {
  title: string;
  price: string;
  unit: string;
  points: string[];
  cta: { label: string; to: string };
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-3xl p-6 shadow-[var(--shadow-border)] ${
        highlight ? "bg-charcoal text-card" : "bg-card"
      }`}
    >
      <p className={`text-xs font-semibold uppercase tracking-[0.12em] ${highlight ? "text-card/60" : "text-muted-foreground"}`}>
        {title}
      </p>
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
      <Button asChild className="mt-8 w-full" variant={highlight ? "secondary" : "outline"}>
        <Link to={cta.to}>{cta.label}</Link>
      </Button>
    </div>
  );
}

function AudienceCard({
  icon,
  title,
  body,
  to,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="lift group flex flex-col rounded-2xl bg-background p-5 shadow-[var(--shadow-border)] transition-shadow hover:shadow-[var(--shadow-lift)]"
    >
      <div className="text-primary">{icon}</div>
      <h3 className="mt-3 font-semibold group-hover:text-primary">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">{body}</p>
      <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
        Get started <ArrowRight className="ml-1 size-3.5" />
      </span>
    </Link>
  );
}
