import { describe, expect, it, vi } from "vitest";
import {
  approvalErrors,
  canAddPhoto,
  canPrint,
  clearIssue,
  invalidateApproval,
  issueCutoffDate,
  issueNeedsApproval,
  nextIssueDate,
  replacePhoto,
  replyForNextIssue,
  selectedItems,
} from "../model";
import { createDemoState } from "../synthetic-data";

describe("issue rules", () => {
  it("starts without synthetic photos", () => {
    expect(createDemoState().families["demo-a"].contributions[0].photoSrc).toBe("");
  });

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

  it("respects an explicit standing preauthorization", () => {
    const family = createDemoState().families["demo-b"];
    expect(issueNeedsApproval(family)).toBe(true);
    family.approvalLevel = "Preauthorized";
    expect(issueNeedsApproval(family)).toBe(false);
    family.approvalLevel = "Approval required";
    expect(issueNeedsApproval(family)).toBe(true);
  });

  it("schedules Sunday issues using the Wednesday cutoff", () => {
    expect(nextIssueDate(new Date(2026, 8, 9, 23, 59))).toBe("2026-09-13");
    expect(nextIssueDate(new Date(2026, 8, 10, 0, 0))).toBe("2026-09-20");
    expect(nextIssueDate(new Date(2026, 8, 13, 9, 0))).toBe("2026-09-20");
    expect(issueCutoffDate("2026-09-20")).toBe("2026-09-16");
  });

  it("uses accessible print and handoff defaults", () => {
    Object.values(createDemoState().families).forEach((family) => {
      expect(family.paperSize).toBe("Letter");
      expect(family.textSize).toBe(18);
      expect(family.deliveryMethod).toBe("Family handoff");
      expect(family.channel).toBe("manual");
    });
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
