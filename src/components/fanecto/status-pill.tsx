import { Badge } from "@/components/ui/badge";
import {
  agreementStatusLabel,
  inspectionStatusLabel,
  paymentStatusLabel,
  propertyStatusLabel,
  verificationLabel,
} from "@/lib/fanecto/format";
import type {
  AgreementStatus,
  InspectionStatus,
  PaymentStatus,
  PropertyStatus,
  VerificationStatus,
} from "@/lib/fanecto/types";

const tone = (s: string): "success" | "warning" | "danger" | "secondary" | "outline" => {
  if (["verified", "published", "active", "settled", "captured", "completed", "report_ready", "paid", "connected", "confirmed", "scheduled"].includes(s))
    return "success";
  if (["pending", "processing", "settlement_pending", "negotiating", "in_progress", "payment_pending", "awaiting_confirmation", "awaiting_property_authorization", "paid"].includes(s))
    return "warning";
  if (["rejected", "suspended", "failed", "disputed", "cancelled", "restricted", "declined", "access_declined"].includes(s)) return "danger";
  if (["rented", "unavailable", "ended", "archived"].includes(s)) return "outline";
  return "secondary";
};

export function StatusPill({ children, status }: { children: string; status: string }) {
  return <Badge variant={tone(status)}>{children}</Badge>;
}

export function PaymentPill({ status }: { status: PaymentStatus }) {
  return <StatusPill status={status}>{paymentStatusLabel(status)}</StatusPill>;
}
export function InspectionPill({ status }: { status: InspectionStatus }) {
  return <StatusPill status={status}>{inspectionStatusLabel(status)}</StatusPill>;
}
export function VerificationPill({ status }: { status: VerificationStatus }) {
  return <StatusPill status={status}>{verificationLabel(status)}</StatusPill>;
}
export function PropertyPill({ status }: { status: PropertyStatus }) {
  return <StatusPill status={status}>{propertyStatusLabel(status)}</StatusPill>;
}
export function AgreementPill({ status }: { status: AgreementStatus }) {
  return <StatusPill status={status}>{agreementStatusLabel(status)}</StatusPill>;
}
