import { useNavigate } from "@tanstack/react-router";
import { demoPersonas } from "@/lib/fanecto/data/users";
import { ROLE_HOME, ROLE_LABEL } from "@/lib/fanecto/constants";
import { useFanecto } from "@/lib/fanecto/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DemoSwitcher({ compact }: { compact?: boolean }) {
  const users = useFanecto((s) => s.users);
  const sessionUserId = useFanecto((s) => s.sessionUserId);
  const signIn = useFanecto((s) => s.signIn);
  const signOut = useFanecto((s) => s.signOut);
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      {!compact ? (
        <span className="hidden text-[11px] uppercase tracking-[0.14em] text-muted-foreground lg:inline">
          Demo
        </span>
      ) : null}
      <Select
        value={sessionUserId ?? "guest"}
        onValueChange={(id) => {
          if (id === "guest") {
            signOut();
            void navigate({ to: "/" });
            return;
          }
          signIn(id);
          const user = users.find((u) => u.id === id);
          if (user) void navigate({ to: ROLE_HOME[user.role] });
        }}
      >
        <SelectTrigger className="h-9 w-[min(100%,13.5rem)] rounded-full bg-card text-xs">
          <SelectValue placeholder="Try a role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="guest">Guest · browse homes</SelectItem>
          {demoPersonas.map((p) => {
            const u = users.find((x) => x.id === p.id);
            if (!u) return null;
            return (
              <SelectItem key={p.id} value={p.id}>
                {u.firstName} · {ROLE_LABEL[u.role]}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
