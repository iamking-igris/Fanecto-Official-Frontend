import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  canAccessRoommateChat,
  getActiveRoommateConnection,
  isRoommateListingAvailableForConnection,
} from "./roommate-logic.ts";
import type { RoommateConnection, RoommateListing } from "./types.ts";

const baseListing: RoommateListing = {
  id: "rm-1",
  creatorId: "owner-1",
  displayName: "Aisha Bello",
  title: "Mini-flat near campus — one roommate needed",
  school: "University of Lagos",
  campus: "Akoka",
  location: "Yaba, Lagos",
  preferredArea: "Yaba",
  housingType: "Mini-flat",
  budget: 480000,
  moveIn: "2026-01-15",
  roommatesWanted: 1,
  amenities: ["Wi-Fi", "Generator"],
  bio: "Quiet shared flat with shared kitchen and balcony.",
  images: ["/img.jpg"],
  gender: "female",
  lookingFor: "female",
  status: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("roommate flow logic", () => {
  it("permits chat immediately after payment succeeds and blocks it after decline", () => {
    const pending: RoommateConnection = {
      id: "rc-1",
      listingId: "rm-1",
      seekerId: "seeker-1",
      creatorId: "owner-1",
      fee: 3000,
      paid: true,
      chatUnlocked: true,
      status: "pending",
      createdAt: "2026-01-02T00:00:00.000Z",
    };

    assert.equal(canAccessRoommateChat(pending), true);

    const declined: RoommateConnection = { ...pending, status: "declined", chatUnlocked: false };
    assert.equal(canAccessRoommateChat(declined), false);
  });

  it("reserves the listing while a paid request is pending and prevents parallel requests", () => {
    const pending: RoommateConnection = {
      id: "rc-2",
      listingId: "rm-1",
      seekerId: "seeker-1",
      creatorId: "owner-1",
      fee: 3000,
      paid: true,
      chatUnlocked: true,
      status: "pending",
      createdAt: "2026-01-02T00:00:00.000Z",
    };

    assert.equal(isRoommateListingAvailableForConnection(baseListing, [pending]), false);
    assert.equal(
      getActiveRoommateConnection("rm-1", "seeker-1", [pending])?.seekerId,
      "seeker-1",
    );
  });
});
