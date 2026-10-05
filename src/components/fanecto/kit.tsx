import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  href,
  invert,
  hint,
}: {
  label: string;
  value: string | number;
  href?: string;
  invert?: boolean;
  hint?: string;
}) {
  const inner = (
    <Card
      className={cn(
        "h-full p-4 transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]",
        invert &&
          "border-0 bg-ops-foreground/5 text-ops-foreground shadow-none hover:bg-ops-foreground/[0.08] hover:shadow-none",
      )}
    >
      <p className={cn("text-xs", invert ? "text-ops-foreground/50" : "text-muted-foreground")}>{label}</p>
      <p className="mt-1 font-display text-2xl tabular-nums tracking-tight sm:text-3xl">{value}</p>
      {hint ? (
        <p className={cn("mt-1 text-xs", invert ? "text-ops-foreground/50" : "text-muted-foreground")}>{hint}</p>
      ) : null}
    </Card>
  );
  if (!href) return inner;
  return (
    <Link to={href as never} className="block min-w-0">
      {inner}
    </Link>
  );
}

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="font-display text-xl font-medium tracking-tight sm:text-2xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function SoftList({ children, invert }: { children: ReactNode; invert?: boolean }) {
  return (
    <ul
      className={cn(
        "divide-y overflow-hidden rounded-2xl",
        invert
          ? "divide-ops-foreground/10 bg-ops-foreground/5"
          : "divide-border bg-card shadow-[var(--shadow-border)]",
      )}
    >
      {children}
    </ul>
  );
}

export function SoftItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <li className={cn("flex flex-wrap items-center justify-between gap-3 px-4 py-3.5", className)}>{children}</li>
  );
}

export function SurfaceCard({
  children,
  className,
  invert,
  hover,
}: {
  children: ReactNode;
  className?: string;
  invert?: boolean;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        invert ? "surface-ops p-4" : "surface p-4",
        hover && !invert && "lift",
        className,
      )}
    >
      {children}
    </div>
  );
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function WeekToggle({
  value,
  onChange,
}: {
  value: Record<string, boolean>;
  onChange: (next: Record<string, boolean>) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {DAYS.map((day) => {
        const on = value[day];
        return (
          <button
            key={day}
            type="button"
            onClick={() => onChange({ ...value, [day]: !on })}
            className={cn(
              "min-h-11 min-w-11 rounded-full px-3 text-xs font-medium transition-colors duration-150",
              on ? "bg-charcoal text-card" : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {day}
          </button>
        );
      })}
    </div>
  );
}
