import { createWithEqualityFn } from "zustand/traditional";
import { persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import {
  agreements as seedAgreements,
  auditLogs as seedAudit,
  authorizations as seedAuthz,
  conversations as seedConversations,
  inspections as seedInspections,
  messages as seedMessages,
  notifications as seedNotifications,
  payments as seedPayments,
  pendingReviewPrompts as seedPrompts,
  reports as seedReports,
  reviews as seedReviews,
  roommateConnections as seedConnections,
  roommateListings as seedRoommates,
  suspensions as seedSuspensions,
} from "./data/activity";
import { properties as seedProperties } from "./data/properties";
import { users as seedUsers, verificationRecords as seedVerifications } from "./data/users";
import { detectCircumvention, inspectionSplit, rentalFee } from "./format";
import { ROOMMATE_CONNECTION_FEE } from "./constants";
import type {
  AgentAgreement,
  AppNotification,
  AuditLog,
  ChatMessage,
  Conversation,
  Inspection,
  Payment,
  Property,
  Review,
  ReviewTarget,
  RoommateConnection,
  RoommateListing,
  User,
  UserReport,
  AvailabilityChange,
  PaymentRequest,
  VerificationRecord,
  VerificationStatus,
} from "./types";
import { INSPECTION_DISCLAIMER } from "./types";

export type ReviewPrompt = {
  id: string;
  reviewerId: string;
  targetUserId: string;
  targetRole: ReviewTarget;
  interactionId: string;
  interactionType: "rental" | "inspection";
  title: string;
};

interface FanectoState {
  users: User[];
  properties: Property[];
  inspections: Inspection[];
  payments: Payment[];
  roommateListings: RoommateListing[];
  roommateConnections: RoommateConnection[];
  agreements: AgentAgreement[];
  authorizations: typeof seedAuthz;
  conversations: Conversation[];
  messages: ChatMessage[];
  reviews: Review[];
  reviewPrompts: ReviewPrompt[];
  notifications: AppNotification[];
  reports: UserReport[];
  suspensions: typeof seedSuspensions;
  auditLogs: AuditLog[];
  verifications: VerificationRecord[];
  sessionUserId: string | null;
  savedIds: string[];
  dismissedPrompts: string[];
  listingDraft: Partial<Property> | null;
  availabilityChanges: AvailabilityChange[];
  paymentRequests: PaymentRequest[];
}

interface FanectoActions {
  currentUser: () => User | null;
  signIn: (userId: string) => void;
  signOut: () => void;
  toggleSave: (propertyId: string) => void;
  sendMessage: (conversationId: string, body: string) => { warned?: string; blocked?: boolean };
  startRentalConversation: (propertyId: string) => string;
  bookAndPayInspection: (propertyId: string, inspectorId: string) => string;
  scheduleInspection: (inspectionId: string, iso: string) => void;
  acceptInspection: (inspectionId: string) => void;
  declineInspection: (inspectionId: string) => void;
  approvePropertyAccess: (inspectionId: string) => void;
  declinePropertyAccess: (inspectionId: string) => void;
  suggestInspectionTime: (inspectionId: string, iso: string) => void;
  startInspection: (inspectionId: string) => void;
  saveInspectionReportDraft: (inspectionId: string, report: NonNullable<Inspection["report"]>) => void;
  completeInspection: (inspectionId: string, report: NonNullable<Inspection["report"]>) => void;
  setInspectionStatus: (inspectionId: string, status: Inspection["status"]) => void;
  payRent: (propertyId: string) => { ok: boolean; error?: string; paymentId?: string };
  createRoommateListing: (listing: Omit<RoommateListing, "id" | "createdAt" | "status" | "creatorId">) => string;
  payRoommateConnection: (listingId: string) => { ok: boolean; error?: string };
  rateInspection: (inspectionId: string, rating: number, comment?: string) => void;
  submitReview: (promptId: string, rating: number, text: string) => void;
  dismissPrompt: (promptId: string) => void;
  submitVerification: (userId: string) => void;
  saveListingDraft: (draft: Partial<Property>) => void;
  publishListing: (
    input: Omit<Property, "id" | "createdAt" | "savedCount" | "status" | "inspected"> & {
      status?: Property["status"];
    },
  ) => { ok: boolean; error?: string; id?: string };
  updatePropertyStatus: (id: string, status: Property["status"]) => void;
  updateAvailability: (propertyId: string, availableUnits: number, reason?: string) => { ok: boolean; error?: string };
  createPaymentRequest: (input: {
    propertyId: string;
    toUserId: string;
    conversationId?: string;
    periodStart: string;
    periodEnd: string;
    annualRent: number;
    agentCommission?: number;
    notes?: string;
    dueDate: string;
  }) => { ok: boolean; error?: string; id?: string };
  payPaymentRequest: (id: string) => { ok: boolean; error?: string };
  markNotificationsRead: (userId: string) => void;
  fileReport: (report: Omit<UserReport, "id" | "createdAt" | "status">) => void;
  adminSetVerification: (userId: string, status: VerificationStatus, reason?: string) => void;
  adminToggleFanectoVerified: (userId: string, award: boolean, reason: string) => void;
  adminSuspend: (userId: string, reason: string) => void;
  adminLift: (userId: string) => void;
  adminResolveReport: (id: string, resolution: string, status: UserReport["status"]) => void;
  adminHideReview: (id: string) => void;
  settlePayment: (id: string) => void;
  upsertAgreement: (agreement: AgentAgreement) => void;
  draftAgreement: (
    input: Omit<
      AgentAgreement,
      "id" | "createdAt" | "history" | "version" | "landlordAccepted" | "agentAccepted" | "status"
    >,
  ) => string;
  proposeAgreementChange: (id: string, userId: string, note: string, commissionValue: number) => void;
  acceptAgreement: (id: string, userId: string) => void;
  rejectAgreement: (id: string, userId: string, note: string) => void;
  endAgreement: (id: string, userId: string) => void;
  revokeAuthorization: (id: string) => void;
  addNotification: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  audit: (action: string, target: string, reason?: string) => void;
  resetDemo: () => void;
}

function nid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function now() {
  return new Date().toISOString();
}

const seed = (): FanectoState => ({
  users: seedUsers,
  properties: seedProperties,
  inspections: seedInspections,
  payments: seedPayments,
  roommateListings: seedRoommates,
  roommateConnections: seedConnections,
  agreements: seedAgreements,
  authorizations: seedAuthz,
  conversations: seedConversations,
  messages: seedMessages,
  reviews: seedReviews,
  reviewPrompts: seedPrompts,
  notifications: seedNotifications,
  reports: seedReports,
  suspensions: seedSuspensions,
  auditLogs: seedAudit,
  verifications: seedVerifications,
  sessionUserId: null,
  savedIds: ["p-akoka-self", "p-yaba-mini", "p-gbagada-shared"],
  dismissedPrompts: [],
  listingDraft: null,
  availabilityChanges: [],
  paymentRequests: [],
});

export const useFanecto = createWithEqualityFn<FanectoState & FanectoActions>()(
  persist(
    (set, get) => ({
      ...seed(),
      currentUser: () => get().users.find((u) => u.id === get().sessionUserId) ?? null,
      signIn: (userId) => set({ sessionUserId: userId }),
      signOut: () => set({ sessionUserId: null }),
      toggleSave: (propertyId) =>
        set((s) => ({
          savedIds: s.savedIds.includes(propertyId)
            ? s.savedIds.filter((id) => id !== propertyId)
            : [...s.savedIds, propertyId],
        })),
      sendMessage: (conversationId, body) => {
        const s = get();
        const user = s.currentUser();
        if (!user) return { blocked: true };
        const conv = s.conversations.find((c) => c.id === conversationId);
        if (!conv) return { blocked: true };
        if (conv.restricted) return { blocked: true };
        let warned: string | undefined;
        let circumventionWarnings = conv.circumventionWarnings;
        let restricted: boolean = conv.restricted;
        if (conv.context === "rental") {
          const hit = detectCircumvention(body);
          if (hit) {
            warned = hit;
            circumventionWarnings += 1;
            if (circumventionWarnings >= 3) restricted = true;
          }
        }
        const msg: ChatMessage = {
          id: nid("m"),
          conversationId,
          senderId: user.id,
          body,
          createdAt: now(),
          flagged: Boolean(warned),
          warning: warned,
        };
        set({
          messages: [...s.messages, msg],
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, circumventionWarnings, restricted, updatedAt: now() }
              : c,
          ),
        });
        return { warned, blocked: restricted && circumventionWarnings >= 3 };
      },
      startRentalConversation: (propertyId) => {
        const s = get();
        const user = s.currentUser();
        const property = s.properties.find((p) => p.id === propertyId);
        if (!user || !property) return "";
        const other = property.agentId ?? property.landlordId;
        const existing = s.conversations.find(
          (c) =>
            c.context === "rental" &&
            c.propertyId === propertyId &&
            c.participantIds.includes(user.id) &&
            c.participantIds.includes(other),
        );
        if (existing) return existing.id;
        const conv: Conversation = {
          id: nid("cv"),
          context: "rental",
          title: property.title,
          participantIds: [user.id, other],
          propertyId,
          circumventionWarnings: 0,
          restricted: false,
          updatedAt: now(),
        };
        set({ conversations: [conv, ...s.conversations] });
        return conv.id;
      },
      bookAndPayInspection: (propertyId, inspectorId) => {
        const s = get();
        const user = s.currentUser();
        const inspector = s.users.find((u) => u.id === inspectorId);
        if (!user || !inspector) return "";
        const fee = inspector.inspectionFee ?? 25000;
        const split = inspectionSplit(fee);
        const inspection: Inspection = {
          id: nid("ins"),
          propertyId,
          seekerId: user.id,
          inspectorId,
          fee,
          status: "awaiting_confirmation",
          paidAt: now(),
          chatUnlocked: true,
          reportStatus: "not_submitted",
          payoutStatus: "pending",
          propertyAuthorizationStatus: "not_required",
          createdAt: now(),
        };
        const payment: Payment = {
          id: nid("pay"),
          kind: "inspection",
          inspectionId: inspection.id,
          payerId: user.id,
          inspectorId,
          amount: fee,
          fanectoShare: split.fanecto,
          inspectorShare: split.inspector,
          status: "captured",
          createdAt: now(),
          reference: `FCT-INS-${Math.floor(10000 + Math.random() * 89999)}`,
        };
        const conv: Conversation = {
          id: nid("cv"),
          context: "inspection",
          title: `Inspection · ${s.properties.find((p) => p.id === propertyId)?.title ?? "Property"}`,
          participantIds: [user.id, inspectorId],
          propertyId,
          inspectionId: inspection.id,
          circumventionWarnings: 0,
          restricted: false,
          updatedAt: now(),
        };
        set({
          inspections: [inspection, ...s.inspections],
          payments: [payment, ...s.payments],
          conversations: [conv, ...s.conversations],
          notifications: [
            {
              id: nid("n"),
              recipientId: inspectorId,
              type: "inspection_payment",
              title: "Inspection paid",
              body: `${user.displayName} paid ${fee.toLocaleString("en-NG")}. Chat is unlocked.`,
              href: `/inspector/inspections/${inspection.id}`,
              read: false,
              createdAt: now(),
            },
            {
              id: nid("n"),
              recipientId: user.id,
              type: "inspection_payment",
              title: "Inspection payment captured",
              body: "Chat with your inspector is unlocked. Contact sharing is allowed.",
              href: "/inspections",
              read: false,
              createdAt: now(),
            },
            ...s.notifications,
          ],
        });
        return inspection.id;
      },

      acceptInspection: (inspectionId) =>
        set((st) => {
          const ins = st.inspections.find((i) => i.id === inspectionId);
          if (!ins) return st;
          const property = st.properties.find((p) => p.id === ins.propertyId);
          const notifyOwners = [property?.landlordId, property?.agentId].filter(Boolean) as string[];
          return {
            inspections: st.inspections.map((i) =>
              i.id === inspectionId
                ? {
                    ...i,
                    status: "awaiting_property_authorization",
                    propertyAuthorizationStatus: "pending",
                    scheduledAt: i.scheduledAt ?? now(),
                  }
                : i,
            ),
            notifications: [
              {
                id: nid("n"),
                recipientId: ins.seekerId,
                type: "inspection_update",
                title: "Inspector accepted — awaiting property access",
                body: "The inspector accepted. The landlord or authorized agent must approve access before the visit is confirmed.",
                href: "/inspections",
                read: false,
                createdAt: now(),
              },
              ...notifyOwners.map((rid) => {
                const owner = st.users.find((u) => u.id === rid);
                return {
                  id: nid("n"),
                  recipientId: rid,
                  type: "inspection_update" as const,
                  title: "Inspection access requested",
                  body: "An inspector is requesting access to inspect one of your listings.",
                  href: owner?.role === "agent" ? "/agent/inspections" : "/landlord/inspections",
                  read: false,
                  createdAt: now(),
                };
              }),
              ...st.notifications,
            ],
          };
        }),
      declineInspection: (inspectionId) =>
        set((st) => {
          const ins = st.inspections.find((i) => i.id === inspectionId);
          if (!ins) return st;
          return {
            inspections: st.inspections.map((i) =>
              i.id === inspectionId
                ? { ...i, status: "declined", payoutStatus: "not_applicable" as const }
                : i,
            ),
            notifications: [
              {
                id: nid("n"),
                recipientId: ins.seekerId,
                type: "inspection_update",
                title: "Inspection declined",
                body: "The inspector cannot take this appointment. Payment status is under review.",
                href: "/inspections",
                read: false,
                createdAt: now(),
              },
              ...st.notifications,
            ],
          };
        }),
      approvePropertyAccess: (inspectionId) =>
        set((st) => {
          const ins = st.inspections.find((i) => i.id === inspectionId);
          if (!ins) return st;
          return {
            inspections: st.inspections.map((i) =>
              i.id === inspectionId
                ? {
                    ...i,
                    status: "confirmed",
                    propertyAuthorizationStatus: "approved" as const,
                  }
                : i,
            ),
            notifications: [
              {
                id: nid("n"),
                recipientId: ins.seekerId,
                type: "inspection_update",
                title: "Inspection confirmed",
                body: "Property access was authorized. Your inspection is confirmed.",
                href: "/inspections",
                read: false,
                createdAt: now(),
              },
              {
                id: nid("n"),
                recipientId: ins.inspectorId,
                type: "inspection_update",
                title: "Property access authorized",
                body: "You may proceed with the confirmed inspection appointment.",
                href: `/inspector/inspections/${inspectionId}`,
                read: false,
                createdAt: now(),
              },
              ...st.notifications,
            ],
          };
        }),
      declinePropertyAccess: (inspectionId) =>
        set((st) => {
          const ins = st.inspections.find((i) => i.id === inspectionId);
          if (!ins) return st;
          return {
            inspections: st.inspections.map((i) =>
              i.id === inspectionId
                ? {
                    ...i,
                    status: "access_declined",
                    propertyAuthorizationStatus: "declined" as const,
                    payoutStatus: "not_applicable" as const,
                  }
                : i,
            ),
            notifications: [
              {
                id: nid("n"),
                recipientId: ins.seekerId,
                type: "inspection_update",
                title: "Inspection access declined",
                body: "Property access was not authorized. This inspection cannot proceed.",
                href: "/inspections",
                read: false,
                createdAt: now(),
              },
              {
                id: nid("n"),
                recipientId: ins.inspectorId,
                type: "inspection_update",
                title: "Property access declined",
                body: "The landlord or agent did not authorize access for this inspection.",
                href: `/inspector/inspections/${inspectionId}`,
                read: false,
                createdAt: now(),
              },
              ...st.notifications,
            ],
          };
        }),
      suggestInspectionTime: (inspectionId, iso) =>
        set((st) => {
          const ins = st.inspections.find((i) => i.id === inspectionId);
          if (!ins) return st;
          return {
            inspections: st.inspections.map((i) =>
              i.id === inspectionId
                ? {
                    ...i,
                    suggestedScheduledAt: iso,
                    propertyAuthorizationStatus: "reschedule_suggested" as const,
                    status: "awaiting_property_authorization",
                  }
                : i,
            ),
            notifications: [
              {
                id: nid("n"),
                recipientId: ins.inspectorId,
                type: "inspection_update",
                title: "Another time suggested",
                body: "The property owner suggested a different inspection time.",
                href: `/inspector/inspections/${inspectionId}`,
                read: false,
                createdAt: now(),
              },
              {
                id: nid("n"),
                recipientId: ins.seekerId,
                type: "inspection_update",
                title: "Inspection time suggestion",
                body: "A different inspection time was suggested.",
                href: "/inspections",
                read: false,
                createdAt: now(),
              },
              ...st.notifications,
            ],
          };
        }),
      startInspection: (inspectionId) =>
        set((st) => ({
          inspections: st.inspections.map((i) =>
            i.id === inspectionId && (i.status === "confirmed" || i.status === "scheduled")
              ? { ...i, status: "in_progress" }
              : i,
          ),
        })),
      saveInspectionReportDraft: (inspectionId, report) =>
        set((st) => ({
          inspections: st.inspections.map((i) =>
            i.id === inspectionId
              ? { ...i, report: { ...report, isDraft: true }, reportStatus: "draft" as const }
              : i,
          ),
        })),
      scheduleInspection: (inspectionId, iso) =>
        set((s) => ({
          inspections: s.inspections.map((i) =>
            i.id === inspectionId ? { ...i, scheduledAt: iso, status: "scheduled" } : i,
          ),
        })),
      setInspectionStatus: (inspectionId, status) =>
        set((s) => ({
          inspections: s.inspections.map((i) => (i.id === inspectionId ? { ...i, status } : i)),
        })),
      completeInspection: (inspectionId, report) =>
        set((s) => {
          const inspection = s.inspections.find((i) => i.id === inspectionId);
          if (!inspection) return s;
          const prompt: ReviewPrompt = {
            id: nid("pr"),
            reviewerId: inspection.seekerId,
            targetUserId: inspection.inspectorId,
            targetRole: "inspector",
            interactionId: inspectionId,
            interactionType: "inspection",
            title: "How was this inspection?",
          };
          return {
            inspections: s.inspections.map((i) =>
              i.id === inspectionId
                ? {
                    ...i,
                    status: "report_ready",
                    reportStatus: "ready" as const,
                    payoutStatus: "processing" as const,
                    submittedAt: now(),
                    completedAt: now(),
                    report: {
                      ...report,
                      isDraft: false,
                      disclaimer: INSPECTION_DISCLAIMER,
                      completedAt: now(),
                    },
                  }
                : i,
            ),
            properties: s.properties.map((p) =>
              p.id === inspection.propertyId
                ? { ...p, inspected: true, lastInspectedAt: now() }
                : p,
            ),
            payments: s.payments.map((p) =>
              p.kind === "inspection" && p.inspectionId === inspectionId
                ? { ...p, status: "settlement_pending" }
                : p,
            ),
            reviewPrompts: [prompt, ...s.reviewPrompts],
            notifications: [
              {
                id: nid("n"),
                recipientId: inspection.seekerId,
                type: "inspection_report",
                title: "Inspection report ready",
                body: "The inspector submitted a physical-observation report. This is not a title search.",
                href: "/inspections",
                read: false,
                createdAt: now(),
              },
              ...s.notifications,
            ],
          };
        }),
      payRent: (propertyId) => {
        const s = get();
        const user = s.currentUser();
        const property = s.properties.find((p) => p.id === propertyId);
        if (!user || !property) return { ok: false, error: "Missing session or property." };
        if (property.status !== "published") {
          return { ok: false, error: "This listing is no longer available." };
        }
        const fee = rentalFee(property.annualRent);
        const payment: Payment = {
          id: nid("pay"),
          kind: "rental",
          propertyId,
          payerId: user.id,
          landlordId: property.landlordId,
          agentId: property.agentId,
          grossRent: property.annualRent,
          fanectoFee: fee,
          status: "captured",
          createdAt: now(),
          reference: `FCT-RNT-${Math.floor(10000 + Math.random() * 89999)}`,
        };
        set({
          payments: [payment, ...s.payments],
          properties: s.properties.map((p) =>
            p.id === propertyId ? { ...p, status: "reserved" } : p,
          ),
          reviewPrompts: [
            {
              id: nid("pr"),
              reviewerId: user.id,
              targetUserId: property.agentId ?? property.landlordId,
              targetRole: property.agentId ? "agent" : "landlord",
              interactionId: payment.id,
              interactionType: "rental",
              title: `How was this rental experience?`,
            },
            ...s.reviewPrompts,
          ],
          notifications: [
            {
              id: nid("n"),
              recipientId: property.landlordId,
              type: "rental_payment",
              title: "Rental payment captured",
              body: `${user.displayName} paid rent through Fanecto. 5% platform fee applied.`,
              href: "/landlord/payments",
              read: false,
              createdAt: now(),
            },
            ...s.notifications,
          ],
        });
        return { ok: true, paymentId: payment.id };
      },
      createRoommateListing: (listing) => {
        const user = get().currentUser();
        if (!user) return "";
        const row: RoommateListing = {
          ...listing,
          id: nid("rm"),
          creatorId: user.id,
          status: "active",
          createdAt: now(),
        };
        set((s) => ({ roommateListings: [row, ...s.roommateListings] }));
        return row.id;
      },
      payRoommateConnection: (listingId) => {
        const s = get();
        const user = s.currentUser();
        const listing = s.roommateListings.find((l) => l.id === listingId);
        if (!user || !listing) return { ok: false, error: "Listing not found." };
        if (listing.status === "closed") return { ok: false, error: "This listing is closed." };
        if (listing.creatorId === user.id) return { ok: false, error: "You created this listing." };
        const existing = s.roommateConnections.find(
          (c) => c.listingId === listingId && c.seekerId === user.id && c.paid,
        );
        if (existing) return { ok: true };
        const connection: RoommateConnection = {
          id: nid("rc"),
          listingId,
          seekerId: user.id,
          creatorId: listing.creatorId,
          fee: ROOMMATE_CONNECTION_FEE,
          paid: true,
          chatUnlocked: true,
          status: "connected",
          createdAt: now(),
        };
        const payment: Payment = {
          id: nid("pay"),
          kind: "roommate",
          connectionId: connection.id,
          payerId: user.id,
          amount: ROOMMATE_CONNECTION_FEE,
          status: "captured",
          createdAt: now(),
          reference: `FCT-RM-${Math.floor(10000 + Math.random() * 89999)}`,
        };
        const conv: Conversation = {
          id: nid("cv"),
          context: "roommate",
          title: `Roommate · ${listing.displayName}`,
          participantIds: [user.id, listing.creatorId],
          roommateListingId: listingId,
          circumventionWarnings: 0,
          restricted: false,
          updatedAt: now(),
        };
        set({
          roommateConnections: [connection, ...s.roommateConnections],
          payments: [payment, ...s.payments],
          conversations: [conv, ...s.conversations],
          roommateListings: s.roommateListings.map((l) =>
            l.id === listingId ? { ...l, status: "connected" } : l,
          ),
          notifications: [
            {
              id: nid("n"),
              recipientId: listing.creatorId,
              type: "roommate_connection",
              title: "New roommate connection",
              body: `${user.displayName} paid \u20a63,000 to connect. Chat is unlocked.`,
              href: "/messages",
              read: false,
              createdAt: now(),
            },
            ...s.notifications,
          ],
        });
        return { ok: true };
      },
      rateInspection: (inspectionId, rating, comment) =>
        set((st) => {
          if (rating < 1 || rating > 5) return st;
          const ins = st.inspections.find((i) => i.id === inspectionId);
          if (!ins || ins.ratingSubmitted) return st;
          return {
            inspections: st.inspections.map((i) =>
              i.id === inspectionId
                ? {
                    ...i,
                    clientRating: rating,
                    ratingSubmitted: true,
                    ratingComment: comment?.trim() || undefined,
                  }
                : i,
            ),
          };
        }),
      submitReview: (promptId, rating, text) => {
        const s = get();
        const prompt = s.reviewPrompts.find((p) => p.id === promptId);
        const user = s.currentUser();
        if (!prompt || !user) return;
        const review: Review = {
          id: nid("rv"),
          reviewerId: user.id,
          targetUserId: prompt.targetUserId,
          targetRole: prompt.targetRole,
          interactionId: prompt.interactionId,
          interactionType: prompt.interactionType,
          rating,
          text,
          status: "visible",
          createdAt: now(),
        };
        set({
          reviews: [review, ...s.reviews],
          reviewPrompts: s.reviewPrompts.filter((p) => p.id !== promptId),
          dismissedPrompts: [...s.dismissedPrompts, promptId],
        });
      },
      dismissPrompt: (promptId) =>
        set((s) => ({ dismissedPrompts: [...s.dismissedPrompts, promptId] })),
      submitVerification: (userId) =>
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId ? { ...u, verificationStatus: "pending" } : u,
          ),
          verifications: [
            {
              id: nid("ver"),
              userId,
              status: "pending",
              submittedAt: now(),
              hasIdOnFile: true,
              phoneOnFile: true,
            },
            ...s.verifications.filter((v) => v.userId !== userId),
          ],
        })),
      saveListingDraft: (draft) => set({ listingDraft: draft }),
      publishListing: (input) => {
        const s = get();
        const user = s.currentUser();
        if (!user) return { ok: false, error: "Sign in first." };
        if (user.role === "student" || user.role === "seeker" || user.role === "inspector") {
          return { ok: false, error: "Only landlords and verified agents can publish listings." };
        }
        if (user.role === "agent" && user.verificationStatus !== "verified") {
          return { ok: false, error: "Only verified agents can publish eligible listings." };
        }
        if (user.accountStatus !== "active") {
          return { ok: false, error: "Your account cannot publish listings right now." };
        }
        const row: Property = {
          ...input,
          id: nid("p"),
          status: "published",
          inspected: false,
          createdAt: now(),
          savedCount: 0,
          landlordId: user.role === "landlord" ? user.id : input.landlordId,
          agentId: user.role === "agent" ? user.id : input.agentId,
        };
        set({ properties: [row, ...s.properties], listingDraft: null });
        return { ok: true, id: row.id };
      },
      updatePropertyStatus: (id, status) =>
        set((s) => ({
          properties: s.properties.map((p) => (p.id === id ? { ...p, status } : p)),
        })),
      updateAvailability: (propertyId, availableUnits, reason) => {
        const s = get();
        const user = s.currentUser();
        if (!user) return { ok: false, error: "Sign in first." };
        const prop = s.properties.find((p) => p.id === propertyId);
        if (!prop) return { ok: false, error: "Property not found." };
        const total = prop.totalUnits ?? 1;
        const next = Math.max(0, Math.min(total, Math.round(availableUnits)));
        const prev = prop.availableUnits ?? total;
        if (next === prev) return { ok: true };
        const entry: AvailabilityChange = {
          id: nid("av"),
          propertyId,
          actorId: user.id,
          previousAvailable: prev,
          newAvailable: next,
          reason,
          createdAt: now(),
        };
        set({
          properties: s.properties.map((p) =>
            p.id === propertyId ? { ...p, availableUnits: next } : p,
          ),
          availabilityChanges: [entry, ...s.availabilityChanges],
          auditLogs: [
            {
              id: nid("al"),
              actorId: user.id,
              action: `availability ${prev} → ${next}`,
              target: propertyId,
              reason: reason,
              createdAt: now(),
            },
            ...s.auditLogs,
          ],
        });
        return { ok: true };
      },

      createPaymentRequest: (input) => {
        const s = get();
        const user = s.currentUser();
        if (!user) return { ok: false, error: "Sign in first." };
        if (user.role !== "landlord" && user.role !== "agent") {
          return { ok: false, error: "Only landlords or agents can send rental payment requests." };
        }
        const property = s.properties.find((p) => p.id === input.propertyId);
        if (!property) return { ok: false, error: "Property not found." };
        const rent = Math.max(0, Math.round(input.annualRent));
        const fee = Math.round(rent * 0.05);
        const commission = input.agentCommission ? Math.round(input.agentCommission) : undefined;
        const total = rent + fee + (commission ?? 0);
        const row: PaymentRequest = {
          id: nid("pr"),
          propertyId: input.propertyId,
          conversationId: input.conversationId,
          fromUserId: user.id,
          toUserId: input.toUserId,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          annualRent: rent,
          fanectoFee: fee,
          agentCommission: commission,
          totalPayable: total,
          notes: input.notes,
          dueDate: input.dueDate,
          status: "awaiting_payment",
          createdAt: now(),
        };
        const notif = {
          id: nid("n"),
          recipientId: input.toUserId,
          title: "Rental payment request",
          body: `${property.title} · ${row.totalPayable.toLocaleString("en-NG")} due`,
          type: "payment" as const,
          href: "/payments",
          read: false,
          createdAt: now(),
        };
        set({
          paymentRequests: [row, ...s.paymentRequests],
          notifications: [notif, ...s.notifications],
        });
        return { ok: true, id: row.id };
      },
      payPaymentRequest: (id) => {
        const s = get();
        const user = s.currentUser();
        if (!user) return { ok: false, error: "Sign in first." };
        const req = s.paymentRequests.find((r) => r.id === id);
        if (!req) return { ok: false, error: "Request not found." };
        if (req.toUserId !== user.id) return { ok: false, error: "This request is not for your account." };
        if (req.status !== "awaiting_payment") return { ok: false, error: "This request is no longer open." };
        const property = s.properties.find((p) => p.id === req.propertyId);
        const payment: Payment = {
          id: nid("pay"),
          kind: "rental",
          propertyId: req.propertyId,
          payerId: user.id,
          landlordId: property?.landlordId ?? req.fromUserId,
          agentId: property?.agentId,
          grossRent: req.annualRent,
          fanectoFee: req.fanectoFee,
          status: "captured",
          createdAt: now(),
          reference: `FCT-RENT-${Math.floor(10000 + Math.random() * 89999)}`,
        };
        set({
          paymentRequests: s.paymentRequests.map((r) =>
            r.id === id ? { ...r, status: "paid" as const, paidAt: now(), paymentId: payment.id } : r,
          ),
          payments: [payment, ...s.payments],
        });
        return { ok: true };
      },

      markNotificationsRead: (userId) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.recipientId === userId ? { ...n, read: true } : n,
          ),
        })),
      fileReport: (report) =>
        set((s) => ({
          reports: [{ ...report, id: nid("rp"), createdAt: now(), status: "open" }, ...s.reports],
        })),
      adminSetVerification: (userId, status, reason) =>
        set((s) => {
          const actor = s.sessionUserId ?? "u-adaeze";
          return {
            users: s.users.map((u) =>
              u.id === userId ? { ...u, verificationStatus: status } : u,
            ),
            verifications: s.verifications.map((v) =>
              v.userId === userId
                ? { ...v, status, reason, reviewedAt: now(), reviewerId: actor }
                : v,
            ),
            auditLogs: [
              {
                id: nid("au"),
                actorId: actor,
                action: `Verification ${status}`,
                target: userId,
                reason,
                createdAt: now(),
              },
              ...s.auditLogs,
            ],
          };
        }),
      adminToggleFanectoVerified: (userId, award, reason) =>
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId ? { ...u, fanectoVerified: award } : u,
          ),
          auditLogs: [
            {
              id: nid("au"),
              actorId: s.sessionUserId ?? "u-adaeze",
              action: award ? "Awarded Fanecto Verified" : "Revoked Fanecto Verified",
              target: userId,
              reason,
              createdAt: now(),
            },
            ...s.auditLogs,
          ],
        })),
      adminSuspend: (userId, reason) =>
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId
              ? { ...u, accountStatus: "suspended", verificationStatus: "suspended" }
              : u,
          ),
          suspensions: [
            {
              id: nid("sus"),
              targetUserId: userId,
              type: "suspended",
              reason,
              actorId: s.sessionUserId ?? "u-adaeze",
              startAt: now(),
              status: "active",
            },
            ...s.suspensions,
          ],
          auditLogs: [
            {
              id: nid("au"),
              actorId: s.sessionUserId ?? "u-adaeze",
              action: "Suspended account",
              target: userId,
              reason,
              createdAt: now(),
            },
            ...s.auditLogs,
          ],
        })),
      adminLift: (userId) =>
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId ? { ...u, accountStatus: "active" } : u,
          ),
          suspensions: s.suspensions.map((x) =>
            x.targetUserId === userId && x.status === "active" ? { ...x, status: "lifted" } : x,
          ),
        })),
      adminResolveReport: (id, resolution, status) =>
        set((s) => ({
          reports: s.reports.map((r) => (r.id === id ? { ...r, resolution, status } : r)),
        })),
      adminHideReview: (id) =>
        set((s) => ({
          reviews: s.reviews.map((r) => (r.id === id ? { ...r, status: "hidden" } : r)),
        })),
      settlePayment: (id) =>
        set((s) => ({
          payments: s.payments.map((p) =>
            p.id === id ? { ...p, status: "settled", settledAt: now() } : p,
          ),
          inspections: s.inspections.map((i) => {
            const pay = s.payments.find((p) => p.id === id);
            if (pay && pay.kind === "inspection" && pay.inspectionId === i.id) {
              return { ...i, status: "settled" };
            }
            return i;
          }),
          auditLogs: [
            {
              id: nid("au"),
              actorId: s.sessionUserId ?? "u-adaeze",
              action: "Marked settlement complete",
              target: id,
              createdAt: now(),
            },
            ...s.auditLogs,
          ],
        })),
      upsertAgreement: (agreement) =>
        set((s) => {
          const exists = s.agreements.some((a) => a.id === agreement.id);
          return {
            agreements: exists
              ? s.agreements.map((a) => (a.id === agreement.id ? agreement : a))
              : [agreement, ...s.agreements],
          };
        }),
      draftAgreement: (input) => {
        const user = get().currentUser();
        const id = nid("ag");
        const row: AgentAgreement = {
          ...input,
          id,
          status: "sent",
          version: 1,
          landlordAccepted: user?.id === input.landlordId,
          agentAccepted: user?.id === input.agentId,
          createdAt: now(),
          history: [
            {
              at: now(),
              actorId: user?.id ?? "system",
              action: "Created and sent",
            },
          ],
        };
        set((s) => ({
          agreements: [row, ...s.agreements],
          notifications: [
            {
              id: nid("n"),
              recipientId: user?.id === input.landlordId ? input.agentId : input.landlordId,
              type: "agreement",
              title: "Commission agreement sent",
              body: "Review terms. Both parties must accept before it becomes active. Fanecto records this; it does not settle the commission here.",
              href: user?.role === "landlord" ? "/agent/agreements" : "/landlord/agreements",
              read: false,
              createdAt: now(),
            },
            ...s.notifications,
          ],
        }));
        return id;
      },
      proposeAgreementChange: (id, userId, note, commissionValue) =>
        set((s) => ({
          agreements: s.agreements.map((a) =>
            a.id === id
              ? {
                  ...a,
                  commissionValue,
                  status: "negotiating",
                  landlordAccepted: a.landlordId === userId,
                  agentAccepted: a.agentId === userId,
                  version: a.version + 1,
                  history: [
                    ...a.history,
                    {
                      at: now(),
                      actorId: userId,
                      action: "Proposed a change",
                      note,
                    },
                  ],
                }
              : a,
          ),
        })),
      acceptAgreement: (id, userId) =>
        set((s) => ({
          agreements: s.agreements.map((a) => {
            if (a.id !== id) return a;
            const landlordAccepted = a.landlordAccepted || a.landlordId === userId;
            const agentAccepted = a.agentAccepted || a.agentId === userId;
            const both = landlordAccepted && agentAccepted;
            return {
              ...a,
              landlordAccepted,
              agentAccepted,
              status: both ? "active" : "accepted",
              version: both ? a.version + 1 : a.version,
              history: [
                ...a.history,
                {
                  at: now(),
                  actorId: userId,
                  action: both ? "Accepted — agreement became active" : "Accepted",
                },
              ],
            };
          }),
        })),
      rejectAgreement: (id, userId, note) =>
        set((s) => ({
          agreements: s.agreements.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: "rejected",
                  history: [...a.history, { at: now(), actorId: userId, action: "Rejected", note }],
                }
              : a,
          ),
        })),
      endAgreement: (id, userId) =>
        set((s) => ({
          agreements: s.agreements.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: "ended",
                  history: [...a.history, { at: now(), actorId: userId, action: "Ended" }],
                }
              : a,
          ),
        })),
      revokeAuthorization: (id) =>
        set((s) => ({
          authorizations: s.authorizations.map((a) =>
            a.id === id ? { ...a, status: "revoked" } : a,
          ),
          auditLogs: [
            {
              id: nid("au"),
              actorId: s.sessionUserId ?? "system",
              action: "Revoked agent authorisation",
              target: id,
              createdAt: now(),
            },
            ...s.auditLogs,
          ],
        })),
      addNotification: (n) =>
        set((s) => ({
          notifications: [{ ...n, id: nid("n"), createdAt: now(), read: false }, ...s.notifications],
        })),
      audit: (action, target, reason) =>
        set((s) => ({
          auditLogs: [
            {
              id: nid("au"),
              actorId: s.sessionUserId ?? "system",
              action,
              target,
              reason,
              createdAt: now(),
            },
            ...s.auditLogs,
          ],
        })),
      resetDemo: () => set({ ...seed(), sessionUserId: get().sessionUserId }),
    }),
    {
      name: "fanecto-demo-v2",
      skipHydration: true,
      partialize: (s) => ({
        sessionUserId: s.sessionUserId,
        savedIds: s.savedIds,
        users: s.users,
        properties: s.properties,
        inspections: s.inspections,
        payments: s.payments,
        roommateListings: s.roommateListings,
        roommateConnections: s.roommateConnections,
        agreements: s.agreements,
        authorizations: s.authorizations,
        conversations: s.conversations,
        messages: s.messages,
        reviews: s.reviews,
        reviewPrompts: s.reviewPrompts,
        notifications: s.notifications,
        reports: s.reports,
        suspensions: s.suspensions,
        auditLogs: s.auditLogs,
        verifications: s.verifications,
        dismissedPrompts: s.dismissedPrompts,
        listingDraft: s.listingDraft,
      }),
    },
  ),
  shallow,
);

export function useCurrentFanectoUser() {
  return useFanecto((s) => s.users.find((u) => u.id === s.sessionUserId) ?? null);
}
