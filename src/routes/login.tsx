import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/fanecto/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_HOME, ROLE_LABEL } from "@/lib/fanecto/constants";
import { demoPersonas } from "@/lib/fanecto/data/users";
import { useFanecto } from "@/lib/fanecto/store";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const users = useFanecto((s) => s.users);
  const signIn = useFanecto((s) => s.signIn);
  const navigate = useNavigate();
  const [email, setEmail] = useState("chioma@student.fanecto.demo");
  const [error, setError] = useState("");

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto grid min-h-dvh max-w-5xl lg:grid-cols-2">
        <div className="relative hidden overflow-hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1600585154340-0ef3d11aceac?auto=format&fit=crop&w=1400&q=80"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-charcoal/45" />
          <div className="absolute bottom-10 left-10 right-10 text-card">
            <p className="font-display text-3xl">Homes first. Trust close behind.</p>
          </div>
        </div>
        <div className="flex flex-col justify-center px-6 py-12">
          <Logo />
          <h1 className="mt-8 font-display text-3xl">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This frontend uses demo personas. Any listed email signs you in as that role. There is no live password
            check.
          </p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
              if (!user) {
                setError("No demo account with that email. Pick a persona below.");
                return;
              }
              signIn(user.id);
              void navigate({ to: ROLE_HOME[user.role] });
            }}
          >
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="pw">Password</Label>
              <Input id="pw" type="password" defaultValue="demo" className="mt-1.5" />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
          <p className="mt-4 text-sm">
            <Link to="/forgot-password" className="text-primary">
              Forgot password
            </Link>
          </p>
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Try a persona</p>
            <ul className="mt-3 space-y-2">
              {demoPersonas.map((p) => {
                const u = users.find((x) => x.id === p.id);
                if (!u) return null;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="w-full rounded-xl bg-card p-3 text-left shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-lift)]"
                      onClick={() => {
                        signIn(u.id);
                        void navigate({ to: ROLE_HOME[u.role] });
                      }}
                    >
                      <p className="text-sm font-medium">
                        {u.displayName} · {ROLE_LABEL[u.role]}
                      </p>
                      <p className="text-xs text-muted-foreground">{p.blurb}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/register" className="text-primary">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
