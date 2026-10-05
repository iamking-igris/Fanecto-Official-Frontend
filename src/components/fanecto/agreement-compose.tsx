import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";

export function AgreementCompose({ role }: { role: "landlord" | "agent" }) {
  const user = useCurrentFanectoUser();
  const draftAgreement = useFanecto((s) => s.draftAgreement);
  const counterparts = useFanecto((s) =>
    s.users.filter((u) => (role === "landlord" ? u.role === "agent" && u.verificationStatus === "verified" : u.role === "landlord")),
  );
  const properties = useFanecto((s) =>
    s.properties.filter((p) => (role === "landlord" ? p.landlordId === user?.id : p.agentId === user?.id || p.landlordId === user?.id)),
  );
  const [open, setOpen] = useState(false);
  const [otherId, setOtherId] = useState(counterparts[0]?.id ?? "");
  const [value, setValue] = useState("5");
  const [selected, setSelected] = useState<string[]>([]);
  const [responsibilities, setResponsibilities] = useState(
    "Agent markets covered properties, handles seeker enquiries and coordinates inspections. Landlord remains the contracting party.",
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">New agreement</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Draft commission terms</DialogTitle>
          <DialogDescription>
            Both parties must accept before this becomes active. Fanecto records the agreement; this frontend does not
            settle the commission.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{role === "landlord" ? "Verified agent" : "Landlord"}</Label>
            <Select value={otherId} onValueChange={setOtherId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {counterparts.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Commission (%)</Label>
            <Input className="mt-1.5" value={value} onChange={(e) => setValue(e.target.value)} />
            <p className="mt-1 text-xs text-muted-foreground">Not a locked rate — you negotiate this.</p>
          </div>
          <fieldset>
            <legend className="text-sm font-medium">Properties covered</legend>
            <div className="mt-2 space-y-2">
              {properties.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={selected.includes(p.id)}
                    onCheckedChange={(c) =>
                      setSelected((prev) => (c ? [...prev, p.id] : prev.filter((id) => id !== p.id)))
                    }
                  />
                  {p.title}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <Label>Responsibilities</Label>
            <Textarea className="mt-1.5" value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} />
          </div>
          <Button
            onClick={() => {
              if (!user || !otherId) return;
              const id = draftAgreement({
                landlordId: role === "landlord" ? user.id : otherId,
                agentId: role === "agent" ? user.id : otherId,
                propertyIds: selected,
                commissionType: "percent",
                commissionValue: Number(value) || 0,
                paymentBasis: "On rent collected through Fanecto for covered properties",
                paymentTiming: "After the rental payment is captured",
                responsibilities,
                additionalTerms:
                  "Fanecto records these terms. Commission settlement architecture is an open decision and is not executed here.",
                startDate: new Date().toISOString().slice(0, 10),
              });
              toast.success("Agreement sent. Waiting on the other party.");
              setOpen(false);
              void id;
            }}
          >
            Send for acceptance
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
