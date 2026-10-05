import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatNaira } from "@/lib/fanecto/format";
import { cn } from "@/lib/utils";

type Phase = "form" | "processing" | "success" | "failed";

export function MockPay({
  title,
  lines,
  total,
  disclaimer,
  onSuccess,
  successMessage,
  cta = "Pay with Fanecto",
}: {
  title: string;
  lines: { label: string; value: number; muted?: boolean }[];
  total: number;
  disclaimer: string;
  onSuccess: () => void;
  successMessage: string;
  cta?: string;
}) {
  const [phase, setPhase] = useState<Phase>("form");

  function pay() {
    setPhase("processing");
    window.setTimeout(() => {
      const fail = false;
      if (fail) setPhase("failed");
      else {
        setPhase("success");
        onSuccess();
      }
    }, 900);
  }

  return (
    <Card className="p-5">
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm">
        {lines.map((l) => (
          <li key={l.label} className="flex justify-between gap-4">
            <span className={cn(l.muted && "text-muted-foreground")}>{l.label}</span>
            <span className="tabular-nums">{formatNaira(l.value)}</span>
          </li>
        ))}
        <li className="flex justify-between border-t border-border pt-2 font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatNaira(total)}</span>
        </li>
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">{disclaimer}</p>
      {phase === "form" ? (
        <Button className="mt-4 w-full" onClick={pay}>
          {cta}
        </Button>
      ) : null}
      {phase === "processing" ? (
        <p className="mt-4 text-sm text-warning">Processing payment… this is a mock capture.</p>
      ) : null}
      {phase === "success" ? (
        <p className="mt-4 text-sm text-success">{successMessage}</p>
      ) : null}
      {phase === "failed" ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-destructive">Payment failed. No money was captured.</p>
          <Button variant="outline" className="w-full" onClick={() => setPhase("form")}>
            Retry
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
