import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/fanecto/empty-state";
import { PageHeader } from "@/components/fanecto/page-header";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ROOMMATE_CONNECTION_FEE } from "@/lib/fanecto/constants";
import { formatDate, formatNaira } from "@/lib/fanecto/format";
import {
  hasActiveRoommateReservation,
  isRoommateListingAvailableForConnection,
} from "@/lib/fanecto/roommate-logic";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/roommates/")({
  component: () => (
    <RoleGate allow={["student", "seeker"]}>
      <View />
    </RoleGate>
  ),
});

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80";

function View() {
  const user = useCurrentFanectoUser();
  const listings = useFanecto((s) => s.roommateListings);
  const connections = useFanecto((s) => s.roommateConnections);
  const users = useFanecto((s) => s.users);
  const accept = useFanecto((s) => s.acceptRoommateConnection);
  const decline = useFanecto((s) => s.declineRoommateConnection);
  const setStatus = useFanecto((s) => s.setRoommateListingStatus);

  const [tab, setTab] = useState<"browse" | "mine" | "requests">("browse");
  const [q, setQ] = useState("");
  const [gender, setGender] = useState<"all" | "male" | "female">("all");
  const [housing, setHousing] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const active = useMemo(() => {
    return listings.filter((l) => {
      if (l.status !== "active") return false;
      const hay = `${l.title} ${l.preferredArea} ${l.location} ${l.housingType} ${l.displayName}`.toLowerCase();
      if (q.trim() && !hay.includes(q.toLowerCase())) return false;
      if (gender !== "all" && l.gender !== gender) return false;
      if (housing && !(l.housingType ?? "").toLowerCase().includes(housing.toLowerCase())) return false;
      return true;
    });
  }, [listings, q, gender, housing]);

  const mine = listings.filter((l) => l.creatorId === user?.id);
  const incoming = connections.filter((c) => c.creatorId === user?.id && c.status === "pending");

  const filterControls = (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Gender of poster</p>
        <div className="flex flex-wrap gap-2">
          {(["all", "male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={cn(
                "min-h-10 rounded-full px-3 text-sm capitalize",
                gender === g ? "bg-primary text-primary-foreground" : "bg-secondary",
              )}
            >
              {g === "all" ? "Any" : g}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Housing type</p>
        <Input
          placeholder="e.g. Mini-flat"
          value={housing}
          onChange={(e) => setHousing(e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Roommates"
        title="Roommates"
        description="Find a suitable roommate and explore housing opportunities shared by other students and seekers."
        actions={
          <Button asChild>
            <Link to="/roommates/new">Post free</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["browse", "Browse"],
            ["mine", "My posts"],
            ["requests", `Requests${incoming.length ? ` (${incoming.length})` : ""}`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "min-h-10 rounded-full px-4 text-sm font-medium",
              tab === id ? "bg-primary text-primary-foreground" : "bg-secondary",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "browse" ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search location, title…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="max-w-md flex-1"
            />
            <div className="hidden md:block min-w-[220px]">{filterControls}</div>
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden">
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4">{filterControls}</div>
                <Button className="mt-4 w-full" onClick={() => setFilterOpen(false)}>
                  Apply
                </Button>
              </SheetContent>
            </Sheet>
          </div>

          {active.length === 0 ? (
            <EmptyState
              title="No roommate posts match"
              body="Try another search or post your own listing — it's free."
              action={
                <Button asChild>
                  <Link to="/roommates/new">Create a post</Link>
                </Button>
              }
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {active.map((l) => {
                const cover = l.images?.[0] ?? FALLBACK_IMG;
                const available = isRoommateListingAvailableForConnection(l, connections);
                const pending = hasActiveRoommateReservation(l.id, connections);
                return (
                  <li key={l.id}>
                    <Link
                      to="/roommates/$id"
                      params={{ id: l.id }}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-border)] transition-shadow hover:shadow-md"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                        <img
                          src={cover}
                          alt=""
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
                          {l.housingType ?? "Housing"}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-4">
                        <p className="text-xs text-muted-foreground">{l.location}</p>
                        <p className="line-clamp-2 font-medium leading-snug">{l.title}</p>
                        <p className="text-sm tabular-nums text-muted-foreground">
                          {formatNaira(l.budget)}
                          <span className="text-muted-foreground/80"> / year</span>
                          {" · "}
                          {l.roommatesWanted} space{l.roommatesWanted > 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">Move-in {formatDate(l.moveIn)}</p>
                        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                          {available ? "Available" : pending ? "Request pending" : "Unavailable"}
                        </p>

                        {l.amenities?.length ? (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {l.amenities.slice(0, 3).map((a) => (
                              <span
                                key={a}
                                className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium"
                              >
                                {a}
                              </span>
                            ))}
                            {l.amenities.length > 3 ? (
                              <span className="text-[11px] text-muted-foreground">
                                +{l.amenities.length - 3} more
                              </span>
                            ) : null}
                          </div>
                        ) : null}

                        <div className="mt-auto flex items-center gap-2 border-t pt-3">
                          {l.avatarUrl ? (
                            <img
                              src={l.avatarUrl}
                              alt=""
                              className="size-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                              {l.displayName.slice(0, 1)}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{l.displayName.split(" ")[0]}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {[l.gender, l.occupation, l.level].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-medium text-primary">View</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : null}

      {tab === "mine" ? (
        mine.length === 0 ? (
          <EmptyState
            title="You haven't posted yet"
            body={`Posting is free. Others pay ${formatNaira(ROOMMATE_CONNECTION_FEE)} to request a connection.`}
            action={
              <Button asChild>
                <Link to="/roommates/new">Create a post</Link>
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {mine.map((l) => {
              const reqCount = connections.filter(
                (c) => c.listingId === l.id && c.status === "pending",
              ).length;
              return (
                <Card key={l.id} className="overflow-hidden p-0">
                  <div className="flex gap-3 p-3">
                    <img
                      src={l.images?.[0] ?? FALLBACK_IMG}
                      alt=""
                      className="size-20 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{l.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {l.location} · {formatNaira(l.budget)}
                      </p>
                      <p className="mt-1 text-xs capitalize text-muted-foreground">
                        {l.status}
                        {reqCount ? ` · ${reqCount} pending request${reqCount > 1 ? "s" : ""}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 border-t px-3 py-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to="/roommates/$id" params={{ id: l.id }}>
                        View
                      </Link>
                    </Button>
                    {l.status === "active" ? (
                      <Button size="sm" variant="outline" onClick={() => setStatus(l.id, "paused")}>
                        Pause
                      </Button>
                    ) : null}
                    {l.status === "paused" ? (
                      <Button size="sm" variant="outline" onClick={() => setStatus(l.id, "active")}>
                        Resume
                      </Button>
                    ) : null}
                    {l.status !== "closed" ? (
                      <Button size="sm" variant="ghost" onClick={() => setStatus(l.id, "closed")}>
                        Close
                      </Button>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </ul>
        )
      ) : null}

      {tab === "requests" ? (
        incoming.length === 0 ? (
          <EmptyState
            title="No pending requests"
            body="When someone pays the connection fee on your post, their request appears here. Chat stays locked until you accept."
          />
        ) : (
          <ul className="space-y-3 max-w-2xl">
            {incoming.map((c) => {
              const listing = listings.find((l) => l.id === c.listingId);
              const seeker = users.find((u) => u.id === c.seekerId);
              return (
                <Card key={c.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium">
                      {(seeker?.displayName ?? "?").slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                        ₦3,000 paid · Decision pending
                      </p>
                      <p className="font-medium">{seeker?.displayName ?? "Student"}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {listing?.title} · {formatNaira(c.fee)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Payment succeeded. You can accept or decline this request.
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        accept(c.id);
                        toast.success("Accepted — chat unlocked");
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        decline(c.id);
                        toast.success("Declined");
                      }}
                    >
                      Decline
                    </Button>
                  </div>
                </Card>
              );
            })}
          </ul>
        )
      ) : null}
    </div>
  );
}
