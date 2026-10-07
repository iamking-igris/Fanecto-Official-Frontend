import { INSPECTION_PLATFORM_RATE, RENTAL_FEE_RATE } from "./constants";
import type {
  AgreementStatus,
  InspectionStatus,
  PaymentStatus,
  PropertyStatus,
  PropertyType,
  VerificationStatus,
} from "./types";

export function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactNaira(amount: number) {
  if (amount >= 1_000_000) {
    const n = amount / 1_000_000;
    return `₦${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}m`;
  }
  if (amount >= 1_000) {
    return `₦${Math.round(amount / 1_000)}k`;
  }
  return formatNaira(amount);
}

export function rentalFee(grossRent: number) {
  return Math.round(grossRent * RENTAL_FEE_RATE);
}

export function rentalTotal(grossRent: number) {
  return grossRent + rentalFee(grossRent);
}

export function inspectionSplit(fee: number) {
  const fanecto = Math.round(fee * INSPECTION_PLATFORM_RATE);
  return { fanecto, inspector: fee - fanecto };
}

export function propertyTypeLabel(type: PropertyType) {
  const map: Record<PropertyType, string> = {
    "self-contain": "Self-contain",
    "mini-flat": "Mini-flat",
    studio: "Studio",
    flat: "Flat",
    "shared-room": "Shared room",
    duplex: "Duplex",
    bungalow: "Bungalow",
  };
  return map[type];
}

export function bedsLabel(n: number) {
  if (n === 0) return "Room";
  return n === 1 ? "1 bed" : `${n} beds`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 14) return `${days}d ago`;
  return formatDate(iso);
}

export function paymentStatusLabel(status: PaymentStatus) {
  const map: Record<PaymentStatus, string> = {
    initiated: "Initiated",
    processing: "Processing",
    captured: "Captured",
    settlement_pending: "Settlement pending",
    settled: "Settled",
    failed: "Failed",
    cancelled: "Cancelled",
    refunded: "Refunded",
    disputed: "Disputed",
  };
  return map[status];
}

export function inspectionStatusLabel(status: InspectionStatus) {
  const map: Record<InspectionStatus, string> = {
    requested: "Pending",
    payment_pending: "Payment required",
    paid: "Awaiting inspector",
    awaiting_confirmation: "Awaiting inspector",
    awaiting_property_authorization: "Awaiting property authorization",
    confirmed: "Confirmed",
    scheduled: "Upcoming",
    in_progress: "In progress",
    completed: "Completed",
    report_ready: "Completed · report ready",
    settlement_pending: "Payout processing",
    settled: "Settled",
    declined: "Inspector declined",
    access_declined: "Access declined",
    cancelled: "Cancelled",
    no_show: "No-show",
    disputed: "Disputed",
  };
  return map[status];
}

export function verificationLabel(status: VerificationStatus) {
  const map: Record<VerificationStatus, string> = {
    unverified: "Unverified",
    pending: "Pending review",
    verified: "Verified",
    rejected: "Rejected",
    suspended: "Suspended",
    expired: "Expired",
  };
  return map[status];
}

export function propertyStatusLabel(status: PropertyStatus) {
  const map: Record<PropertyStatus, string> = {
    draft: "Draft",
    pending: "Pending eligibility",
    published: "Published",
    reserved: "Reserved",
    rented: "Rented",
    unavailable: "Unavailable",
    archived: "Archived",
  };
  return map[status];
}

export function agreementStatusLabel(status: AgreementStatus) {
  const map: Record<AgreementStatus, string> = {
    draft: "Draft",
    sent: "Sent",
    negotiating: "Negotiating",
    accepted: "Accepted",
    active: "Active",
    ended: "Ended",
    rejected: "Rejected",
  };
  return map[status];
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

const PHONE_RE = /(\+?234|0)\s?\d{3}\s?\d{3}\s?\d{4}/;
const CONTACT_HINT =
  /\b(whatsapp|wa\.me|telegram|call me|my number|phone number|meet off platform)\b/i;

export function detectCircumvention(text: string) {
  if (PHONE_RE.test(text) || CONTACT_HINT.test(text)) {
    return "Sharing contact details in a rental conversation can be used to move the transaction off Fanecto and avoid the 5% platform fee.";
  }
  return null;
}
