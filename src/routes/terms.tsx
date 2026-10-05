import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/public-shell";

export const Route = createFileRoute("/terms")({ component: TermsPage });

function TermsPage() {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16 prose-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Legal</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight">Terms of use</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: September 2026. This is product copy for the Fanecto frontend and has not been legally reviewed.</p>
        <div className="mt-10 space-y-8 text-sm leading-relaxed text-foreground/90">
          <Section title="1. Introduction">
            Fanecto is a housing marketplace that helps people discover homes, request physical inspections, connect with roommates and complete certain payments. By using Fanecto you agree to these terms.
          </Section>
          <Section title="2. Accounts">
            You must provide accurate information and keep your login secure. Account types include student, apartment seeker, landlord, agent and inspector. Admin accounts are provisioned internally and are not available via public registration.
          </Section>
          <Section title="3. Listings">
            Landlords and verified agents are responsible for the accuracy of property information, photos and availability. Fanecto may review, reject, suspend or remove listings that violate these terms or appear fraudulent.
          </Section>
          <Section title="4. Verification and trust signals">
            Identity checks, business document review and Fanecto Verified status are trust signals. They do not constitute legal verification of property ownership or title. Users must perform their own legal due diligence.
          </Section>
          <Section title="5. Inspections">
            Inspections are physical visits that produce condition reports. They are not legal due diligence, ownership guarantees or safety certifications. Communication with an inspector unlocks after successful payment of the inspection fee.
          </Section>
          <Section title="6. Payments">
            When rent is paid through Fanecto, a 5% platform fee applies and is shown before payment. Roommate connection costs ₦3,000 for the person connecting. Inspection fees are shown per job and split 80% inspector / 20% Fanecto. Fanecto does not operate a stored-value wallet.
          </Section>
          <Section title="7. Roommates">
            Roommate listings are free to post. Connecting costs ₦3,000. There are no roommate reviews. Use the feature for housing compatibility only.
          </Section>
          <Section title="8. Messaging">
            Keep rental conversations on Fanecto. Attempts to move rent payments off-platform to avoid the platform fee may result in warnings or restricted threads.
          </Section>
          <Section title="9. Prohibited use">
            Fraud, impersonation, unauthorized listings, harassment, and misuse of verification materials are prohibited and may lead to suspension.
          </Section>
          <Section title="10. Limitation of liability">
            Fanecto provides a marketplace and related tools. We do not guarantee outcomes of housing decisions, legal title, or the conduct of other users.
          </Section>
          <Section title="11. Contact">
            For questions about these terms, use the Contact page or signed-in Help & Support.
          </Section>
        </div>
      </article>
    </PublicShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-muted-foreground">{children}</p>
    </section>
  );
}
