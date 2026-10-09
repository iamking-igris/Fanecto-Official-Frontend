import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HOSTEL_AMENITIES, SCHOOLS } from "@/lib/fanecto/constants";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/roommates/new")({ component: NewRoommate });

function NewRoommate() {
  return (
    <RoleGate allow={["student", "seeker"]}>
      <Form />
    </RoleGate>
  );
}

function Form() {
  const user = useCurrentFanectoUser();
  const createRoommateListing = useFanecto((s) => s.createRoommateListing);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState(user?.area ? `${user.area}, Lagos` : "Yaba, Lagos");
  const [area, setArea] = useState(user?.area ?? "Yaba, Akoka");
  const [housingType, setHousingType] = useState("Mini-flat");
  const [budget, setBudget] = useState("400000");
  const [spaces, setSpaces] = useState("1");
  const [moveIn, setMoveIn] = useState("2026-11-01");
  const [images, setImages] = useState<string[]>([]);
  const [gender, setGender] = useState<"male" | "female" | "other">("female");
  const [lookingFor, setLookingFor] = useState<"male" | "female" | "any">("any");
  const [age, setAge] = useState("21");
  const [occupation, setOccupation] = useState("Student");
  const [level, setLevel] = useState("200 Level");
  const [school, setSchool] = useState(user?.school ?? SCHOOLS[0]);
  const [bio, setBio] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [preview, setPreview] = useState(false);

  function toggleAmenity(a: string) {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  function addPhotos(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      setImages((prev) => [...prev, url]);
    });
  }

  function publish() {
    if (!user) return;
    if (!title.trim()) {
      toast.error("Add a post title");
      return;
    }
    const id = createRoommateListing({
      displayName: user.displayName,
      title: title.trim(),
      school,
      campus: user.campus ?? "",
      location: location.trim(),
      preferredArea: area.trim(),
      housingType,
      budget: Number(budget) || 0,
      moveIn,
      roommatesWanted: Math.max(1, Number(spaces) || 1),
      amenities,
      bio: bio.trim() || "Looking for a roommate for a shared housing arrangement.",
      images:
        images.length > 0
          ? images
          : [
              "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
            ],
      gender,
      lookingFor,
      age: Number(age) || undefined,
      occupation,
      level,
      avatarUrl: user.avatar,
    });
    toast.success("Listing published — free");
    void navigate({ to: "/roommates/$id", params: { id } });
  }

  if (preview) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="font-display text-2xl font-medium">Preview</h1>
        <Card className="overflow-hidden p-0">
          {(images[0] || true) && (
            <img
              src={
                images[0] ??
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80"
              }
              alt=""
              className="aspect-[16/10] w-full object-cover"
            />
          )}
          <div className="space-y-2 p-4">
            <p className="text-xs text-muted-foreground">{location}</p>
            <p className="font-medium">{title || "Untitled"}</p>
            <p className="text-sm text-muted-foreground">
              {housingType} · ₦{Number(budget).toLocaleString()} / year · {spaces} space(s)
            </p>
            <p className="text-sm">
              {user?.displayName} · {gender} · Looking for {lookingFor}
            </p>
            <div className="flex flex-wrap gap-1">
              {amenities.map((a) => (
                <span key={a} className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                  {a}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{bio || "No description"}</p>
          </div>
        </Card>
        <div className="flex flex-wrap gap-2">
          <Button onClick={publish}>Publish listing — Free</Button>
          <Button variant="outline" onClick={() => setPreview(false)}>
            Edit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 pb-12">
      <div>
        <h1 className="font-display text-3xl font-medium">Post a roommate listing</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Free to post. Others pay ₦3,000 to request a connection — you accept or decline.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-medium">1 · The place</h2>
        <div>
          <Label>Photos</Label>
          <Input
            type="file"
            accept="image/*"
            multiple
            className="mt-1.5 cursor-pointer"
            onChange={(e) => {
              addPhotos(e.target.files);
              e.target.value = "";
            }}
          />
          {images.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {images.map((src) => (
                <div key={src} className="relative">
                  <img src={src} alt="" className="size-20 rounded-lg object-cover" />
                  <button
                    type="button"
                    className="absolute -right-1 -top-1 rounded-full bg-destructive px-1.5 text-xs text-destructive-foreground"
                    onClick={() => setImages((prev) => prev.filter((x) => x !== src))}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div>
          <Label htmlFor="title">Post title</Label>
          <Input
            id="title"
            className="mt-1.5"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Mini-flat near Jibowu — one roommate needed"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="loc">Location</Label>
            <Input id="loc" className="mt-1.5" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="area">Preferred area</Label>
            <Input id="area" className="mt-1.5" value={area} onChange={(e) => setArea(e.target.value)} />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="ht">Housing type</Label>
            <Input
              id="ht"
              className="mt-1.5"
              value={housingType}
              onChange={(e) => setHousingType(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="budget">Rent / contribution (₦ / year)</Label>
            <Input id="budget" className="mt-1.5" value={budget} onChange={(e) => setBudget(e.target.value)} />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="spaces">Roommate spaces</Label>
            <Input id="spaces" className="mt-1.5" value={spaces} onChange={(e) => setSpaces(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="move">Move-in date</Label>
            <Input
              id="move"
              type="date"
              className="mt-1.5"
              value={moveIn}
              onChange={(e) => setMoveIn(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-medium">2 · About you</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Gender</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {(["male", "female", "other"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={cn(
                    "min-h-10 rounded-full px-3 text-sm capitalize",
                    gender === g ? "bg-primary text-primary-foreground" : "bg-secondary",
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input id="age" className="mt-1.5" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="occ">Student / occupation</Label>
            <Input
              id="occ"
              className="mt-1.5"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="level">Level / year</Label>
            <Input id="level" className="mt-1.5" value={level} onChange={(e) => setLevel(e.target.value)} />
          </div>
        </div>
        <div>
          <Label htmlFor="school">School / institution</Label>
          <Input id="school" className="mt-1.5" value={school} onChange={(e) => setSchool(e.target.value)} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-medium">3 · Who are you looking for?</h2>
        <div className="flex flex-wrap gap-2">
          {(["male", "female", "any"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setLookingFor(g)}
              className={cn(
                "min-h-10 rounded-full px-3 text-sm capitalize",
                lookingFor === g ? "bg-primary text-primary-foreground" : "bg-secondary",
              )}
            >
              {g === "any" ? "Any" : g}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-medium">4 · Hostel amenities</h2>
        <div className="flex flex-wrap gap-2">
          {HOSTEL_AMENITIES.map((a) => {
            const on = amenities.includes(a);
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={cn(
                  "min-h-10 rounded-full border px-3 text-sm",
                  on
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-secondary",
                )}
              >
                {a}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-medium">5 · Description</h2>
        <Textarea
          className="min-h-28"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Describe the housing situation, available space, and move-in details."
        />
      </section>

      <Button type="button" className="w-full sm:w-auto" onClick={() => setPreview(true)}>
        Preview & publish
      </Button>
    </div>
  );
}
