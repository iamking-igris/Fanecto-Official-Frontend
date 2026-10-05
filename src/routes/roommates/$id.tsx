import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { IdentityVerifiedBadge } from "@/components/fanecto/badges";
import { MockPay } from "@/components/fanecto/mock-pay";
import { SmartShell } from "@/components/layout/smart-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROOMMATE_CONNECTION_FEE } from "@/lib/fanecto/constants";
import { formatDate, formatNaira } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";
import { useState } from "react";

export const Route = createFileRoute("/roommates/$id")({ component: RoommateDetail });

function RoommateDetail() {
  const { id } = Route.useParams();
  const listing = useFanecto((s) => s.roommateListings.find((l) => l.id === id));
  const creator = useFanecto((s) => s.users.find((u) => u.id === listing?.creatorId));
  const user = useCurrentFanectoUser();
  const payRoommateConnection = useFanecto((s) => s.payRoommateConnection);
  const connected = useFanecto((s) =>
    s.roommateConnections.some((c) => c.listingId === id && c.seekerId === s.sessionUserId && c.paid),
  );
  const navigate = useNavigate();
  const [pay, setPay] = useState(false);

  if (!listing) {
    return (
      <SmartShell allow={["student"]}>
        <div className="mx-auto max-w-lg px-4 py-16">
          <h1 className="font-display text-3xl">Listing closed or missing</h1>
          <Button asChild className="mt-4">
            <Link to="/roommates">Back</Link>
          </Button>
        </div>
      </SmartShell>
    );
  }

  const closed = listing.status === "closed";

  return (
    <SmartShell allow={["student"]}>
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[1fr_20rem]">
        <div>
          <Link to="/roommates" className="text-sm text-muted-foreground">
            ← Roommate listings
          </Link>
          <div className="mt-4 flex items-center gap-3">
            {creator ? (
              <img src={creator.avatar} alt="" className="size-14 rounded-full object-cover" />
            ) : null}
            <div>
              <h1 className="font-display text-3xl">{listing.displayName}</h1>
              <p className="text-sm text-muted-foreground">
                {listing.school} · {listing.campus}
              </p>
              {creator?.verificationStatus === "verified" ? <IdentityVerifiedBadge compact /> : null}
            </div>
          </div>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2 text-sm">
            <Field label="Budget">{formatNaira(listing.budget)} / year</Field>
            <Field label="Preferred area">{listing.preferredArea}</Field>
            <Field label="Move-in">{formatDate(listing.moveIn)}</Field>
            <Field label="Roommates wanted">{listing.roommatesWanted}</Field>
            <Field label="Quiet / social">{listing.quietSocial}</Field>
            <Field label="Cleanliness">{listing.cleanliness}</Field>
            <Field label="Smoking">{listing.smoking}</Field>
            <Field label="Pets">{listing.pets}</Field>
          </dl>
          <h2 className="mt-8 font-display text-2xl">Lifestyle</h2>
          <p className="mt-2 text-sm leading-relaxed">{listing.lifestyle}</p>
          <h2 className="mt-8 font-display text-2xl">About</h2>
          <p className="mt-2 text-sm leading-relaxed">{listing.bio}</p>
        </div>
        <aside>
          <Card className="p-5">
            {closed ? (
              <p className="text-sm">This listing is closed. Connection payments are not accepted.</p>
            ) : connected ? (
              <>
                <p className="font-medium">Connected</p>
                <p className="mt-1 text-sm text-muted-foreground">Chat is unlocked. Contact sharing is allowed.</p>
                <Button asChild className="mt-4 w-full">
                  <Link to="/messages">Open chat</Link>
                </Button>
              </>
            ) : user?.id === listing.creatorId ? (
              <p className="text-sm">This is your listing. You don’t pay to post, and you don’t pay to receive connections.</p>
            ) : (
              <>
                <p className="text-2xl font-semibold tabular-nums">{formatNaira(ROOMMATE_CONNECTION_FEE)}</p>
                <p className="text-sm text-muted-foreground">One-time connection fee. Chat unlocks after payment.</p>
                {pay ? (
                  <div className="mt-4">
                    <MockPay
                      title="Roommate connection"
                      lines={[{ label: "Connection fee", value: ROOMMATE_CONNECTION_FEE }]}
                      total={ROOMMATE_CONNECTION_FEE}
                      disclaimer="Mock payment. The listing creator does not pay. No roommate reviews."
                      successMessage="Connected. Chat unlocked."
                      onSuccess={() => {
                        const res = payRoommateConnection(listing.id);
                        if (!res.ok) toast.error(res.error);
                        else {
                          toast.success("Chat unlocked.");
                          void navigate({ to: "/messages" });
                        }
                      }}
                    />
                  </div>
                ) : (
                  <Button
                    className="mt-4 w-full"
                    onClick={() => {
                      if (!user) {
                        void navigate({ to: "/login" });
                        return;
                      }
                      setPay(true);
                    }}
                  >
                    Connect · ₦3,000
                  </Button>
                )}
              </>
            )}
          </Card>
        </aside>
      </div>
    </SmartShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}
