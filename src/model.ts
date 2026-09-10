export type FamilyId = "demo-a" | "demo-b" | "demo-c";
export type TextSize = 16 | 18 | 20;
export type DeliveryMethod =
  "Family handoff" | "Senior-center handoff" | "Local mail";
export type Channel = "manual" | "whatsapp" | "wechat" | "imessage" | "email";
export type ContributionStatus =
  "Draft" | "Ready for review" | "Deferred" | "Excluded";
export type IssueStatus =
  | "Draft"
  | "Awaiting curator approval"
  | "Changes requested"
  | "Approved"
  | "Printed"
  | "Sent or handed off"
  | "Received";
export type ReplyMethod = "Voice" | "Handwriting" | "Supported phone action";
export type ReplyPermission =
  "Keep private" | "Send to selected family members" | "Include in next issue";
export type ApprovalLevel =
  "Preauthorized" | "Preview requested" | "Approval required";

export interface Contribution {
  id: string;
  photoSrc: string;
  photoPosition: string;
  isObjectUrl?: boolean;
  originalCaption: string;
  editedCaption: string;
  headline: string;
  who: string;
  date?: string;
  place?: string;
  contributor: string;
  contributorId?: string;
  permission: boolean;
  showsMinor: boolean;
  guardianPermission: boolean;
  status: ContributionStatus;
  suggestion?: string;
}

export interface FamilyContributor {
  id: string;
  name: string;
  token: string;
  active: boolean;
}

export interface Reply {
  text: string;
  method: ReplyMethod;
  intendedRecipients: string;
  permission: ReplyPermission;
  exactWordingApproved: boolean;
}

export interface FamilyWorkspace {
  id: FamilyId;
  familyName: string;
  recipientName: string;
  curatorName: string;
  language: string;
  textSize: TextSize;
  paperSize: "Letter" | "A4";
  deliveryMethod: DeliveryMethod;
  channel: Channel;
  issueDate: string;
  issueNumber: number;
  issueStatus: IssueStatus;
  approvalLevel: ApprovalLevel;
  sensitiveTopics: string;
  headline: string;
  contributions: Contribution[];
  contributors: FamilyContributor[];
  activeContributorId: string;
  reply?: Reply;
  openingReply?: string;
}

export interface DemoState {
  activeFamilyId: FamilyId;
  families: Record<FamilyId, FamilyWorkspace>;
  pilotPhotoCount: number;
}

export const selectedItems = (family: FamilyWorkspace): Contribution[] =>
  family.contributions.filter(
    (item) => item.status === "Draft" || item.status === "Ready for review",
  );

export const approvalErrors = (family: FamilyWorkspace): string[] => {
  const errors: string[] = [];
  const selected = selectedItems(family);
  if (!family.familyName.trim()) errors.push("Family identity is required.");
  if (!family.recipientName.trim())
    errors.push("Recipient identity is required.");
  if (selected.length > 4) errors.push("Select no more than four items.");
  if (selected.length === 0) errors.push("Select at least one item.");
  selected.forEach((item) => {
    if (!item.permission)
      errors.push(`${item.headline}: permission is required.`);
  });
  return errors;
};

export const invalidateApproval = (family: FamilyWorkspace): void => {
  if (
    ["Approved", "Printed", "Sent or handed off", "Received"].includes(
      family.issueStatus,
    )
  ) {
    family.issueStatus = "Awaiting curator approval";
  }
};

export const canPrint = (family: FamilyWorkspace): boolean =>
  family.issueStatus === "Approved";

export const issueNeedsApproval = (family: FamilyWorkspace): boolean =>
  family.approvalLevel !== "Preauthorized";

const localDateString = (date: Date): string =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

const parseLocalDate = (value: string): Date => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const nextIssueDate = (now = new Date()): string => {
  const day = now.getDay();
  const daysUntilIssue = day <= 3 ? 7 - day : 14 - day;
  const issueDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + daysUntilIssue,
  );
  return localDateString(issueDate);
};

export const issueCutoffDate = (issueDate: string): string => {
  const cutoff = parseLocalDate(issueDate);
  cutoff.setDate(cutoff.getDate() - 4);
  return localDateString(cutoff);
};

export const canAddPhoto = (state: DemoState): boolean =>
  state.pilotPhotoCount < 50;

export const replyForNextIssue = (reply?: Reply): string | undefined =>
  reply?.exactWordingApproved && reply.permission === "Include in next issue"
    ? reply.text.trim() || undefined
    : undefined;

export const clearIssue = (
  family: FamilyWorkspace,
  revoke: (url: string) => void,
): void => {
  family.contributions.forEach((item) => {
    if (item.isObjectUrl) revoke(item.photoSrc);
  });
  family.contributions = [];
  family.reply = undefined;
  family.openingReply = undefined;
  family.issueStatus = "Draft";
  family.headline = "This week, from all of us";
};

export const replacePhoto = (
  item: Contribution,
  nextUrl: string,
  revoke: (url: string) => void,
): void => {
  if (item.isObjectUrl) revoke(item.photoSrc);
  item.photoSrc = nextUrl;
  item.photoPosition = "center";
  item.isObjectUrl = true;
};
