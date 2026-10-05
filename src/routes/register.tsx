import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/fanecto/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_HOME, ROLE_LABEL } from "@/lib/fanecto/constants";
import type { Role } from "@/lib/fanecto/types";
import { useFanecto } from "@/lib/fanecto/store";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({ component: RegisterPage });

const roles: { value: Role; label: string; hint: string }[] = [
  { value: "student", label: "Student", hint: "Find housing near campus, inspect, pay rent, find roommates" },
  { value: "seeker", label: "Apartment seeker", hint: "Find homes outside student housing" },
  { value: "landlord", label: "Landlord", hint: "List units, manage availability, receive settlements" },
  { value: "agent", label: "Agent", hint: "List authorised properties, manage leads & agreements" },
  { value: "inspector", label: "Inspector", hint: "Accept inspection jobs and submit reports" },
];

function RegisterPage() {
  const navigate = useNavigate();
  const signIn = useFanecto((s) => s.signIn);
  const [role, setRole] = useState<Role>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-12">
      <Logo />
      <h1 className="mt-8 font-display text-3xl tracking-tight">Create an account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose the role that matches how you will use Fanecto. This demo maps you to a realistic persona of that role.
      </p>
      <form
        className="mt-6 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || !email.trim() || !phone.trim()) {
            toast.error("Please fill in name, email and phone.");
            return;
          }
          setLoading(true);
          const users = useFanecto.getState().users;
          const persona = users.find((u) => u.role === role);
          setTimeout(() => {
            if (persona) {
              signIn(persona.id);
              toast.success(`Welcome, ${persona.displayName} (${ROLE_LABEL[role]})`);
              void navigate({ to: ROLE_HOME[role] });
            } else {
              toast.error("No demo persona available for that role.");
            }
            setLoading(false);
          }, 400);
        }}
      >
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            required
            className="mt-1.5"
            placeholder="e.g. Chioma Adeyemi"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            className="mt-1.5"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            required
            className="mt-1.5"
            placeholder="0803 000 0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <Label>I am a…</Label>
          <div className="mt-2 grid gap-2">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`rounded-xl px-4 py-3 text-left shadow-[var(--shadow-border)] transition-colors duration-150 ${
                  role === r.value ? "bg-charcoal text-card" : "bg-card hover:bg-secondary"
                }`}
              >
                <span className="block text-sm font-medium">{r.label}</span>
                <span
                  className={`mt-0.5 block text-xs ${
                    role === r.value ? "text-card/70" : "text-muted-foreground"
                  }`}
                >
                  {r.hint}
                </span>
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Identity documents are collected later during private verification and are never shown on public profiles.
          Students and seekers cannot publish property listings.
        </p>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Continue"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        Already have a demo account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
