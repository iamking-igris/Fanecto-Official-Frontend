import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-10",
        className,
      )}
    >
      <h3 className="font-display text-2xl font-medium tracking-tight">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{body}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something didn’t load",
  body = "This is a frontend demo. Try again or switch persona from the header.",
  onRetry,
}: {
  title?: string;
  body?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      title={title}
      body={body}
      action={
        onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        ) : null
      }
    />
  );
}
