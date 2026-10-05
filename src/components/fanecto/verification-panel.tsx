import { toast } from "sonner";
import { FanectoVerifiedBadge } from "@/components/fanecto/badges";
import { PageHeader } from "@/components/fanecto/page-header";
import { VerificationPill } from "@/components/fanecto/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";

export function VerificationPanel() {
  const user = useCurrentFanectoUser();
  const record = useFanecto((s) => s.verifications.find((v) => v.userId === user?.id));
  const submitVerification = useFanecto((s) => s.submitVerification);
  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader
        kicker="Trust"
        title="Verification"
        description="Basic verification is an operational gate (ID and phone, kept private). Fanecto Verified is a separate designation awarded by Fanecto after observation — it is not sold and not automatic."
      />
      <Card className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <VerificationPill status={user.verificationStatus} />
          <FanectoVerifiedBadge user={user} />
        </div>
        {record?.reason ? <p className="text-sm text-destructive">{record.reason}</p> : null}
        {record?.hasIdOnFile ? (
          <p className="text-xs text-muted-foreground">
            A National ID is on file for review. The number and document are never shown on public profiles.
          </p>
        ) : null}
      </Card>
      {(user.verificationStatus === "unverified" || user.verificationStatus === "rejected") && (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            submitVerification(user.id);
            toast.success("Submitted for review. Nothing sensitive is shown publicly.");
          }}
        >
          <div>
            <Label>Phone</Label>
            <Input className="mt-1.5" defaultValue={user.phone} />
          </div>
          <div>
            <Label>National ID (private)</Label>
            <Input className="mt-1.5" placeholder="Stored privately — never displayed" />
          </div>
          <p className="text-xs text-muted-foreground">
            Do not paste ID numbers into messages or listings. Operations review this off the public marketplace.
          </p>
          <Button type="submit">Submit for review</Button>
        </form>
      )}
      {user.verificationStatus === "pending" ? (
        <p className="text-sm">
          Your verification is being reviewed. Eligible listing actions stay gated for agents until it’s approved.
        </p>
      ) : null}
    </div>
  );
}
