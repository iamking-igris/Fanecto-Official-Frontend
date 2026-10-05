import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/fanecto/page-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AMENITIES, PROPERTY_TYPES } from "@/lib/fanecto/constants";
import { useCurrentFanectoUser, useFanecto } from "@/lib/fanecto/store";
import type { Property, PropertyType } from "@/lib/fanecto/types";

const STEPS = ["Basics", "Location", "Pricing & units", "Details", "Photos", "Review"];

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1484154216822-a623b0b3d1b2?auto=format&fit=crop&w=1600&q=80",
];

export function ListingWizard({ mode }: { mode: "landlord" | "agent" }) {
  const user = useCurrentFanectoUser();
  const publishListing = useFanecto((s) => s.publishListing);
  const saveListingDraft = useFanecto((s) => s.saveListingDraft);
  const landlords = useFanecto((s) => s.users.filter((u) => u.role === "landlord"));
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [landlordId, setLandlordId] = useState(landlords[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<PropertyType>("self-contain");
  const [city, setCity] = useState("Lagos");
  const [area, setArea] = useState("Yaba");
  const [addressHint, setAddressHint] = useState("");
  const [annualRent, setAnnualRent] = useState("800000");
  const [estateCharge, setEstateCharge] = useState("0");
  const [totalUnits, setTotalUnits] = useState("1");
  const [availableUnits, setAvailableUnits] = useState("1");
  const [bedrooms, setBedrooms] = useState("1");
  const [bathrooms, setBathrooms] = useState("1");
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState<string[]>(["Prepaid meter"]);
  const [images, setImages] = useState<string[]>(SAMPLE_IMAGES.slice(0, 4));
  const [videoUrl, setVideoUrl] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  if (mode === "agent" && user?.verificationStatus !== "verified") {
    return (
      <PageHeader
        kicker="Gated"
        title="Verification required"
        description="Only verified agents can publish eligible listings. Complete verification first."
      />
    );
  }

  const total = Math.max(1, Number(totalUnits) || 1);
  const available = Math.min(total, Math.max(0, Number(availableUnits) || 0));
  const occupied = total - available;

  const payload = {
    title: title || "Untitled listing",
    type,
    bedrooms: Number(bedrooms) || 1,
    bathrooms: Number(bathrooms) || 1,
    toilets: Number(bathrooms) || 1,
    city,
    area,
    state: city === "Abuja" ? "FCT" : city,
    addressHint: addressHint || area,
    annualRent: Number(annualRent) || 0,
    serviceCharge: Number(estateCharge) || undefined,
    totalUnits: total,
    availableUnits: available,
    availableFrom: "2026-11-01",
    landlordId: mode === "landlord" ? user?.id ?? "" : landlordId,
    agentId: mode === "agent" ? user?.id : undefined,
    description: description || "Details to be confirmed at inspection.",
    amenities,
    images: images.length >= 4 ? images : SAMPLE_IMAGES.slice(0, 4),
    videoUrl: videoUrl || undefined,
    furnished: "unfurnished" as const,
  };

  const canContinueFromPhotos = images.length >= 4;

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        kicker={STEPS[step]}
        title={mode === "agent" ? "New authorised listing" : "List a property"}
        description={`Step ${step + 1} of ${STEPS.length}. Homes first — complete the facts a seeker needs before photos.`}
      />
      <Progress value={((step + 1) / STEPS.length) * 100} className="mt-4" />

      <div className="mt-6 space-y-4">
        {step === 0 && (
          <>
            {mode === "agent" ? (
              <div>
                <Label>Landlord who authorised this listing</Label>
                <Select value={landlordId} onValueChange={setLandlordId}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {landlords.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.displayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div>
              <Label>Title</Label>
              <Input className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Bright self-contain near UNILAG gate" />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as PropertyType)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <Label>City</Label>
              <Input className="mt-1.5" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <Label>Area</Label>
              <Input className="mt-1.5" value={area} onChange={(e) => setArea(e.target.value)} />
            </div>
            <div>
              <Label>Location hint (no precise private address required)</Label>
              <Input className="mt-1.5" value={addressHint} onChange={(e) => setAddressHint(e.target.value)} placeholder="Near campus gate / estate name" />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <Label>Annual rent (₦)</Label>
              <Input className="mt-1.5" value={annualRent} onChange={(e) => setAnnualRent(e.target.value)} inputMode="numeric" />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Show annual rent only. Fanecto&apos;s 5% platform fee is applied at rental checkout — not here.
              </p>
            </div>
            <div>
              <Label>Estate / service charge (₦, optional)</Label>
              <Input className="mt-1.5" value={estateCharge} onChange={(e) => setEstateCharge(e.target.value)} inputMode="numeric" />
              <p className="mt-1.5 text-xs text-muted-foreground">Landlord or estate charge only. This is not a Fanecto fee.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Total units</Label>
                <Input className="mt-1.5" value={totalUnits} onChange={(e) => {
                  setTotalUnits(e.target.value);
                  const t = Math.max(1, Number(e.target.value) || 1);
                  if (Number(availableUnits) > t) setAvailableUnits(String(t));
                }} inputMode="numeric" />
              </div>
              <div>
                <Label>Available units</Label>
                <Input className="mt-1.5" value={availableUnits} onChange={(e) => setAvailableUnits(e.target.value)} inputMode="numeric" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Occupied units (calculated): <span className="font-medium text-foreground">{occupied}</span>.
              You can update availability later; units may be rented outside Fanecto.
            </p>
          </>
        )}

        {step === 3 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Bedrooms</Label>
                <Input className="mt-1.5" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
              </div>
              <div>
                <Label>Bathrooms</Label>
                <Input className="mt-1.5" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-1.5" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Honest description of the unit, utilities, and neighbourhood." />
            </div>
            <fieldset>
              <legend className="text-sm font-medium">Amenities</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {AMENITIES.map((a) => (
                  <label key={a} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={amenities.includes(a)}
                      onCheckedChange={(c) =>
                        setAmenities((prev) => (c ? [...prev, a] : prev.filter((x) => x !== a)))
                      }
                    />
                    {a}
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <Label>Photos (minimum 4)</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                At least 4 clear photos of the actual unit. Maximum 1 short video optional.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {images.map((src, i) => (
                  <div key={src + i} className="relative">
                    <img src={src} alt="" className="media h-28 w-full rounded-lg object-cover" />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white"
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="Paste image URL" className="flex-1" />
                <Button type="button" variant="outline" onClick={() => {
                  if (newImageUrl.trim()) {
                    setImages((prev) => [...prev, newImageUrl.trim()]);
                    setNewImageUrl("");
                  }
                }}>
                  Add
                </Button>
              </div>
              {images.length < 4 && (
                <p className="text-sm text-destructive">Add at least {4 - images.length} more photo(s).</p>
              )}
            </div>
            <div>
              <Label>Video URL (optional, max 1)</Label>
              <Input className="mt-1.5" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Optional short tour video URL" />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3 rounded-xl bg-secondary p-4 text-sm">
            <p className="font-medium text-base">{payload.title}</p>
            <p>{payload.area}, {payload.city} · ₦{payload.annualRent.toLocaleString("en-NG")} / year</p>
            <p>Units: {available} available of {total} total ({occupied} occupied)</p>
            <p>{images.length} photos{videoUrl ? " · 1 video" : ""}</p>
            <p className="text-muted-foreground">
              Publishing does not mean Fanecto verified legal ownership. Inspection is a separate flow. Fanecto&apos;s 5% platform fee appears only at rental checkout.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {step > 0 ? (
          <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>Back</Button>
        ) : null}
        {step < STEPS.length - 1 ? (
          <Button type="button" disabled={step === 4 && !canContinueFromPhotos} onClick={() => setStep((s) => s + 1)}>
            Continue
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => {
              if (images.length < 4) {
                toast.error("At least 4 photos are required.");
                return;
              }
              const res = publishListing(payload as Omit<Property, "id" | "createdAt" | "savedCount" | "status" | "inspected">);
              if (!res.ok) toast.error(res.error);
              else {
                toast.success("Listing published to the marketplace.");
                void navigate({ to: mode === "agent" ? "/agent/properties" : "/landlord/properties" });
              }
            }}
          >
            Publish
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={() => { saveListingDraft(payload); toast.message("Draft saved on this device."); }}>
          Save draft
        </Button>
      </div>
    </div>
  );
}
