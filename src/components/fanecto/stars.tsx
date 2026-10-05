import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  value = 0,
  count,
  size = "sm",
}: {
  value?: number;
  count?: number;
  size?: "sm" | "md";
}) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className="inline-flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              size === "sm" ? "size-3.5" : "size-4",
              i < rounded ? "fill-primary text-primary" : "text-border",
            )}
          />
        ))}
      </span>
      {value ? <span className="text-xs tabular-nums">{value.toFixed(1)}</span> : null}
      {typeof count === "number" ? (
        <span className="text-xs">({count})</span>
      ) : null}
    </span>
  );
}
