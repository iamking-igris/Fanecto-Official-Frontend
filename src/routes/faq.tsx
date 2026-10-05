import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/faq")({ component: FaqPage });

const FAQS = [
  { q: "Does Fanecto verify legal ownership of a property?", a: "No. Fanecto reviews identity, relevant business documents, and listing evidence. That is not a legal title guarantee. Always complete your own legal and document checks." },
  { q: "What is the rental platform fee?", a: "When rent is paid through Fanecto, a 5% platform fee is calculated on the annual rent and shown before you pay. It does not appear as a separate service charge on the landlord listing form." },
  { q: "Do I need an agent to list or rent?", a: "No. Landlords can list directly. Agents are optional and must be verified before publishing. Any agent commission is agreed between landlord and agent and is separate from Fanecto’s 5% fee." },
  { q: "How do roommate connections work?", a: "Posting a roommate listing is free. The person who wants to connect pays ₦3,000 once. After payment, chat unlocks. There are no roommate reviews." },
  { q: "What does a physical inspection cover?", a: "An inspector visits the property and files a structured report on condition, utilities and how the unit compares to the listing. It is not legal title verification or a guarantee of safety or ownership." },
  { q: "When can I message an inspector?", a: "After successful payment of the inspection fee. Chat stays locked until payment succeeds." },
  { q: "How is the inspection fee split?", a: "80% goes to the inspector and 20% to Fanecto. The fee amount is shown before you pay." },
  { q: "Can landlords update availability manually?", a: "Yes. Total units and available units can be updated. Occupied is derived as total minus available. Changes are recorded in availability history." },
];

function FaqPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">FAQ</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight sm:text-5xl">Common questions</h1>
        <p className="mt-4 text-sm text-muted-foreground">Straight answers about fees, trust signals and how Fanecto works.</p>
        <dl className="mt-10 space-y-4">
          {FAQS.map((f) => (
            <div key={f.q} className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
              <dt className="font-semibold">{f.q}</dt>
              <dd className="mt-2 text-sm text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild><Link to="/contact">Contact support</Link></Button>
          <Button asChild variant="outline"><Link to="/pricing">View pricing</Link></Button>
        </div>
      </div>
    </PublicShell>
  );
}
