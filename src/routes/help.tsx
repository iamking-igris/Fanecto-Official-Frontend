import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentFanectoUser } from "@/lib/fanecto/store";

export const Route = createFileRoute("/help")({ component: HelpPage });

const TOPICS = [
  { title: "Finding a home", body: "Use search and filters on Homes. Open a listing to see trust signals, request an inspection, then decide whether to pay rent through Fanecto." },
  { title: "Inspections", body: "Choose an inspector, pay the fee, then chat unlocks. After the visit, read the report. Inspection is about condition — not legal title." },
  { title: "Roommates", body: "Post free as a student. Connecting costs ₦3,000 for the seeker. Chat opens after payment. No roommate reviews." },
  { title: "Payments & fees", body: "Rent through Fanecto: 5% platform fee shown at checkout. Roommate connect: ₦3,000. Inspection: per-job fee, 80/20 split." },
  { title: "Verification", body: "Landlords, agents and inspectors submit identity evidence for review. Status can be pending, approved or rejected with a reason." },
  { title: "Account issues", body: "Use Settings when signed in. For suspension or access problems, contact support with your account email." },
];

function HelpPage() {
  const user = useCurrentFanectoUser();
  const [q, setQ] = useState("");
  const [sent, setSent] = useState(false);
  const filtered = TOPICS.filter(
    (t) => !q || `${t.title} ${t.body}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Help & support</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight">How can we help?</h1>
        <Input
          className="mt-6"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search help topics…"
        />
        <div className="mt-8 space-y-3">
          {filtered.map((t) => (
            <div key={t.title} className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
              <h2 className="font-semibold">{t.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>
            </div>
          ))}
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No topics match. Try another search or contact us below.</p>
          ) : null}
        </div>

        <div className="mt-12 rounded-3xl border border-border bg-secondary/40 p-6">
          <h2 className="font-display text-xl font-medium">Contact support</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {user
              ? `Signed in as ${user.displayName}. We’ll attach your role to the request.`
              : "Sign in for faster account-linked support, or send a message as a guest."}
          </p>
          {sent ? (
            <p className="mt-4 text-sm font-medium text-success">Request submitted. We’ll follow up by email.</p>
          ) : (
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
                toast.success("Support request submitted.");
              }}
            >
              {!user ? (
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required className="mt-1.5" />
                </div>
              ) : null}
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" required className="mt-1.5" placeholder="Brief summary" />
              </div>
              <div>
                <Label htmlFor="details">Details</Label>
                <Textarea id="details" required className="mt-1.5" rows={4} />
              </div>
              <Button type="submit">Submit request</Button>
            </form>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link to="/faq" className="text-primary hover:underline">FAQ</Link>
          <Link to="/contact" className="text-primary hover:underline">Contact</Link>
          <Link to="/terms" className="text-primary hover:underline">Terms</Link>
          <Link to="/privacy" className="text-primary hover:underline">Privacy</Link>
        </div>
      </div>
    </PublicShell>
  );
}
