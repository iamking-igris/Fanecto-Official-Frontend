import { Link } from "@tanstack/react-router";
import { Heart, MapPin } from "lucide-react";
import { FanectoVerifiedBadge, InspectedBadge } from "@/components/fanecto/badges";
import { Button } from "@/components/ui/button";
import { bedsLabel, formatNaira, propertyTypeLabel } from "@/lib/fanecto/format";
import { useFanecto } from "@/lib/fanecto/store";
import type { Property } from "@/lib/fanecto/types";
import { cn } from "@/lib/utils";

export function PropertyCard({ property, featured }: { property: Property; featured?: boolean }) {
  const saved = useFanecto((s) => s.savedIds.includes(property.id));
  const toggleSave = useFanecto((s) => s.toggleSave);
  const provider = useFanecto((s) =>
    s.users.find((u) => u.id === (property.agentId ?? property.landlordId)),
  );
  const unavailable = property.status !== "published";

  return (
    <article className={cn("group relative flex flex-col", featured && "md:col-span-2")}>
      <Link
        to="/properties/$id"
        params={{ id: property.id }}
        className="relative block overflow-hidden rounded-2xl bg-secondary"
      >
        <img
          src={property.images[0]}
          alt={property.title}
          className={cn(
            "media h-52 w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] sm:h-64",
            featured && "md:h-80",
            unavailable && "opacity-70",
          )}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-charcoal/55 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <InspectedBadge inspected={property.inspected} />
          {unavailable ? (
            <span className="rounded-full bg-card/90 px-2.5 py-0.5 text-[11px] font-medium">
              {property.status === "rented" ? "Rented" : "Unavailable"}
            </span>
          ) : null}
        </div>
      </Link>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label={saved ? "Unsave home" : "Save home"}
        className="absolute right-3 top-3 size-10 rounded-full bg-card/90 shadow-[var(--shadow-border)] transition-transform duration-150 hover:bg-card"
        onClick={(e) => {
          e.preventDefault();
          toggleSave(property.id);
        }}
      >
        <Heart
          className={cn(
            "size-4 transition-[transform,fill,color] duration-200",
            saved && "fill-primary text-primary scale-110",
          )}
        />
      </Button>
      <div className="flex flex-1 flex-col gap-2 px-0.5 pt-3">
        <p className="text-lg font-semibold tabular-nums tracking-tight">
          {formatNaira(property.annualRent)}
          <span className="ml-1 text-xs font-normal text-muted-foreground">/ year</span>
        </p>
        <Link
          to="/properties/$id"
          params={{ id: property.id }}
          className="font-display text-xl font-medium leading-snug tracking-tight transition-colors duration-150 hover:text-primary"
        >
          {property.title}
        </Link>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">
            {property.area}, {property.city}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          {propertyTypeLabel(property.type)} · {bedsLabel(property.bedrooms)} · {property.bathrooms} bath
          {property.totalUnits && property.totalUnits > 1
            ? ` · ${property.availableUnits ?? 0} of ${property.totalUnits} available`
            : null}
        </p>
        {provider ? (
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <span className="truncate text-xs text-muted-foreground">{provider.displayName}</span>
            <FanectoVerifiedBadge user={provider} compact />
          </div>
        ) : null}
      </div>
    </article>
  );
}
