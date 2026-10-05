import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/fanecto/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPage });

function ForgotPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <Logo />
      <h1 className="mt-8 font-display text-3xl">Reset password</h1>
      {sent ? (
        <p className="mt-3 text-sm text-muted-foreground">
          If this were connected to email, a reset link would be on its way. This demo does not send mail.
        </p>
      ) : (
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required className="mt-1.5" />
          </div>
          <Button type="submit" className="w-full">
            Send reset link
          </Button>
        </form>
      )}
      <Link to="/login" className="mt-6 text-sm text-primary">
        Back to sign in
      </Link>
    </div>
  );
}
