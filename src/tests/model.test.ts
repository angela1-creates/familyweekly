import { describe, expect, it, vi } from "vitest";
import {
  approvalErrors,
  canAddPhoto,
  canPrint,
  clearIssue,
  invalidateApproval,
  issueNeedsApproval,
  replacePhoto,
  replyForNextIssue,
  selectedItems,
} from "../model";
import { createDemoState } from "../synthetic-data";

describe("issue rules", () => {
  it("enforces the four-item maximum", () => {
    const family = createDemoState().families["demo-b"];
    family.contributions.push({ ...family.contributions[0], id: "fifth" });
    expect(selectedItems(family)).toHaveLength(5);
    expect(approvalErrors(family)).toContain("Select no more than four items.");
  });

  it("enforces the pilot-wide 50-photo limit", () => {
    const state = createDemoState();
    state.pilotPhotoCount = 49;
    expect(canAddPhoto(state)).toBe(true);
    state.pilotPhotoCount = 50;
    expect(canAddPhoto(state)).toBe(false);
  });

  it("blocks approval when permission is missing", () => {
    const family = createDemoState().families["demo-a"];
    expect(
      approvalErrors(family).some((error) =>
        error.includes("permission is required"),
      ),
    ).toBe(true);
  });

  it("blocks approval for a minor without guardian attestation", () => {
    const family = createDemoState().families["demo-b"];
    family.contributions[0].showsMinor = true;
    family.contributions[0].guardianPermission = false;
    expect(
      approvalErrors(family).some((error) =>
        error.includes("guardian attestation"),
      ),
    ).toBe(true);
  });

  it("invalidates approval after an edit", () => {
    const family = createDemoState().families["demo-b"];
    family.issueStatus = "Approved";
    family.contributions[0].editedCaption = "A careful human edit.";
    invalidateApproval(family);
    expect(family.issueStatus).toBe("Awaiting curator approval");
  });

  it("keeps printing unavailable before approval", () => {
    const family = createDemoState().families["demo-b"];
    expect(canPrint(family)).toBe(false);
    family.issueStatus = "Approved";
    expect(canPrint(family)).toBe(true);
  });

  it("requires the first issue, but allows later preauthorized issues", () => {
    const family = createDemoState().families["demo-b"];
    expect(issueNeedsApproval(family)).toBe(true);
    family.issueNumber = 2;
    family.approvalLevel = "Preauthorized";
    expect(issueNeedsApproval(family)).toBe(false);
    family.approvalLevel = "Approval required";
    expect(issueNeedsApproval(family)).toBe(true);
  });

  it("keeps family contribution records separate", () => {
    const state = createDemoState();
    const riveraIds = state.families["demo-a"].contributions.map(
      (item) => item.id,
    );
    const patelSerialized = JSON.stringify(state.families["demo-b"]);
    riveraIds.forEach((id) => expect(patelSerialized).not.toContain(id));
    expect(patelSerialized).not.toContain("Rivera Family");
  });

  it("only carries an explicitly approved next-issue reply", () => {
    const base = {
      text: "I loved the fort. Tell Mina I want the full story.",
      method: "Voice" as const,
      intendedRecipients: "Elena and Mina",
      exactWordingApproved: true,
    };
    expect(
      replyForNextIssue({ ...base, permission: "Include in next issue" }),
    ).toBe(base.text);
    expect(
      replyForNextIssue({ ...base, permission: "Keep private" }),
    ).toBeUndefined();
    expect(
      replyForNextIssue({
        ...base,
        permission: "Include in next issue",
        exactWordingApproved: false,
      }),
    ).toBeUndefined();
  });

  it("clears issue data and revokes local image URLs", () => {
    const family = createDemoState().families["demo-b"];
    family.contributions[0].photoSrc = "blob:test-image";
    family.contributions[0].isObjectUrl = true;
    const revoke = vi.fn();
    clearIssue(family, revoke);
    expect(revoke).toHaveBeenCalledWith("blob:test-image");
    expect(family.contributions).toEqual([]);
    expect(family.issueStatus).toBe("Draft");
  });

  it("revokes an old object URL when replacing a local image", () => {
    const item = createDemoState().families["demo-b"].contributions[0];
    item.photoSrc = "blob:old";
    item.isObjectUrl = true;
    const revoke = vi.fn();
    replacePhoto(item, "blob:new", revoke);
    expect(revoke).toHaveBeenCalledWith("blob:old");
    expect(item.photoSrc).toBe("blob:new");
  });

  it("creates fresh demonstration state instead of restoring mutations", () => {
    const first = createDemoState();
    first.families["demo-b"].headline = "Unsaved edit";
    const refreshed = createDemoState();
    expect(refreshed.families["demo-b"].headline).toBe(
      "Small moments, saved for you",
    );
  });
});
