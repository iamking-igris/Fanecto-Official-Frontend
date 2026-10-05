import { createFileRoute, Link } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/fanecto/empty-state";
import { PageHeader } from "@/components/fanecto/page-header";
import { PropertyCard } from "@/components/fanecto/property-card";
import { SmartShell } from "@/components/layout/smart-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PROPERTY_TYPES } from "@/lib/fanecto/constants";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";
import type { PropertyType } from "@/lib/fanecto/types";
import { z } from "zod";

const searchSchema = z.object({
  q: z.string().optional(),
});

export const Route = createFileRoute("/properties/")({
  component: PropertiesPage,
  validateSearch: searchSchema,
});

function PropertiesPage() {
  const { q: qParam } = Route.useSearch();
  const all = useFanecto((s) => s.properties);
  const [q, setQ] = useState(qParam ?? "");
  const [type, setType] = useState<string>("all");
  const [city, setCity] = useState("all");
  const [inspected, setInspected] = useState("all");
  const [sort, setSort] = useState("newest");
  const [availability, setAvailability] = useState("published");

  const cities = useMemo(() => Array.from(new Set(all.map((p) => p.city))), [all]);

  const filtered = useMemo(() => {
    let rows = all.filter((p) => {
      if (availability === "published" && p.status !== "published") return false;
      if (q) {
        const hay = `${p.title} ${p.area} ${p.city} ${p.description}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      if (type !== "all" && p.type !== type) return false;
      if (city !== "all" && p.city !== city) return false;
      if (inspected === "yes" && !p.inspected) return false;
      if (inspected === "no" && p.inspected) return false;
      return true;
    });
    if (sort === "price-asc") rows = [...rows].sort((a, b) => a.annualRent - b.annualRent);
    if (sort === "price-desc") rows = [...rows].sort((a, b) => b.annualRent - a.annualRent);
    if (sort === "newest") rows = [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return rows;
  }, [all, q, type, city, inspected, sort, availability]);

  const filters = (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <Label className="sr-only">Search</Label>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Area, campus, keywords" />
      </div>
      <Select value={type} onValueChange={setType}>
        <SelectTrigger>
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {PROPERTY_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={city} onValueChange={setCity}>
        <SelectTrigger>
          <SelectValue placeholder="City" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All cities</SelectItem>
          {cities.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={sort} onValueChange={setSort}>
        <SelectTrigger>
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="price-asc">Rent: low to high</SelectItem>
          <SelectItem value="price-desc">Rent: high to low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const user = useCurrentFanectoUser();
  const inWorkspace = user && (user.role === "student" || user.role === "seeker");

  return (
    <SmartShell allow={["student", "seeker"]}>
      <div className={inWorkspace ? "space-y-6" : "mx-auto max-w-6xl px-4 py-10"}>
        <PageHeader
          kicker={inWorkspace ? "Your workspace" : "Marketplace"}
          title="Find a home"
          description={
            inWorkspace
              ? "Search available homes, filter by area and budget, then request an inspection before you commit."
              : "Students and seekers see homes first. Trust information sits on the listing, not in a directory of people."
          }
        />
        <div className="mt-6 hidden lg:block">{filters}</div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="size-4" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-3">
                {filters}
                <Select value={inspected} onValueChange={setInspected}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Inspection: any</SelectItem>
                    <SelectItem value="yes">Inspected by Fanecto</SelectItem>
                    <SelectItem value="no">Not yet inspected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </SheetContent>
          </Sheet>
          <Select value={inspected} onValueChange={setInspected}>
            <SelectTrigger className="hidden w-52 lg:flex">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Inspection: any</SelectItem>
              <SelectItem value="yes">Inspected by Fanecto</SelectItem>
              <SelectItem value="no">Not yet inspected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={availability} onValueChange={setAvailability}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="published">Available</SelectItem>
              <SelectItem value="all">Include closed</SelectItem>
            </SelectContent>
          </Select>
          <p className="ml-auto text-sm text-muted-foreground">{filtered.length} homes</p>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            className="mt-8"
            title="Nothing matching your search yet."
            body="Change the area, clear filters, or browse all available homes."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setQ("");
                  setType("all");
                  setCity("all");
                  setInspected("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Looking for people, not a home?{" "}
          <Link to="/roommates" className="text-primary">
            Roommate listings
          </Link>
        </p>
      </div>
    </SmartShell>
  );
}

void (0 as unknown as PropertyType);
