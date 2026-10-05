import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/fanecto/page-header";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROLE_LABEL } from "@/lib/fanecto/constants";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/settings")({ component: SettingsRoute });

function SettingsRoute() {
  return (
    <RoleGate allow={["student", "seeker", "landlord", "agent", "inspector", "admin"]}>
      <SettingsPage />
    </RoleGate>
  );
}

function SettingsPage() {
  const user = useCurrentFanectoUser();
  const signOut = useFanecto((s) => s.signOut);
  const navigate = useNavigate();
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <PageHeader
        kicker="Account"
        title="Settings"
        description={`${ROLE_LABEL[user.role]} · manage profile preferences and security.`}
      />

      <section className="space-y-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-semibold">Profile</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Display name</Label>
            <Input className="mt-1.5" defaultValue={user.displayName} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input className="mt-1.5" defaultValue={user.phone} />
          </div>
          <div className="sm:col-span-2">
            <Label>Email</Label>
            <Input className="mt-1.5" defaultValue={user.email} />
          </div>
        </div>
        <Button
          type="button"
          onClick={() => toast.success("Profile saved.")}
        >
          Save changes
        </Button>
      </section>

      <section className="space-y-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-semibold">Notifications</h2>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Email updates</p>
            <p className="text-xs text-muted-foreground">Payments, inspections and verification outcomes</p>
          </div>
          <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">SMS alerts</p>
            <p className="text-xs text-muted-foreground">High-priority inspection and payment events</p>
          </div>
          <Switch checked={smsNotif} onCheckedChange={setSmsNotif} />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-semibold">Security</h2>
        <div>
          <Label>New password</Label>
          <Input type="password" className="mt-1.5" placeholder="••••••••" />
        </div>
        <Button type="button" variant="outline" onClick={() => toast.success("Password updated.")}>
          Update password
        </Button>
      </section>

      <section className="space-y-3 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-semibold">Support</h2>
        <p className="text-sm text-muted-foreground">Need help with a listing, inspection or payment?</p>
        <Button asChild variant="outline">
          <Link to="/help">Open Help & Support</Link>
        </Button>
      </section>

      <section className="space-y-3 rounded-2xl border border-destructive/20 bg-card p-5">
        <h2 className="font-semibold text-destructive">Danger zone</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              signOut();
              toast.message("Signed out.");
              void navigate({ to: "/" });
            }}
          >
            Sign out
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            Delete account
          </Button>
        </div>
      </section>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account?</DialogTitle>
            <DialogDescription>
              This removes your Fanecto access. Active listings, open inspections and payment history may be retained
              where required for disputes. This action cannot be undone from the app.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteOpen(false);
                signOut();
                toast.success("Account deletion requested.");
                void navigate({ to: "/" });
              }}
            >
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
