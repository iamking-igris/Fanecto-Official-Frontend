import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { relativeTime } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";
import { cn } from "@/lib/utils";

export function NotificationCenter({ dark }: { dark?: boolean }) {
  const user = useCurrentFanectoUser();
  const notifications = useFanecto((s) =>
    s.notifications.filter((n) => n.recipientId === user?.id),
  );
  const unread = notifications.filter((n) => !n.read).length;
  const markNotificationsRead = useFanecto((s) => s.markNotificationsRead);

  return (
    <Sheet
      onOpenChange={(open) => {
        if (open && user) markNotificationsRead(user.id);
      }}
    >
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className={cn("relative", dark && "text-ops-foreground hover:bg-ops-foreground/10")}
          aria-label={unread ? `${unread} unread notifications` : "Notifications"}
        >
          <Bell className="size-4" />
          {unread > 0 ? (
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent className={cn(dark && "border-ops-foreground/10 bg-ops text-ops-foreground")}>
        <SheetHeader>
          <SheetTitle className={dark ? "text-ops-foreground" : undefined}>Alerts</SheetTitle>
        </SheetHeader>
        <ul className="mt-6 space-y-2">
          {notifications.length === 0 ? (
            <li className={cn("text-sm", dark ? "text-ops-foreground/60" : "text-muted-foreground")}>
              No alerts yet.
            </li>
          ) : (
            notifications.map((n) => (
              <li key={n.id}>
                <a
                  href={n.href ?? "/"}
                  className={cn(
                    "block rounded-xl px-3 py-3",
                    dark ? "bg-ops-foreground/5 hover:bg-ops-foreground/10" : "bg-secondary hover:bg-muted",
                    !n.read && "ring-1 ring-primary/30",
                  )}
                >
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className={cn("mt-0.5 text-xs", dark ? "text-ops-foreground/60" : "text-muted-foreground")}>
                    {n.body}
                  </p>
                  <p className={cn("mt-1 text-[11px]", dark ? "text-ops-foreground/40" : "text-muted-foreground")}>
                    {relativeTime(n.createdAt)}
                  </p>
                </a>
              </li>
            ))
          )}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
