import {
  nextIssueDate,
  type Contribution,
  type DemoState,
  type FamilyId,
  type FamilyWorkspace,
} from "./model";

export const syntheticPhotoUrl = `${import.meta.env.BASE_URL}synthetic/family-moments.png`;

const moments = [
  {
    headline: "Sunday under the maple",
    caption:
      "We spread out the old quilt and ate lunch under the maple tree on Sunday.",
    who: "Mara, Theo, June, and Ellis",
    date: "2026-09-06",
    place: "The backyard",
    contributor: "Mara",
    position: "top left",
    minor: true,
  },
  {
    headline: "The great blanket fort",
    caption:
      "Mina decided the living room needed a fort and recruited everybody after breakfast.",
    who: "Mina, Theo, and Mara",
    date: "2026-09-05",
    place: "Home",
    contributor: "Theo",
    position: "top right",
    minor: true,
  },
  {
    headline: "A cake with character",
    caption:
      "The raspberry cake leaned a little but it tasted great and we saved you a story about it.",
    who: "Mara",
    date: "2026-09-04",
    place: "Mara's kitchen",
    contributor: "Mara",
    position: "bottom left",
    minor: false,
  },
  {
    headline: "Pepper's leaf collection",
    caption:
      "Pepper took us around the lake and tried to collect every bright leaf on the path.",
    who: "Theo, Mara, and Pepper",
    date: "2026-09-03",
    place: "Willow Lake",
    contributor: "Theo",
    position: "bottom right",
    minor: false,
  },
] as const;

const identities: Record<
  FamilyId,
  Array<{ who: string; contributor: string }>
> = {
  "demo-a": [
    { who: "Elena, Luis, June, and Mateo", contributor: "Elena" },
    { who: "June, Luis, and Elena", contributor: "Luis" },
    { who: "Elena", contributor: "Elena" },
    { who: "Luis, Elena, and Pepper", contributor: "Luis" },
  ],
  "demo-b": [
    { who: "Nikhil, Priya, Anya, and Rohan", contributor: "Priya" },
    { who: "Anya, Nikhil, and Priya", contributor: "Nikhil" },
    { who: "Priya", contributor: "Priya" },
    { who: "Nikhil, Priya, and Chai", contributor: "Nikhil" },
  ],
  "demo-c": [
    { who: "Mei, Daniel, Lili, and Ben", contributor: "Mei" },
    { who: "Lili, Daniel, and Mei", contributor: "Daniel" },
    { who: "Mei", contributor: "Mei" },
    { who: "Daniel, Mei, and DouDou", contributor: "Daniel" },
  ],
};

const makeItems = (
  familyId: FamilyId,
  missingPermission = false,
): Contribution[] =>
  moments.map((moment, index) => ({
    id: `${familyId}-item-${index + 1}`,
    photoSrc: syntheticPhotoUrl,
    photoPosition: moment.position,
    originalCaption: moment.caption,
    editedCaption: moment.caption,
    headline: moment.headline,
    who: identities[familyId][index].who,
    date: moment.date,
    place: moment.place,
    contributor: identities[familyId][index].contributor,
    contributorId: `${familyId}-${identities[familyId][index].contributor.toLowerCase()}`,
    permission: !(missingPermission && index === 1),
    showsMinor: moment.minor,
    guardianPermission: !moment.minor || !(missingPermission && index === 1),
    status: index === 0 ? "Ready for review" : "Draft",
  }));

const makeFamily = (
  id: FamilyId,
  familyName: string,
  recipientName: string,
  curatorName: string,
  language: string,
  missingPermission = false,
): FamilyWorkspace => {
  const contributors = [
    { id: `${id}-curator`, name: curatorName, token: `${id}-curator-demo-token`, active: true },
    { id: `${id}-mara`, name: "Mara", token: `${id}-mara-demo-token`, active: true },
    { id: `${id}-theo`, name: "Theo", token: `${id}-theo-demo-token`, active: true },
  ];
  return ({
  id,
  familyName,
  recipientName,
  curatorName,
  language,
  textSize: 18,
  paperSize: "Letter",
  deliveryMethod: "Family handoff",
  channel: "manual",
  issueDate: nextIssueDate(),
  issueNumber: 1,
  issueStatus: "Draft",
  approvalLevel: "Approval required",
  sensitiveTopics: "No medical, financial, or private family conflict stories",
  headline: "Small moments, saved for you",
  contributions: makeItems(id, missingPermission),
    contributors,
    activeContributorId: contributors[0].id,
  });
};

export const createDemoState = (): DemoState => ({
  activeFamilyId: "demo-a",
  pilotPhotoCount: 12,
  families: {
    "demo-a": makeFamily(
      "demo-a",
      "Rivera Family",
      "Nana Rosa",
      "Elena Rivera",
      "English and Spanish",
      true,
    ),
    "demo-b": makeFamily(
      "demo-b",
      "Patel Family",
      "Dadaji",
      "Nikhil Patel",
      "English",
    ),
    "demo-c": makeFamily(
      "demo-c",
      "Chen Family",
      "Grandma Lin",
      "Mei Chen",
      "Chinese and English",
    ),
  },
});

export const demonstrationUrl = (family: FamilyWorkspace): string =>
  `https://example.invalid/family/${family.id}/issue/${family.issueNumber}`;
