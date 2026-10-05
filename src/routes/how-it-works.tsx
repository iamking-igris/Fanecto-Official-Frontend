import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Handshake, Home, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({ component: HowItWorks });

const STEPS = [
  {
    n: "01",
    icon: Home,
    title: "Discover homes",
    body: "Search listings by area, type and budget. Property cards carry inspection status and provider trust signals. Agent and inspector directories are not the homepage.",
  },
  {
    n: "02",
    icon: ShieldCheck,
    title: "Understand who is listing",
    body: "Landlords can list directly. Agents are optional, and only verified agents can publish. Fanecto Verified is a separate badge awarded by Fanecto — not granted by uploading an ID or paying.",
  },
  {
    n: "03",
    icon: Eye,
    title: "Inspect in person",
    body: "Choose an inspector, pay the fee, then chat unlocks. After completion, 20% stays with Fanecto and 80% is due to the inspector. The report is physical observation, not legal title verification.",
  },
  {
    n: "04",
    icon: Handshake,
    title: "Connect",
    body: "Rental chats stay on Fanecto because of the 5% platform fee — repeated attempts to move payment off-platform are warned. Inspection and roommate chats may share contact details after their paid unlock.",
  },
  {
    n: "05",
    icon: Wallet,
    title: "Transact",
    body: "Rent paid through Fanecto includes a 5% fee, shown before capture. Roommate posting is free; connecting costs ₦3,000. There are no agent subscription plans.",
  },
  {
    n: "06",
    icon: Sparkles,
    title: "Reputation",
    body: "After a completed rental you may review the landlord or agent. After a completed inspection you may review the inspector. Roommate listings have no reviews.",
  },
];

function HowItWorks() {
  return (
    <PublicShell>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=2000&q=80"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-charcoal/60" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-card/70">How Fanecto works</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-medium leading-[1.08] text-card sm:text-6xl">
            The housing journey, in order.
          </h1>
          <p className="mt-4 max-w-xl text-base text-card/80 sm:text-lg">
            Fanecto is infrastructure around finding, inspecting and paying for a home — not a classifieds wall.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid gap-3 sm:grid-cols-3">
          <FeeTile label="Rental through Fanecto" value="5%" hint="Shown before you pay" />
          <FeeTile label="Inspection split" value="20 / 80" hint="After a completed visit" />
          <FeeTile label="Roommate connection" value="₦3,000" hint="Paid by the person who connects" />
        </div>

        <ol className="mt-10 space-y-3 stagger-in">
          {STEPS.map((step) => (
            <li key={step.n}>
              <section className="surface grid gap-4 p-5 sm:grid-cols-[4.5rem_1fr] sm:items-start sm:gap-8 sm:p-7">
                <p className="font-display text-2xl tabular-nums text-primary">{step.n}</p>
                <div>
                  <div className="flex items-center gap-2 text-primary">
                    <step.icon className="size-4" />
                  </div>
                  <h2 className="mt-2 font-display text-2xl font-medium">{step.title}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </section>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/properties">Browse homes</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/register">Create an account</Link>
          </Button>
        </div>
      </div>
    </PublicShell>
  );
}

function FeeTile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="surface p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}
