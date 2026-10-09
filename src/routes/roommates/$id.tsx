import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MockPay } from "@/components/fanecto/mock-pay";
import { SmartShell } from "@/components/layout/smart-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROOMMATE_CONNECTION_FEE } from "@/lib/fanecto/constants";
import { formatDate, formatNaira } from "@/lib/fanecto/format";
import {
  canAccessRoommateChat,
  getActiveRoommateConnection,
  hasActiveRoommateReservation,
  isRoommateListingAvailableForConnection,
} from "@/lib/fanecto/roommate-logic";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/roommates/$id")({ component: Detail });

const FALLBACK =
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80";

function Detail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const user = useCurrentFanectoUser();
  const listing = useFanecto((s) => s.roommateListings.find((l) => l.id === id));
  const connections = useFanecto((s) => s.roommateConnections);
  const payRoommateConnection = useFanecto((s) => s.payRoommateConnection);
  const connection = useFanecto((s) =>
    getActiveRoommateConnection(id, user?.id ?? "", s.roommateConnections),
  );
  const conversations = useFanecto((s) => s.conversations);
  const [active, setActive] = useState(0);
  const [pay, setPay] = useState(false);
  const [paying, setPaying] = useState(false);

  if (!listing) {
    return (
      <SmartShell allow={["student", "seeker"]}>
        <div className="mx-auto max-w-lg py-16">
          <h1 className="font-display text-2xl">Post not found</h1>
          <Button asChild className="mt-4" variant="outline">
            <Link to="/roommates">Back to roommates</Link>
          </Button>
        </div>
      </SmartShell>
    );
  }

  const images = listing.images?.length ? listing.images : [FALLBACK];
  const isOwner = user?.id === listing.creatorId;
  const conv = conversations.find(
    (c) =>
      c.context === "roommate" &&
      c.roommateListingId === id &&
      user &&
      c.participantIds.includes(user.id),
  );
  const chatOpen = canAccessRoommateChat(connection);
  const isListingUnavailable = !isRoommateListingAvailableForConnection(listing, connections);
  const hasReservation = hasActiveRoommateReservation(id, connections);
  const canRequest =
    !isOwner &&
    !paying &&
    listing.status === "active" &&
    isRoommateListingAvailableForConnection(listing, connections) &&
    !(connection && (connection.status === "pending" || connection.status === "accepted"));

  return (
    <SmartShell allow={["student", "seeker"]}>
      <div className="mx-auto max-w-5xl space-y-6 pb-10">
        <Link to="/roommates" className="text-sm text-muted-foreground hover:text-foreground">
          ← Roommates
        </Link>

        {/* Gallery */}
        <div className="grid gap-2 lg:grid-cols-[1.4fr_0.6fr]">
          <button
            type="button"
            className="overflow-hidden rounded-2xl bg-secondary"
            onClick={() => setActive((a) => (a + 1) % images.length)}
          >
            <img
              src={images[active] ?? images[0]}
              alt=""
              className="aspect-[16/10] w-full object-cover"
            />
          </button>
          <div className="hidden gap-2 lg:grid lg:grid-rows-2">
            {images.slice(1, 3).map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActive(i + 1)}
                className="overflow-hidden rounded-2xl bg-secondary"
              >
                <img src={src} alt="" className="size-full object-cover" />
              </button>
            ))}
            {images.length < 2 ? (
              <div className="rounded-2xl bg-secondary" />
            ) : null}
          </div>
          {images.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto lg:hidden">
              {images.map((src, i) => (
                <button key={src} type="button" onClick={() => setActive(i)} className="shrink-0">
                  <img
                    src={src}
                    alt=""
                    className={cn(
                      "size-16 rounded-lg object-cover",
                      i === active ? "ring-2 ring-primary" : "opacity-70",
                    )}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Roommate opportunity
              </p>
              <h1 className="mt-1 font-display text-3xl font-medium leading-tight">{listing.title}</h1>
              <p className="mt-1 text-muted-foreground">{listing.location}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Info label="Housing" value={listing.housingType ?? "—"} />
              <Info label="Contribution" value={`${formatNaira(listing.budget)}/yr`} />
              <Info
                label="Spaces"
                value={`${listing.roommatesWanted} available`}
              />
              <Info label="Move-in" value={formatDate(listing.moveIn)} />
            </div>

            {listing.amenities?.length ? (
              <section>
                <h2 className="font-display text-lg font-medium">Hostel amenities</h2>
                <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {listing.amenities.map((a) => (
                    <li
                      key={a}
                      className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm"
                    >
                      <span className="text-primary" aria-hidden>
                        ✓
                      </span>
                      {a}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section>
              <h2 className="font-display text-lg font-medium">About the arrangement</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {listing.bio}
              </p>
            </section>

            <section className="flex gap-4 rounded-2xl border border-border p-4">
              {listing.avatarUrl ? (
                <img
                  src={listing.avatarUrl}
                  alt=""
                  className="size-16 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-secondary text-lg font-medium">
                  {listing.displayName.slice(0, 1)}
                </div>
              )}
              <div>
                <p className="font-medium">{listing.displayName}</p>
                <p className="text-sm text-muted-foreground">
                  {[
                    listing.gender ? listing.gender.charAt(0).toUpperCase() + listing.gender.slice(1) : null,
                    listing.occupation,
                    listing.level,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="text-sm text-muted-foreground">{listing.school}</p>
                {listing.lookingFor ? (
                  <p className="mt-2 text-sm">
                    Looking for:{" "}
                    <span className="font-medium capitalize">
                      {listing.lookingFor === "any" ? "Any gender" : listing.lookingFor}
                    </span>
                  </p>
                ) : null}
              </div>
            </section>
          </div>

          <aside>
            <Card className="sticky top-20 space-y-3 p-5">
              {isOwner ? (
                <>
                  <p className="font-medium">Your post</p>
                  <p className="text-sm text-muted-foreground">
                    Free to post. Review requests from Roommates → Requests. Chat opens only after you accept.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/roommates">Manage requests</Link>
                  </Button>
                </>
              ) : chatOpen ? (
                <>
                  <p className="font-medium text-primary">{connection?.status === "accepted" ? "Connection accepted" : "Request pending"}</p>
                  <p className="text-sm text-muted-foreground">
                    {connection?.status === "accepted"
                      ? "The post owner has accepted your roommate request."
                      : "Your connection request has been sent. You can now chat while they decide whether to accept or decline."}
                  </p>
                  <Button asChild className="w-full">
                    <Link to="/messages" search={conv ? { c: conv.id } : undefined}>
                      Open chat
                    </Link>
                  </Button>
                </>
              ) : connection?.status === "pending" ? (
                <>
                  <p className="font-medium">Request pending</p>
                  <p className="text-sm text-muted-foreground">
                    Your connection request is being reviewed. A pending request reserves this listing while the owner decides.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/messages" search={conv ? { c: conv.id } : undefined}>
                      Open chat
                    </Link>
                  </Button>
                </>
              ) : connection?.status === "declined" ? (
                <>
                  <p className="font-medium">Request declined</p>
                  <p className="text-sm text-muted-foreground">
                    The post owner has declined your request. You can continue browsing other roommate listings.
                  </p>
                </>
              ) : listing.status !== "active" || hasReservation || isListingUnavailable ? (
                <>
                  <p className="font-medium">Listing unavailable</p>
                  <p className="text-sm text-muted-foreground">
                    {hasReservation
                      ? "Someone is currently reviewing a roommate connection request for this listing."
                      : "This post is not available for new connection requests right now."}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Connection fee
                  </p>
                  <p className="text-3xl font-semibold tabular-nums">
                    {formatNaira(ROOMMATE_CONNECTION_FEE)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The ₦3,000 connection fee lets you start a conversation with the person who created this post. They can accept or decline your request. Payment does not guarantee acceptance.
                  </p>
                  {pay ? (
                    <div>
                      <MockPay
                        title="Roommate connection"
                        lines={[{ label: "Connection fee", value: ROOMMATE_CONNECTION_FEE }]}
                        total={ROOMMATE_CONNECTION_FEE}
                        disclaimer="This fee lets you start a conversation immediately. The owner still decides whether to accept your request."
                        successMessage="Payment successful"
                        onSuccess={() => {
                          if (paying) return;
                          setPaying(true);
                          const res = payRoommateConnection(listing.id);
                          setPaying(false);
                          if (!res.ok) toast.error(res.error);
                          else {
                            toast.success("Payment successful");
                            setPay(false);
                          }
                        }}
                      />
                      <Button variant="ghost" className="mt-2 w-full" onClick={() => setPay(false)} disabled={paying}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      disabled={!canRequest || paying}
                      onClick={() => {
                        if (!user) {
                          void navigate({ to: "/login" });
                          return;
                        }
                        setPay(true);
                      }}
                    >
                      {paying ? "Processing payment…" : "Connect — ₦3,000"}
                    </Button>
                  )}
                </>
              )}
            </Card>
          </aside>
        </div>
      </div>
    </SmartShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/60 px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}
