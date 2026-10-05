import { useNavigate } from "@tanstack/react-router";
import { FanectoVerifiedBadge } from "@/components/fanecto/badges";
import { PageHeader } from "@/components/fanecto/page-header";
import { Stars } from "@/components/fanecto/stars";
import { VerificationPill } from "@/components/fanecto/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_LABEL } from "@/lib/fanecto/constants";
import { formatNaira } from "@/lib/fanecto/format";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";

export function ProfilePanel() {
  const user = useCurrentFanectoUser();
  const signOut = useFanecto((s) => s.signOut);
  const resetDemo = useFanecto((s) => s.resetDemo);
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <PageHeader
        kicker={ROLE_LABEL[user.role]}
        title="Profile"
        description="Identity documents stay private. This page is what you and operations can see — never a National ID number."
      />

      <div className="surface flex items-start gap-4 p-5">
        <img src={user.avatar} alt="" className="size-16 shrink-0 rounded-full object-cover sm:size-20" />
        <div className="min-w-0 space-y-2">
          <p className="font-display text-2xl font-medium tracking-tight">{user.displayName}</p>
          <div className="flex flex-wrap items-center gap-2">
            <VerificationPill status={user.verificationStatus} />
            <FanectoVerifiedBadge user={user} />
          </div>
          {user.rating ? <Stars value={user.rating} count={user.reviewCount} /> : null}
          <p className="text-sm text-muted-foreground">{user.bio}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Email</Label>
          <Input className="mt-1.5" defaultValue={user.email} />
        </div>
        <div>
          <Label>Phone</Label>
          <Input className="mt-1.5" defaultValue={user.phone} />
        </div>
      </div>

      {user.school ? (
        <p className="text-sm text-muted-foreground">
          {user.school}
          {user.campus ? ` · ${user.campus}` : ""}
        </p>
      ) : null}

      {user.serviceAreas?.length ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Service areas</p>
          <p className="mt-1 text-sm">{user.serviceAreas.join(", ")}</p>
        </div>
      ) : null}

      {user.inspectionFee ? (
        <p className="text-sm text-muted-foreground">
          Inspection fee {formatNaira(user.inspectionFee)}
          {user.completedInspections != null ? ` · ${user.completedInspections} completed` : ""}
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Security, notification preferences and live account status will connect to a real backend later. Demo data lives
        on this device.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => {
            signOut();
            void navigate({ to: "/" });
          }}
        >
          Sign out
        </Button>
        <Button variant="ghost" onClick={() => resetDemo()}>
          Reset demo data
        </Button>
      </div>
    </div>
  );
}
