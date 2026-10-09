export type Role =
  | "student"
  | "seeker"
  | "landlord"
  | "agent"
  | "inspector"
  | "admin";

export type AccountStatus = "active" | "suspended" | "restricted";

export type VerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected"
  | "suspended"
  | "expired";

export type PropertyType =
  | "self-contain"
  | "mini-flat"
  | "studio"
  | "flat"
  | "shared-room"
  | "duplex"
  | "bungalow";

export type PropertyStatus =
  | "draft"
  | "pending"
  | "published"
  | "reserved"
  | "rented"
  | "unavailable"
  | "archived";

export type InspectionStatus =
  | "requested"
  | "payment_pending"
  | "paid"
  | "awaiting_confirmation"
  | "awaiting_property_authorization"
  | "confirmed"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "report_ready"
  | "settlement_pending"
  | "settled"
  | "declined"
  | "access_declined"
  | "cancelled"
  | "no_show"
  | "disputed";

export type PropertyAuthorizationStatus =
  | "not_required"
  | "pending"
  | "approved"
  | "declined"
  | "reschedule_suggested";

export type InspectionReportStatus = "not_submitted" | "draft" | "ready";
export type InspectionPayoutStatus = "pending" | "processing" | "paid" | "not_applicable";

export type PaymentKind = "rental" | "inspection" | "roommate";

export type PaymentStatus =
  | "initiated"
  | "processing"
  | "captured"
  | "settlement_pending"
  | "settled"
  | "failed"
  | "cancelled"
  | "refunded"
  | "disputed";

export type AgreementStatus =
  | "draft"
  | "sent"
  | "negotiating"
  | "accepted"
  | "active"
  | "ended"
  | "rejected";

export type RoommateListingStatus = "draft" | "active" | "paused" | "closed";
/** @deprecated use RoommateListingStatus / RoommateConnectionStatus */
export type RoommateStatus = RoommateListingStatus | RoommateConnectionStatus | "connected" | "connection_requested";
export type RoommateConnectionStatus = "pending" | "accepted" | "declined";

export type ConversationContext = "rental" | "inspection" | "roommate" | "agreement";

export type ReviewTarget = "landlord" | "agent" | "inspector";

export interface User {
  id: string;
  role: Role;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string;
  avatar: string;
  city: string;
  area: string;
  bio: string;
  accountStatus: AccountStatus;
  verificationStatus: VerificationStatus;
  fanectoVerified: boolean;
  school?: string;
  campus?: string;
  rating?: number;
  reviewCount?: number;
  joinedAt: string;
  serviceAreas?: string[];
  inspectionFee?: number;
  completedInspections?: number;
}

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  city: string;
  area: string;
  state: string;
  addressHint: string;
  annualRent: number;
  serviceCharge?: number;
  totalUnits?: number;
  availableUnits?: number;
  availableFrom: string;
  status: PropertyStatus;
  inspected: boolean;
  lastInspectedAt?: string;
  landlordId: string;
  agentId?: string;
  description: string;
  amenities: string[];
  images: string[];
  videoUrl?: string;
  furnished: "furnished" | "semi-furnished" | "unfurnished";
  createdAt: string;
  savedCount: number;
}

export interface AvailabilityChange {
  id: string;
  propertyId: string;
  actorId: string;
  previousAvailable: number;
  newAvailable: number;
  reason?: string;
  createdAt: string;
}

export interface InspectionEvidencePhoto {
  id: string;
  url: string;
  category: string;
}

export interface InspectionReport {
  roomsChecked: string[];
  conditionSummary: string;
  utilities: string;
  visibleIssues: string[];
  listingVsObserved: string;
  notes: string;
  evidence: string[];
  disclaimer: string;
  completedAt?: string;
  propertyType?: string;
  generalCondition?: string;
  matchesListing?: string;
  accessible?: string;
  water?: {
    status?: string;
    source?: string;
    availability?: string;
    pressure?: string;
    notes?: string;
  };
  electricity?: {
    available?: string;
    condition?: string;
    backup?: string;
    meter?: string;
    fittings?: string;
    notes?: string;
  };
  interior?: {
    living?: Record<string, string>;
    bedroom?: Record<string, string>;
    kitchen?: Record<string, string>;
    bathroom?: Record<string, string>;
  };
  environment?: {
    drainage?: string;
    roadAccess?: string;
    floodingSigns?: string;
    noise?: string;
    general?: string;
  };
  security?: {
    access?: string;
    gate?: string;
    surroundings?: string;
    featuresObserved?: string;
  };
  presentDuring?: string;
  photos?: InspectionEvidencePhoto[];
  videoUrl?: string;
  isDraft?: boolean;
}

