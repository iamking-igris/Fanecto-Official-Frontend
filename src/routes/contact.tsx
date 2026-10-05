import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({ component: ContactPage });

function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <PublicShell>
      <div className="mx-auto max-w-xl px-4 py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Contact</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight">Get in touch</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Questions about listings, inspections or your account? Send a message and our team will respond.
        </p>
        {sent ? (
          <div className="mt-8 rounded-2xl bg-card p-6 shadow-[var(--shadow-border)]">
            <p className="font-semibold">Message received</p>
            <p className="mt-2 text-sm text-muted-foreground">
              We’ve logged your request. For account-specific issues, sign in and open Help & Support for ticket tracking.
            </p>
            <Button className="mt-4" variant="outline" onClick={() => setSent(false)}>Send another</Button>
          </div>
        ) : (
          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                setSent(true);
                toast.success("Message sent.");
              }, 600);
            }}
          >
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required className="mt-1.5" placeholder="Your name" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required className="mt-1.5" placeholder="you@email.com" />
            </div>
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input id="topic" required className="mt-1.5" placeholder="e.g. Inspection, listing, payment" />
            </div>
            <div>
              <Label htmlFor="msg">Message</Label>
              <Textarea id="msg" required className="mt-1.5" rows={5} placeholder="How can we help?" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending…" : "Send message"}
            </Button>
          </form>
        )}
      </div>
    </PublicShell>
  );
}
