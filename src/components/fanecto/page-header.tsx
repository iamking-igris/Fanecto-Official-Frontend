import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  kicker,
  title,
  description,
  actions,
  invert,
}: {
  kicker?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  invert?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {kicker ? (
          <p
            className={cn(
              "mb-1 text-xs font-semibold uppercase tracking-[0.16em]",
              invert ? "text-primary" : "text-primary",
            )}
          >
            {kicker}
          </p>
        ) : null}
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">{title}</h1>
        {description ? (
          <p className={cn("mt-2 text-sm sm:text-base", invert ? "text-ops-foreground/65" : "text-muted-foreground")}>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
