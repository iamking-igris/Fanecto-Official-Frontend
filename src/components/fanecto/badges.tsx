import { BadgeCheck, Eye, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/lib/fanecto/types";
import { cn } from "@/lib/utils";

export function FanectoVerifiedBadge({
  user,
  compact,
}: {
  user?: Pick<User, "role" | "fanectoVerified"> | null;
  compact?: boolean;
}) {
  if (!user?.fanectoVerified) return null;
  const label =
    user.role === "agent"
      ? "Fanecto Verified Agent"
      : user.role === "landlord"
        ? "Fanecto Verified Landlord"
        : user.role === "inspector"
          ? "Fanecto Verified Inspector"
          : "Fanecto Verified";
  return (
    <Badge variant="verified" className={cn("gap-1", compact && "px-2")}>
      <BadgeCheck className="size-3" />
      {compact ? "Verified" : label}
    </Badge>
  );
}

export function InspectedBadge({ inspected }: { inspected?: boolean }) {
  if (!inspected) return null;
  return (
    <Badge variant="inspected">
      <Eye className="size-3" />
      Inspected by Fanecto
    </Badge>
  );
}

export function IdentityVerifiedBadge({ compact }: { compact?: boolean }) {
  return (
    <Badge variant="outline" className="gap-1">
      <ShieldCheck className="size-3 text-primary" />
      {compact ? "ID checked" : "Identity verified"}
    </Badge>
  );
}
