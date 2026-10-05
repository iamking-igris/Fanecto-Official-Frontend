import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/public-shell";

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });

function PrivacyPage() {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Legal</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight">Privacy policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: September 2026. Product-facing privacy summary for the Fanecto frontend; not a certified compliance statement.</p>
        <div className="mt-10 space-y-8 text-sm leading-relaxed">
          <Section title="Information we collect">
            Account details (name, email, phone, role), listing and property information, verification documents (reviewed privately), transaction records, messages on the platform, and support requests.
          </Section>
          <Section title="How we use information">
            To operate the marketplace, process verification and inspections, facilitate payments, prevent fraud, improve the product, and respond to support requests.
          </Section>
          <Section title="Verification documents">
            Government ID and related evidence are used for review only. They are not shown on public profiles and are not exposed to other users.
          </Section>
          <Section title="Sharing">
            We share information with payment processors as needed to complete transactions, with inspectors for booked visits, and when required by law. We do not sell personal information.
          </Section>
          <Section title="Security and retention">
            We apply reasonable safeguards appropriate to a housing marketplace. Retention follows operational and legal needs; you may request account deletion through Settings.
          </Section>
          <Section title="Your choices">
            Update profile information, manage notification preferences, and request account deletion. Some records may be retained where required for disputes or compliance.
          </Section>
          <Section title="Contact">
            Privacy questions can be sent via the Contact page or Help & Support when signed in.
          </Section>
        </div>
      </article>
    </PublicShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-2 text-muted-foreground">{children}</p>
    </section>
  );
}
