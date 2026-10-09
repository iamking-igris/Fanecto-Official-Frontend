import type { RoommateConnection, RoommateListing } from "./types";

export function getRoommateConnectionForUser(
  listingId: string,
  seekerId: string,
  connections: RoommateConnection[],
): RoommateConnection | undefined {
  return [...connections]
    .filter((c) => c.listingId === listingId && c.seekerId === seekerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

export function canAccessRoommateChat(connection?: RoommateConnection | null): boolean {
  return Boolean(connection && connection.paid && connection.status !== "declined" && connection.chatUnlocked);
}

export function hasActiveRoommateReservation(
  listingId: string,
  connections: RoommateConnection[],
): boolean {
  return connections.some(
    (c) => c.listingId === listingId && c.paid && (c.status === "pending" || c.status === "accepted"),
  );
}

export function isRoommateListingAvailableForConnection(
  listing: RoommateListing,
  connections: RoommateConnection[],
): boolean {
  if (listing.status !== "active") return false;

  const acceptedCount = connections.filter(
    (c) => c.listingId === listing.id && c.paid && c.status === "accepted",
  ).length;

  if (acceptedCount >= listing.roommatesWanted) return false;
  return !connections.some(
    (c) => c.listingId === listing.id && c.paid && c.status === "pending",
  );
}

export function getActiveRoommateConnection(
  listingId: string,
  seekerId: string,
  connections: RoommateConnection[],
): RoommateConnection | undefined {
  return getRoommateConnectionForUser(listingId, seekerId, connections);
}
