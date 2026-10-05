import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SCHOOLS } from "@/lib/fanecto/constants";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/roommates/new")({ component: NewRoommate });

function NewRoommate() {
  return (
    <RoleGate allow={["student"]}>
      <Form />
    </RoleGate>
  );
}

function Form() {
  const user = useCurrentFanectoUser();
  const createRoommateListing = useFanecto((s) => s.createRoommateListing);
  const navigate = useNavigate();
  const [budget, setBudget] = useState("400000");
  const [area, setArea] = useState("Yaba, Akoka");
  const [bio, setBio] = useState("");

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-3xl">Post a roommate listing</h1>
      <p className="mt-2 text-sm text-muted-foreground">Free to post. Others pay ₦3,000 to connect.</p>
      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!user) return;
          const id = createRoommateListing({
            displayName: user.displayName,
            school: user.school ?? SCHOOLS[0],
            campus: user.campus ?? "",
            location: user.area,
            preferredArea: area,
            budget: Number(budget) || 0,
            moveIn: "2026-11-01",
            roommatesWanted: 1,
            lifestyle: "Student lifestyle — keep this about housing compatibility.",
            quietSocial: "balanced",
            cleanliness: "tidy",
            smoking: "no",
            pets: "no",
            bio: bio || "Looking for a compatible roommate close to campus.",
          });
          toast.success("Listing published. You didn’t pay to post.");
          void navigate({ to: "/roommates/$id", params: { id } });
        }}
      >
        <div>
          <Label>Preferred area</Label>
          <Input className="mt-1.5" value={area} onChange={(e) => setArea(e.target.value)} />
        </div>
        <div>
          <Label>Budget (annual, ₦)</Label>
          <Input className="mt-1.5" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </div>
        <div>
          <Label>Bio</Label>
          <Textarea className="mt-1.5" value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <Button type="submit">Publish listing</Button>
      </form>
    </div>
  );
}
