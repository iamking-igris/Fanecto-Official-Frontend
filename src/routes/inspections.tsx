import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, CalendarDays, Clock3, MapPin, MessageSquareText, ShieldCheck, Star } from "lucide-react";
import { EmptyState } from "@/components/fanecto/empty-state";
import { NotificationCenter } from "@/components/fanecto/notification-center";
import { PageHeader } from "@/components/fanecto/page-header";
import { InspectionPill } from "@/components/fanecto/status-pill";
import { RoleGate } from "@/components/layout/role-gate";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate, formatDateTime, formatNaira, initials } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";
import type { Inspection } from "@/lib/fanecto/types";
import { cn } from "@/lib/utils";
import { z } from "zod";

const searchSchema = z.object({ id: z.string().optional() });
type InspectionFilter = "all" | "pending" | "upcoming" | "completed" | "cancelled";

const FILTERS: { value: InspectionFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function getInspectionFilter(status: Inspection["status"]): InspectionFilter {
  switch (status) {
    case "requested":
    case "payment_pending":
      return "pending";
    case "paid":
    case "scheduled":
    case "in_progress":
      return "upcoming";
    case "completed":
    case "report_ready":
    case "settled":
      return "completed";
    case "cancelled":
    case "no_show":
    case "disputed":
      return "cancelled";
    default:
      return "all";
  }
}

function getInspectionMeta(inspection: Inspection) {
  switch (inspection.status) {
    case "requested":
    case "payment_pending":
      return {
        label: "Pending payment",
        message: "Your inspection payment is required before the inspection can be confirmed.",
        cta: "Pay inspection fee",
        to: "/payments",
      };
    case "paid":
      return {
        label: inspection.scheduledAt ? "Confirmed" : "Awaiting confirmation",
        message: inspection.scheduledAt
          ? "Your inspection is booked and the inspector has been assigned."
          : "Your payment has been received. We’re waiting for the inspection appointment to be confirmed.",
        cta: "View inspection",
        to: `/inspections/${inspection.id}`,
      };
    case "scheduled":
    case "in_progress":
      return {
        label: "Confirmed",
        message: "Your appointment is confirmed. The inspector is ready to meet you on site.",
        cta: "View inspection",
        to: `/inspections/${inspection.id}`,
      };
    case "completed":
    case "report_ready":
    case "settled":
      return {
        label: "Completed",
        message: "This inspection has been completed and the report is available.",
        cta: "View inspection",
        to: `/inspections/${inspection.id}`,
      };
    case "cancelled":
    case "no_show":
    case "disputed":
      return {
        label: "Cancelled",
        message: inspection.status === "disputed" ? "This inspection was closed because the appointment could not be confirmed." : "This inspection was cancelled. Please review the appointment details for more information.",
        cta: "View inspection",
        to: `/inspections/${inspection.id}`,
      };
    default:
      return {
        label: "Review",
        message: "Please check the inspection details for the latest status.",
        cta: "View inspection",
        to: `/inspections/${inspection.id}`,
      };
  }
}

export const Route = createFileRoute("/inspections")({
  component: InspectionsRoute,
  validateSearch: searchSchema,
});

function InspectionsRoute() {
  return (
    <RoleGate allow={["student", "seeker"]}>
      <InspectionsPage />
    </RoleGate>
  );
}

function InspectionsPage() {
  const { id } = Route.useSearch();
  const user = useCurrentFanectoUser();
  const inspections: Inspection[] = useFanecto((s) => s.inspections.filter((i) => i.seekerId === user?.id));
  const properties = useFanecto((s) => s.properties);
  const users = useFanecto((s) => s.users);
  const conversations = useFanecto((s) => s.conversations.filter((c) => c.context === "inspection"));
  const [filter, setFilter] = useState<InspectionFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(id ?? inspections[0]?.id ?? null);

  const filteredInspections: Inspection[] = useMemo(
    () =>
      inspections.filter((inspection) => {
        if (filter === "all") return true;
        return getInspectionFilter(inspection.status) === filter;
      }),
    [filter, inspections],
  );

  useEffect(() => {
    if (!filteredInspections.length) {
      setSelectedId(null);
      return;
    }
    const stillVisible = filteredInspections.some((inspection) => inspection.id === selectedId);
    if (!stillVisible) {
      setSelectedId(filteredInspections[0].id);
    }
  }, [filteredInspections, selectedId]);

  const selected = filteredInspections.find((inspection) => inspection.id === selectedId) ?? filteredInspections[0] ?? inspections[0];
  const property = properties.find((item) => item.id === selected?.propertyId);
  const inspector = users.find((item) => item.id === selected?.inspectorId);

  if (!inspections.length) {
    return (
      <div className="space-y-6">
        <PageHeader
          kicker="Inspections"
          title="Inspections"
          description="Track your property inspections, appointments and inspection payments."
          actions={
            <div className="flex items-center gap-2">
              <NotificationCenter />
              {user ? (
                <Avatar className="size-8">
                  {user.avatar ? <AvatarImage src={user.avatar} alt={user.displayName} /> : null}
                  <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
                </Avatar>
              ) : null}
            </div>
          }
        />
        <EmptyState
          title="No inspections yet"
          body="When you request an inspection for a property, it will appear here."
          action={
            <Button asChild>
              <Link to="/properties">Explore apartments</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Inspections"
        title="Inspections"
        description="Track your property inspections, appointments and inspection payments."
        actions={
          <div className="flex items-center gap-2">
            <NotificationCenter />
            {user ? (
              <Avatar className="size-8">
                {user.avatar ? <AvatarImage src={user.avatar} alt={user.displayName} /> : null}
                <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
              </Avatar>
            ) : null}
          </div>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((item) => (
          <Button
            key={item.value}
            type="button"
            variant={filter === item.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(item.value)}
            className={cn(
              "whitespace-nowrap rounded-full px-3",
              filter !== item.value && "border-border bg-card text-foreground/80 hover:bg-secondary",
            )}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {filteredInspections.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">
          No inspections match this view yet. Try another status or request a new inspection from a property listing.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredInspections.map((inspection) => {
            const propertyForCard = properties.find((item) => item.id === inspection.propertyId);
            const inspectorForCard = users.find((item) => item.id === inspection.inspectorId);
            const meta = getInspectionMeta(inspection);
            const dateText = inspection.scheduledAt ? formatDate(inspection.scheduledAt) : formatDate(inspection.createdAt);
            const timeText = inspection.scheduledAt
              ? new Date(inspection.scheduledAt).toLocaleTimeString("en-NG", {
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "To be scheduled";

            return (
              <Card
                key={inspection.id}
                className={cn(
                  "overflow-hidden p-0 transition-none hover:border-border/80",
                  selected?.id === inspection.id && "border-primary/70 ring-1 ring-primary/30",
                )}
                onClick={() => setSelectedId(inspection.id)}
              >
                <div className="relative h-40 overflow-hidden">
                  {propertyForCard?.images?.[0] ? (
                    <img
                      src={propertyForCard.images[0]}
                      alt={propertyForCard.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 px-3 pb-3">
                    <InspectionPill status={inspection.status} />
                    <span className="rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-foreground shadow-sm">
                      {formatNaira(inspection.fee)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  <div>
                    <h3 className="line-clamp-2 font-display text-xl font-medium leading-snug">{propertyForCard?.title ?? "Property viewing"}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" />
                      {propertyForCard ? `${propertyForCard.area}, ${propertyForCard.city}` : "Location to be confirmed"}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-4 text-foreground/70" />
                      <span>{dateText}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock3 className="size-4 text-foreground/70" />
                      <span>{timeText}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <Building2 className="size-4 text-foreground/70" />
                        <span className="truncate">{inspectorForCard?.displayName ?? "Inspector assigned"}</span>
                      </div>
                      {inspectorForCard?.rating ? (
                        <span className="flex items-center gap-1 text-amber-600">
                          <Star className="size-3.5 fill-current" />
                          {inspectorForCard.rating.toFixed(1)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/40 p-3 text-sm text-foreground/85">
                    <p className="font-medium">{meta.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{meta.message}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {meta.to === "/payments" ? (
                      <Button asChild size="sm">
                        <Link to="/payments">{meta.cta}</Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm">
                        <Link to="/inspections/$id" params={{ id: inspection.id }}>
                          {meta.cta}
                        </Link>
                      </Button>
                    )}
                    {inspection.chatUnlocked && inspection.status !== "cancelled" && inspection.status !== "disputed" ? (
                      <Button asChild variant="outline" size="sm" onClick={(event) => event.stopPropagation()}>
                        <Link
                          to="/messages"
                          search={{ c: conversations.find((c) => c.inspectionId === inspection.id)?.id ?? "" }}
                          className="inline-flex items-center gap-2"
                        >
                          <MessageSquareText className="size-4" />
                          Message inspector
                        </Link>
                      </Button>
                    ) : null}
                    {inspection.status === "requested" || inspection.status === "payment_pending" ? (
                      <Button asChild variant="secondary" size="sm">
                        <Link to="/payments" className="inline-flex items-center gap-2">
                          <ShieldCheck className="size-4" />
                          Pay now
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selected && property ? (
        <Card className="overflow-hidden border border-border/80 bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Highlighted</p>
              <h2 className="mt-1 font-display text-2xl">{property.title}</h2>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/inspections/$id" params={{ id: selected.id }} className="inline-flex items-center gap-2">
                Open details
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm text-muted-foreground">
            <div className="rounded-xl border border-border bg-secondary/30 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-foreground/65">Inspector</p>
              <p className="mt-2 font-medium text-foreground">{inspector?.displayName ?? "Inspector assigned"}</p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/30 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-foreground/65">Date</p>
              <p className="mt-2 font-medium text-foreground">{selected.scheduledAt ? formatDateTime(selected.scheduledAt) : "To be scheduled"}</p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/30 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-foreground/65">Fee</p>
              <p className="mt-2 font-medium text-foreground">{formatNaira(selected.fee)}</p>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

export { getInspectionFilter };
