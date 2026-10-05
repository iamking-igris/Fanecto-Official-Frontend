import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/fanecto/empty-state";
import { PageHeader } from "@/components/fanecto/page-header";
import { SmartShell } from "@/components/layout/smart-shell";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/roommates/")({ component: RoommatesPage });

function RoommatesPage() {
  const listings = useFanecto((s) => s.roommateListings.filter((l) => l.status !== "closed"));
  const user = useCurrentFanectoUser();
  const users = useFanecto((s) => s.users);
  const isStudent = user?.role === "student";

  return (
    <SmartShell allow={["student"]}>
      <div className={isStudent ? "space-y-6" : "mx-auto max-w-6xl px-4 py-10"}>
        <PageHeader
          kicker={isStudent ? "Your workspace" : "Students"}
          title="Find a roommate"
          description="Posting is free. The person who wants to connect pays ₦3,000 — then chat opens. This is housing compatibility, not dating. There are no roommate reviews."
          actions={
            isStudent ? (
              <Button asChild>
                <Link to="/roommates/new">Post a listing · free</Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link to="/login">Sign in as a student to post</Link>
              </Button>
            )
          }
        />
        {listings.length === 0 ? (
          <EmptyState className="mt-8" title="No roommate listings yet." body="Be the first to post — it’s free." />
        ) : (
          <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => {
              const creator = users.find((u) => u.id === l.creatorId);
              return (
                <Link
                  key={l.id}
                  to="/roommates/$id"
                  params={{ id: l.id }}
                  className="lift rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]"
                >
                  <div className="flex items-center gap-3">
                    {creator ? (
                      <img src={creator.avatar} alt="" className="size-11 rounded-full object-cover" />
                    ) : null}
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{l.school}</p>
                      <h2 className="font-display text-xl font-medium">{l.displayName}</h2>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {l.preferredArea} · {formatNaira(l.budget)} / year
                  </p>
                  <p className="mt-3 line-clamp-3 text-sm">{l.bio}</p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    {l.quietSocial} · {l.cleanliness} · {l.roommatesWanted} roommate
                    {l.roommatesWanted > 1 ? "s" : ""} wanted
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </SmartShell>
  );
}