export interface Inspection {
  id: string;
  propertyId: string;
  seekerId: string;
  inspectorId: string;
  fee: number;
  status: InspectionStatus;
  scheduledAt?: string;
  paidAt?: string;
  chatUnlocked: boolean;
  report?: InspectionReport;
  reportStatus?: InspectionReportStatus;
  payoutStatus?: InspectionPayoutStatus;
  propertyAuthorizationStatus?: PropertyAuthorizationStatus;
  suggestedScheduledAt?: string;
  submittedAt?: string;
  completedAt?: string;
  /** Student's rating for THIS inspection (0 = not rated) */
  clientRating?: number;
  ratingSubmitted?: boolean;
  ratingComment?: string;
  createdAt: string;
}

export interface RentalTransaction {
  id: string;
  kind: "rental";
  propertyId: string;
  payerId: string;
  landlordId: string;
  agentId?: string;
  grossRent: number;
  fanectoFee: number;
  status: PaymentStatus;
  createdAt: string;
  settledAt?: string;
  reference: string;
}

export interface InspectionPayment {
  id: string;
  kind: "inspection";
  inspectionId: string;
  payerId: string;
  inspectorId: string;
  amount: number;
  fanectoShare: number;
  inspectorShare: number;
  status: PaymentStatus;
  createdAt: string;
  settledAt?: string;
  reference: string;
}

export interface RoommatePayment {
  id: string;
  kind: "roommate";
  connectionId: string;
  payerId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  reference: string;
}


export interface PaymentRequest {
  id: string;
  propertyId: string;
  conversationId?: string;
  fromUserId: string;
  toUserId: string;
  periodStart: string;
  periodEnd: string;
  annualRent: number;
  fanectoFee: number;
  agentCommission?: number;
  totalPayable: number;
  notes?: string;
  dueDate: string;
  status: "awaiting_payment" | "paid" | "cancelled" | "expired";
  createdAt: string;
  paidAt?: string;
  paymentId?: string;
}

export type Payment = RentalTransaction | InspectionPayment | RoommatePayment;

export interface RoommateListing {
  id: string;
  creatorId: string;
  displayName: string;
  title: string;
  school: string;
  campus: string;
  location: string;
  preferredArea: string;
  housingType?: string;
  budget: number;
  moveIn: string;
  roommatesWanted: number;
  /** Hostel amenities only — no lifestyle/dating fields */
  amenities: string[];
  bio: string;
  /** Housing / room photos */
  images: string[];
  gender?: "male" | "female" | "other";
  lookingFor?: "male" | "female" | "any";
  age?: number;
  occupation?: string;
  level?: string;
  avatarUrl?: string;
  status: RoommateListingStatus;
  createdAt: string;
}

export interface RoommateConnection {
  id: string;
  listingId: string;
  seekerId: string;
  creatorId: string;
  fee: number;
  paid: boolean;
  /** Only true after owner accepts */
  chatUnlocked: boolean;
  status: RoommateConnectionStatus;
  createdAt: string;
}

export interface AgentAgreement {
  id: string;
  landlordId: string;
  agentId: string;
  propertyIds: string[];
  commissionType: "percent" | "amount";
  commissionValue: number;
  paymentBasis: string;
  paymentTiming: string;
  responsibilities: string;
  additionalTerms: string;
  startDate: string;
  endDate?: string;
  status: AgreementStatus;
  version: number;
  history: { at: string; actorId: string; action: string; note?: string }[];
  landlordAccepted: boolean;
  agentAccepted: boolean;
  createdAt: string;
}

export interface Authorization {
  id: string;
  landlordId: string;
  agentId: string;
  propertyIds: string[];
  status: "active" | "revoked" | "pending";
  createdAt: string;
}

export interface Conversation {
  id: string;
  context: ConversationContext;
  title: string;
  participantIds: string[];
  propertyId?: string;
  inspectionId?: string;
  roommateListingId?: string;
  agreementId?: string;
  circumventionWarnings: number;
  restricted: boolean;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  flagged?: boolean;
  warning?: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  targetUserId: string;
  targetRole: ReviewTarget;
  interactionId: string;
  interactionType: "rental" | "inspection";
  rating: number;
  text: string;
  status: "visible" | "reported" | "hidden";
  createdAt: string;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  type: string;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt: string;
}

export interface UserReport {
  id: string;
  reporterId: string;
  targetType: "property" | "user" | "review" | "message";
  targetId: string;
  reason: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  resolution?: string;
  createdAt: string;
}

export interface Suspension {
  id: string;
  targetUserId: string;
  type: "suspended" | "restricted";
  reason: string;
  actorId: string;
  startAt: string;
  endAt?: string;
  status: "active" | "lifted";
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  target: string;
  reason?: string;
  createdAt: string;
}

export interface VerificationRecord {
  id: string;
  userId: string;
  status: VerificationStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewerId?: string;
  reason?: string;
  hasIdOnFile: boolean;
  phoneOnFile: boolean;
}

export const INSPECTION_DISCLAIMER =
  "This report records what the inspector physically observed at the property. It is not a legal title search, ownership confirmation, or government record verification.";
