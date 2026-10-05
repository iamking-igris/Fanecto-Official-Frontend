import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  wordmark = true,
  to = "/",
  invert = false,
}: {
  className?: string;
  wordmark?: boolean;
  to?: string;
  invert?: boolean;
}) {
  return (
    <Link to={to} className={cn("inline-flex items-center gap-2.5", className)} aria-label="Fanecto home">
      <img
        src="/brand/icon.jpg"
        alt=""
        className="size-8 rounded-[9px] object-cover sm:size-9"
      />
      {wordmark ? (
        <span
          className={cn(
            "text-[15px] font-extrabold tracking-[0.14em] sm:text-base",
            invert ? "text-card" : "text-charcoal",
          )}
        >
          FANECTO
        </span>
      ) : null}
    </Link>
  );
}
