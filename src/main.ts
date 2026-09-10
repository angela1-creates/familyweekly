import "./styles.css";
import { DemoCaptionAssistant } from "./caption-assistant";
import { channelAdapters } from "./channels";
import {
  approvalErrors,
  canAddPhoto,
  canPrint,
  clearIssue,
  invalidateApproval,
  issueCutoffDate,
  issueNeedsApproval,
  replacePhoto,
  replyForNextIssue,
  selectedItems,
  type Contribution,
  type FamilyId,
  type FamilyWorkspace,
  type IssueStatus,
} from "./model";
import { createDemoState, demonstrationUrl } from "./synthetic-data";

type View = "setup" | "contributions" | "builder" | "approval" | "reply";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Application root is missing.");

let state = createDemoState();
let view: View = "setup";
const assistant = new DemoCaptionAssistant();

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const activeFamily = (): FamilyWorkspace =>
  state.families[state.activeFamilyId];

const formatDate = (value: string): string => {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
};

const announce = (message: string): void => {
  const region = document.querySelector<HTMLElement>("#live-status");
  if (region) region.textContent = message;
};

const focusView = (): void => {
  requestAnimationFrame(() =>
    document.querySelector<HTMLElement>("#view-title")?.focus(),
  );
};

const statusClass = (status: IssueStatus): string =>
  `status status-${status.toLowerCase().replaceAll(" ", "-").replaceAll("/", "-")}`;

const photoStyle = (item: Contribution): string => {
  if (item.isObjectUrl)
    return `background-image:url('${item.photoSrc}');background-size:cover;background-position:center`;
  const positions: Record<string, string> = {
    "top left": "0% 0%",
    "top right": "100% 0%",
    "bottom left": "0% 100%",
    "bottom right": "100% 100%",
  };
  return `background-image:url('${item.photoSrc}');background-position:${positions[item.photoPosition] ?? "center"}`;
};

const photoLabel = (item: Contribution): string =>
  item.who.trim() ? `Photograph of ${item.who}` : "Family photograph";

const familyOptions = (): string =>
  Object.values(state.families)
    .map(
      (family) =>
        `<option value="${family.id}" ${family.id === state.activeFamilyId ? "selected" : ""}>${escapeHtml(family.familyName)} · ${escapeHtml(family.recipientName)}</option>`,
    )
    .join("");

const nav = (): string => {
  const items: Array<[View, string, string]> = [
    ["setup", "1", "Family setup"],
    ["contributions", "2", "Contributions"],
    ["builder", "3", "Issue builder"],
    ["approval", "4", "Approve & deliver"],
    ["reply", "5", "Record a reply (optional)"],
  ];
  return `<nav class="workflow-nav" aria-label="Issue workflow">${items
    .map(
      ([id, number, label]) =>
        `<button class="workflow-step ${view === id ? "is-current" : ""}" data-action="view" data-view="${id}" aria-current="${view === id ? "step" : "false"}"><span>${number}</span>${label}</button>`,
    )
    .join(
      "",
    )}</nav><details class="demo-guide"><summary><span>Stage 0 guided rehearsal</span><strong>14 steps</strong></summary><ol><li>Choose one fictional family.</li><li>Review four sample submissions.</li><li>Find the missing permission.</li><li>Correct the contributor and guardian attestations.</li><li>Request a demonstration caption suggestion.</li><li>Accept, modify, or reject it.</li><li>Arrange the issue with buttons.</li><li>Send the simulated curator preview.</li><li>Approve the issue.</li><li>Open browser print.</li><li>Record a simulated delivery status.</li><li>Record an approved recipient reply.</li><li>Start the next issue with that reply.</li><li>Clear all demonstration data.</li></ol></details>`;
};

const field = (
  label: string,
  name: string,
  value: string,
  type = "text",
  help = "",
): string =>
  `<label class="field"><span>${label}</span><input type="${type}" data-family-field="${name}" value="${escapeHtml(value)}" ${help ? `aria-describedby="help-${name}"` : ""}>${help ? `<small id="help-${name}">${help}</small>` : ""}</label>`;

const setupView = (family: FamilyWorkspace): string => {
  const cutoffDate = issueCutoffDate(family.issueDate);
  const reminder = `Family Weekly submissions are open for ${family.recipientName}. Please add photographs by ${formatDate(cutoffDate)} for the ${formatDate(family.issueDate)} issue. Captions are optional. Please confirm permission to include each photo in this private printed issue.`;
  const messages = [
    ["reminder", "Copy submission reminder", reminder],
    [
      "preview",
      "Copy preview-ready message",
      `The private Family Weekly preview for ${family.recipientName} is ready. Please review it in the demonstration tool. Nothing has been sent automatically.`,
    ],
    [
      "reply",
      "Copy approved-reply message",
      `${family.recipientName} has approved a reply for selected family members. Copy it manually from the Family Weekly reply view.`,
    ],
  ];
  return `<section class="view-panel" aria-labelledby="view-title">
    <div class="eyebrow">Part 1 of 5</div><h2 id="view-title" tabindex="-1">Family setup</h2>
    <p class="lede">Name the people this private issue belongs to. The schedule and print defaults are handled for you.</p>
    <div class="form-grid">
      ${field("Family name", "familyName", family.familyName)}
      ${field("Older recipient's preferred name", "recipientName", family.recipientName)}
      ${field("Family curator", "curatorName", family.curatorName)}
    </div>
    <section class="share-panel schedule-summary" aria-label="Automatic issue schedule"><div><span class="eyebrow">Issue ${family.issueNumber}</span><h3>${formatDate(family.issueDate)}</h3><small>Publication date</small></div><div><span class="eyebrow">Photo cutoff</span><h3>${formatDate(cutoffDate)}</h3><small>After Wednesday, photos move to the following Sunday.</small></div></section>
    <section class="share-panel" aria-labelledby="share-title"><div><div class="eyebrow">Copy tools</div><h3 id="share-title">Share submission instructions</h3><p><strong>Demonstration link · not active</strong><br><code>${demonstrationUrl(family)}</code></p></div><div class="copy-grid">${messages.map(([id, label, text]) => `<button class="secondary" data-action="copy" data-message="${escapeHtml(text)}" data-copy-kind="${id}">${label}</button>`).join("")}</div></section>
  </section>`;
};

const contributionCard = (
  item: Contribution,
  index: number,
): string => `<article class="contribution-card" data-item-id="${item.id}">
  <div class="synthetic-photo" role="img" aria-label="${escapeHtml(photoLabel(item))}" style="${photoStyle(item)}"></div>
  <div class="contribution-content"><div class="card-heading"><div><span class="item-number">Item ${index + 1}</span><h3>${escapeHtml(item.headline)}</h3></div><span class="status">${item.status}</span></div>
    <label class="field"><span>Headline</span><input data-item-field="headline" value="${escapeHtml(item.headline)}"></label>
    <label class="field"><span>Original caption</span><textarea data-item-field="originalCaption" rows="3">${escapeHtml(item.originalCaption)}</textarea></label>
    <div class="form-grid compact">${fieldForItem(item, "Who is pictured", "who", item.who)}${fieldForItem(item, "Optional date", "date", item.date ?? "", "date")}${fieldForItem(item, "Optional place", "place", item.place ?? "")}${fieldForItem(item, "Contributor", "contributor", item.contributor)}</div>
    <label class="check"><input type="checkbox" data-item-field="permission" ${item.permission ? "checked" : ""}><span>I confirm that I may share this photograph in this private family issue.</span></label>
    <label class="check"><input type="checkbox" data-item-field="showsMinor" ${item.showsMinor ? "checked" : ""}><span>This photograph shows a minor.</span></label>
    ${item.showsMinor ? `<label class="check nested"><input type="checkbox" data-item-field="guardianPermission" ${item.guardianPermission ? "checked" : ""}><span>A parent or guardian confirms the minor may appear.</span></label>` : ""}
    <label class="field"><span>Status</span><select data-item-field="status">${["Draft", "Ready for review", "Deferred", "Excluded"].map((status) => `<option ${item.status === status ? "selected" : ""}>${status}</option>`).join("")}</select></label>
    <div class="button-row"><button class="secondary" data-action="move-earlier" data-id="${item.id}" ${index === 0 ? "disabled" : ""}>Move earlier</button><button class="secondary" data-action="move-later" data-id="${item.id}" ${index === activeFamily().contributions.length - 1 ? "disabled" : ""}>Move later</button><button class="text-button danger" data-action="remove-item" data-id="${item.id}">Remove</button></div>
    <label class="field file-field"><span>Replace with a local image</span><input type="file" accept="image/*" data-photo-input="${item.id}"><small>Held in browser memory only. It is never uploaded.</small></label>
  </div></article>`;

const fieldForItem = (
  item: Contribution,
  label: string,
  name: string,
  value: string,
  type = "text",
): string =>
  `<label class="field"><span>${label}</span><input type="${type}" data-item-field="${name}" data-id="${item.id}" value="${escapeHtml(value)}"></label>`;

const hasOnlySampleContributions = (family: FamilyWorkspace): boolean =>
  family.contributions.length > 0 &&
  family.contributions.every((item) => !item.isObjectUrl);

const canChoosePhotos = (family: FamilyWorkspace): boolean =>
  canAddPhoto(state) &&
  (selectedItems(family).length < 4 || hasOnlySampleContributions(family));

const contributionsView = (
  family: FamilyWorkspace,
): string => `<section class="view-panel" aria-labelledby="view-title">
  <div class="eyebrow">Part 2 of 5</div><div class="section-heading"><div><h2 id="view-title" tabindex="-1">Contributions</h2><p class="lede">Add or review up to four photographs. Captions are optional and always remain editable.</p></div><div class="count-box"><strong>${selectedItems(family).length}/4</strong><span>selected</span><small>${state.pilotPhotoCount}/50 pilot photos</small></div></div>
  <section class="upload-panel" aria-labelledby="upload-title"><div><div class="eyebrow">Your family moments</div><h3 id="upload-title">Add photos from this device</h3><p>Choose one or more images. They stay in this browser tab, are never uploaded, and disappear when the tab closes.</p></div><label class="upload-control ${canChoosePhotos(family) ? "" : "is-disabled"}"><span>Choose photos</span><input type="file" accept="image/*" multiple data-new-photo-input ${canChoosePhotos(family) ? "" : "disabled"}></label><small>Up to 15 MB per image. ${hasOnlySampleContributions(family) ? "Your first upload replaces the four sample stories." : `${Math.max(0, 4 - selectedItems(family).length)} spaces remain in this issue.`}</small></section>
  <div class="callout warning"><strong>Permission still comes first</strong><span>Confirm permission—and guardian permission when a minor appears—before approving the issue.</span></div>
  <div class="contribution-list">${family.contributions.map(contributionCard).join("")}</div>
</section>`;

const builderItem = (
  item: Contribution,
  index: number,
  family: FamilyWorkspace,
): string => `<article class="editor-row">
  <div class="synthetic-photo editor-photo" role="img" aria-label="${escapeHtml(photoLabel(item))}" style="${photoStyle(item)}"></div>
  <div><div class="card-heading"><div><span class="item-number">Story ${index + 1}</span><h3>${escapeHtml(item.headline)}</h3></div><div class="order-buttons"><button class="icon-button" data-action="move-earlier" data-id="${item.id}" aria-label="Move ${escapeHtml(item.headline)} earlier" ${index === 0 ? "disabled" : ""}>↑</button><button class="icon-button" data-action="move-later" data-id="${item.id}" aria-label="Move ${escapeHtml(item.headline)} later" ${index === selectedItems(family).length - 1 ? "disabled" : ""}>↓</button></div></div>
    <div class="comparison"><div><span>Original</span><p>${escapeHtml(item.originalCaption)}</p></div><label><span>Edited caption</span><textarea rows="4" data-item-field="editedCaption" data-id="${item.id}">${escapeHtml(item.editedCaption)}</textarea></label></div>
    ${item.suggestion ? `<div class="suggestion"><span class="eyebrow">Demonstration suggestion</span><p>${escapeHtml(item.suggestion)}</p><div class="button-row"><button data-action="accept-suggestion" data-id="${item.id}">Accept suggestion</button><button class="secondary" data-action="reject-suggestion" data-id="${item.id}">Reject</button></div></div>` : ""}
    <div class="button-row"><button class="secondary" data-action="suggest" data-id="${item.id}">Suggest caption edit</button><button class="secondary" data-action="reset-caption" data-id="${item.id}">Reset to original</button><button class="text-button" data-action="defer-item" data-id="${item.id}">Defer item</button></div>
  </div></article>`;

const newspaper = (family: FamilyWorkspace): string => {
  const items = selectedItems(family);
  const pages = [items.slice(0, 2), items.slice(2, 4)];
  return `<div id="newspaper" class="print-root paper-${family.paperSize.toLowerCase()} text-${family.textSize}" aria-label="Two-page newspaper preview">${pages
    .map(
      (
        pageItems,
        pageIndex,
      ) => `<article class="newspaper-page" aria-label="Page ${pageIndex + 1} of 2">
      ${pageIndex === 0 ? `<header class="masthead"><span>Family Weekly</span><span>${escapeHtml(family.familyName)}</span></header><div class="newspaper-title"><p>Issue ${family.issueNumber} - ${escapeHtml(family.issueDate)}</p><h1>${escapeHtml(family.headline)}</h1><p>Made for ${escapeHtml(family.recipientName)}</p></div>` : `<header class="page-kicker"><span>Family Weekly - ${escapeHtml(family.familyName)} - For ${escapeHtml(family.recipientName)}</span><span>Page 2</span></header>`}
      ${family.openingReply && pageIndex === 0 ? `<blockquote class="reply-note"><strong>A note from ${escapeHtml(family.recipientName)}</strong><p>${escapeHtml(family.openingReply)}</p></blockquote>` : ""}
      <div class="story-grid">${pageItems.map((item) => `<section class="newspaper-story"><div class="synthetic-photo newspaper-photo" role="img" aria-label="${escapeHtml(photoLabel(item))}" style="${photoStyle(item)}"></div><div><h2>${escapeHtml(item.headline)}</h2>${item.editedCaption.trim() ? `<p>${escapeHtml(item.editedCaption)}</p>` : ""}<p class="story-meta">${escapeHtml([item.who, item.place, item.date].filter(Boolean).join(" - "))}</p></div></section>`).join("")}</div>
      ${pageItems.length === 0 ? `<div class="quiet-page"><p>A little breathing room this week.</p><p>Fewer stories, never smaller words.</p></div>` : ""}
      <section class="private-note-space" aria-label="Private note space"><h2>Notes for me</h2><p>Write a memory, a question, or a note to keep. This space stays private unless you choose to share it.</p><div class="note-lines" aria-hidden="true"></div></section>
      <footer><span>Private family issue - Local-first prototype</span><span>${pageIndex + 1} / 2</span></footer>
    </article>`,
    )
    .join("")}</div>`;
};

const builderView = (
  family: FamilyWorkspace,
): string => `<section class="view-panel builder-view" aria-labelledby="view-title">
  <div class="eyebrow">Part 3 of 5</div><h2 id="view-title" tabindex="-1">Issue builder</h2><p class="lede">Edit words on the left. The fixed, family-specific newspaper stays visible on the right.</p>
  <label class="field headline-field"><span>Issue headline</span><input data-family-field="headline" value="${escapeHtml(family.headline)}"></label>
  <details class="demo-guide print-settings"><summary>Print settings <span>${family.paperSize} · ${family.textSize}pt</span></summary><div class="form-grid compact"><label class="field"><span>Paper</span><select data-family-field="paperSize"><option ${family.paperSize === "Letter" ? "selected" : ""}>Letter</option><option ${family.paperSize === "A4" ? "selected" : ""}>A4</option></select></label><label class="field"><span>Text size</span><select data-family-field="textSize">${[16, 18, 20].map((size) => `<option value="${size}" ${family.textSize === size ? "selected" : ""}>${size}pt</option>`).join("")}</select></label></div></details>
  <div class="builder-grid"><div class="editor-list">${
    selectedItems(family)
      .map((item, index) => builderItem(item, index, family))
      .join("") ||
    '<div class="empty-state"><h3>No selected stories</h3><p>Return to Contributions and change an item from Deferred or Excluded.</p></div>'
  }</div><div class="preview-wrap"><div class="preview-label"><span>Print preview</span><span>${family.paperSize} · ${family.textSize}pt · 2 pages</span></div>${newspaper(family)}</div></div>
</section>`;

const approvalView = (family: FamilyWorkspace): string => {
  const errors = approvalErrors(family);
  const needsPreview = issueNeedsApproval(family);
  return `<section class="view-panel" aria-labelledby="view-title"><div class="eyebrow">Part 4 of 5</div><div class="section-heading"><div><h2 id="view-title" tabindex="-1">Approval, print & delivery</h2><p class="lede">Photo permissions are always required. Curator preview can be skipped only for routine issues with a standing preference.</p></div><span class="${statusClass(family.issueStatus)}">${family.issueStatus}</span></div>
  ${errors.length ? `<div class="validation-summary" role="alert" tabindex="-1"><h3>Complete these checks</h3><ul>${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join("")}</ul></div>` : `<div class="callout success"><strong>${needsPreview ? "Ready for curator preview" : "Ready under the standing preference"}</strong><span>All required identity and photo-permission checks pass.</span></div>`}
  <div class="approval-layout"><div class="approval-actions"><section><span class="eyebrow">Curator review</span><h3>${escapeHtml(family.curatorName)}</h3><p>${needsPreview ? "Prepare the preview, then record the curator's decision." : "This routine issue can be approved without another preview."}</p><div class="button-stack"><button data-action="send-preview" ${errors.length ? "disabled" : ""}>${needsPreview ? "Prepare curator preview" : "Approve routine issue"}</button><button data-action="approve" ${errors.length || !["Awaiting curator approval", "Changes requested"].includes(family.issueStatus) ? "disabled" : ""}>Approve issue</button><button class="secondary" data-action="request-changes">Request changes</button><button class="text-button" data-action="skip-issue">Skip this issue</button></div>${family.issueNumber === 1 && ["Approved", "Printed", "Sent or handed off", "Received"].includes(family.issueStatus) ? `<div class="standing-preference"><strong>Future routine issues</strong><p>${family.approvalLevel === "Preauthorized" ? "Curator previews may be skipped when all permissions are complete." : "Curator review is still required for every issue."}</p>${family.approvalLevel === "Preauthorized" ? "" : `<button class="secondary" data-action="preauthorize-future">Allow routine issues without another preview</button>`}</div>` : ""}</section><section><span class="eyebrow">Print & handoff</span><label class="field"><span>Delivery method</span><select data-family-field="deliveryMethod">${["Family handoff", "Senior-center handoff", "Local mail"].map((option) => `<option ${family.deliveryMethod === option ? "selected" : ""}>${option}</option>`).join("")}</select></label><div class="button-stack"><button data-action="print" ${canPrint(family) ? "" : "disabled"}>Open browser print</button><button class="secondary" data-action="mark-sent" ${family.issueStatus !== "Printed" ? "disabled" : ""}>Record sent or handed off</button><button class="secondary" data-action="mark-received" ${family.issueStatus !== "Sent or handed off" ? "disabled" : ""}>Record received (optional)</button></div><p class="fine-print">Received is a voluntary delivery note. It is not engagement, wellbeing, or relationship data.</p></section></div><div class="mini-preview">${newspaper(family)}</div></div></section>`;
};

const replyView = (family: FamilyWorkspace): string => {
  const reply = family.reply ?? {
    text: "",
    method: "Handwriting" as const,
    intendedRecipients: family.curatorName,
    permission: "Keep private" as const,
    exactWordingApproved: false,
  };
  const canInclude = Boolean(replyForNextIssue(reply));
  return `<section class="view-panel" aria-labelledby="view-title"><div class="eyebrow">Part 5 of 5</div><h2 id="view-title" tabindex="-1">Record a reply (optional)</h2><p class="lede">No response is required. If ${escapeHtml(family.recipientName)} chooses to share a memory, Angela records the exact words from a handwritten card, a voice conversation, or one supported phone action.</p>
  ${family.openingReply ? `<div class="callout success"><strong>Included in Issue ${family.issueNumber}</strong><span>${escapeHtml(family.openingReply)}</span></div>` : ""}
  <div class="reply-layout"><form id="reply-form"><label class="field"><span>Exact reply text</span><textarea rows="7" data-reply-field="text">${escapeHtml(reply.text)}</textarea><small>Type or transcribe exactly. No caption assistant is available here.</small></label><div class="form-grid"><label class="field"><span>Response method</span><select data-reply-field="method">${["Voice", "Handwriting", "Supported phone action"].map((value) => `<option ${reply.method === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label class="field"><span>Intended recipients</span><input data-reply-field="intendedRecipients" value="${escapeHtml(reply.intendedRecipients)}"></label><label class="field"><span>Permission choice</span><select data-reply-field="permission">${["Keep private", "Send to selected family members", "Include in next issue"].map((value) => `<option ${reply.permission === value ? "selected" : ""}>${value}</option>`).join("")}</select></label></div><label class="check approval-check"><input type="checkbox" data-reply-field="exactWordingApproved" ${reply.exactWordingApproved ? "checked" : ""}><span>${escapeHtml(family.recipientName)} reviewed and approved this exact wording and these recipients.</span></label><div class="button-row"><button type="button" data-action="save-reply">Save synthetic reply</button><button type="button" class="secondary" data-action="copy-approved-reply" ${!reply.text.trim() || !reply.exactWordingApproved || reply.permission === "Keep private" ? "disabled" : ""}>Copy approved reply</button><button type="button" class="text-button danger" data-action="discard-reply">Discard</button></div></form><aside class="reply-rule"><span class="eyebrow">Next-issue rule</span><h3>${canInclude ? "Ready to carry forward" : "Not eligible yet"}</h3><p>${canInclude ? "The exact approved reply may appear in this family’s next issue." : "Only “Include in next issue” plus exact-wording approval can carry a reply forward."}</p><button data-action="next-issue" ${canInclude ? "" : "disabled"}>Start next issue with reply</button></aside></div></section>`;
};

const render = (): void => {
  const family = activeFamily();
  const views: Record<View, (value: FamilyWorkspace) => string> = {
    setup: setupView,
    contributions: contributionsView,
    builder: builderView,
    approval: approvalView,
    reply: replyView,
  };
  app.innerHTML = `<div class="prototype-banner" role="note"><strong>Private prototype:</strong> photos stay in this browser tab. Nothing is uploaded or saved after the tab closes.</div><div class="app-shell"><header class="app-header"><a class="brand" href="#" data-action="view" data-view="setup" aria-label="Family Weekly home"><span>Family</span> Weekly</a><label class="family-switcher"><span>Active private workspace</span><select id="family-switcher">${familyOptions()}</select></label><div class="issue-status"><span class="${statusClass(family.issueStatus)}">${family.issueStatus}</span><small>Issue ${family.issueNumber}</small></div></header><div class="identity-strip"><div><span>Family</span><strong>${escapeHtml(family.familyName)}</strong></div><div><span>Made for</span><strong>${escapeHtml(family.recipientName)}</strong></div><div class="identity-warning">Never combine family workspaces</div></div>${nav()}<main id="main-content">${views[view](family)}</main><footer class="app-footer"><p>Local-first prototype · Sample or personal photos · No external integrations</p><div><button class="text-button" data-action="clear-issue">Clear current issue</button><button class="text-button" data-action="reset-family">Reset current family demo</button><button class="text-button danger" data-action="reset-all">Reset all demonstration data</button></div></footer></div><div id="live-status" class="sr-only" role="status" aria-live="polite"></div>`;
};

const getItem = (id: string): Contribution | undefined =>
  activeFamily().contributions.find((item) => item.id === id);

const moveItem = (id: string, direction: -1 | 1): void => {
  const items = activeFamily().contributions;
  const index = items.findIndex((item) => item.id === id);
  const next = index + direction;
  if (index < 0 || next < 0 || next >= items.length) return;
  [items[index], items[next]] = [items[next], items[index]];
  invalidateApproval(activeFamily());
};

const MAX_LOCAL_IMAGE_BYTES = 15 * 1024 * 1024;

const addLocalPhotos = (
  files: FileList,
): { added: number; rejected: number } => {
  const family = activeFamily();
  const chosenFiles = Array.from(files);
  const validFiles = chosenFiles.filter(
    (file) =>
      file.type.startsWith("image/") && file.size <= MAX_LOCAL_IMAGE_BYTES,
  );
  let rejected = chosenFiles.length - validFiles.length;
  if (
    validFiles.length > 0 &&
    canAddPhoto(state) &&
    hasOnlySampleContributions(family)
  ) {
    family.contributions = [];
  }
  let added = 0;
  validFiles.forEach((file, index) => {
    if (!canAddPhoto(state) || selectedItems(family).length >= 4) {
      rejected += 1;
      return;
    }
    const baseName = file.name.replace(/\.[^.]+$/, "").trim();
    family.contributions.push({
      id: `${family.id}-local-${Date.now()}-${index}`,
      photoSrc: URL.createObjectURL(file),
      photoPosition: "center",
      isObjectUrl: true,
      originalCaption: "",
      editedCaption: "",
      headline: baseName || "A family moment",
      who: "",
      contributor: family.curatorName,
      permission: false,
      showsMinor: false,
      guardianPermission: false,
      status: "Draft",
    });
    state.pilotPhotoCount += 1;
    added += 1;
  });
  if (added) invalidateApproval(family);
  return { added, rejected };
};

const confirmReset = (message: string): boolean => window.confirm(message);

app.addEventListener("click", async (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>(
    "[data-action]",
  );
  if (!target) return;
  event.preventDefault();
  const action = target.dataset.action;
  const family = activeFamily();
  const item = target.dataset.id ? getItem(target.dataset.id) : undefined;
  if (action === "view") {
    view = target.dataset.view as View;
    render();
    focusView();
    return;
  }
  if (action === "move-earlier" && item) moveItem(item.id, -1);
  if (action === "move-later" && item) moveItem(item.id, 1);
  if (action === "remove-item" && item) {
    if (item.isObjectUrl) URL.revokeObjectURL(item.photoSrc);
    family.contributions = family.contributions.filter(
      (entry) => entry.id !== item.id,
    );
    invalidateApproval(family);
  }
  if (action === "defer-item" && item) {
    item.status = "Deferred";
    invalidateApproval(family);
  }
  if (action === "suggest" && item)
    item.suggestion = assistant.suggest(item.originalCaption)?.text;
  if (action === "accept-suggestion" && item?.suggestion) {
    item.editedCaption = item.suggestion;
    item.suggestion = undefined;
    invalidateApproval(family);
  }
  if (action === "reject-suggestion" && item) item.suggestion = undefined;
  if (action === "reset-caption" && item) {
    item.editedCaption = item.originalCaption;
    item.suggestion = undefined;
    invalidateApproval(family);
  }
  if (action === "send-preview") {
    const errors = approvalErrors(family);
    if (errors.length) {
      announce(`Approval blocked. ${errors.join(" ")}`);
      return;
    }
    if (!issueNeedsApproval(family)) {
      family.issueStatus = "Approved";
      announce(
        "Routine issue approved under the family preauthorization. No preview was sent.",
      );
      render();
      return;
    }
    family.issueStatus = "Awaiting curator approval";
    announce("Simulated curator preview is ready. No message was sent.");
  }
  if (action === "approve" && !approvalErrors(family).length) {
    family.issueStatus = "Approved";
    announce("Curator approval recorded.");
  }
  if (action === "preauthorize-future" && family.issueNumber === 1) {
    family.approvalLevel = "Preauthorized";
    announce("Future routine issues may skip curator preview.");
  }
  if (action === "request-changes") {
    family.issueStatus = "Changes requested";
    announce("Changes requested.");
  }
  if (action === "skip-issue") {
    family.issueStatus = "Draft";
    announce("Issue skipped. No content was sent or printed.");
  }
  if (action === "pause-issues") {
    family.approvalLevel = "Approval required";
    announce(
      "Future issues paused. Angela will ask for approval each time until preferences change.",
    );
  }
  if (action === "print" && canPrint(family)) {
    window.print();
    family.issueStatus = "Printed";
    announce(
      "Browser print opened. Printed status recorded for this simulation.",
    );
  }
  if (action === "mark-sent" && family.issueStatus === "Printed") {
    family.issueStatus = "Sent or handed off";
    announce("Manual handoff recorded.");
  }
  if (
    action === "mark-received" &&
    family.issueStatus === "Sent or handed off"
  ) {
    family.issueStatus = "Received";
    announce("Voluntary receipt confirmation recorded. No inference was made.");
  }
  if (action === "save-reply")
    announce("Synthetic reply saved in this tab only.");
  if (action === "discard-reply") {
    family.reply = undefined;
    announce("Reply discarded.");
  }
  if (action === "next-issue" && family.reply) {
    const openingReply = replyForNextIssue(family.reply);
    if (openingReply) {
      family.contributions.forEach((entry) => {
        if (entry.isObjectUrl) URL.revokeObjectURL(entry.photoSrc);
      });
      family.contributions = [];
      family.openingReply = openingReply;
      family.reply = undefined;
      family.issueNumber += 1;
      family.issueDate = new Date(
        new Date(family.issueDate).getTime() + 7 * 86400000,
      )
        .toISOString()
        .slice(0, 10);
      family.issueStatus = "Draft";
      view = "builder";
      announce("Next issue started with the exact approved reply.");
    }
  }
  if (action === "copy" && target.dataset.message) {
    try {
      const result = await channelAdapters.manual.copy(
        target.dataset.message,
        true,
      );
      announce(result.message);
    } catch {
      announce("Clipboard access was unavailable. Nothing was sent.");
    }
  }
  if (action === "copy-approved-reply" && family.reply) {
    try {
      const result = await channelAdapters.manual.copy(family.reply.text, true);
      announce(result.message);
    } catch {
      announce("Clipboard access was unavailable. Nothing was sent.");
    }
  }
  if (
    action === "clear-issue" &&
    confirmReset(
      `Clear Issue ${family.issueNumber} for ${family.recipientName}?`,
    )
  )
    clearIssue(family, URL.revokeObjectURL.bind(URL));
  if (
    action === "reset-family" &&
    confirmReset(`Reset all Stage 0 data for ${family.familyName}?`)
  ) {
    clearIssue(family, URL.revokeObjectURL.bind(URL));
    const fresh = createDemoState().families[family.id];
    state.families[family.id] = fresh;
    announce("Current family demo restored.");
  }
  if (
    action === "reset-all" &&
    confirmReset("Reset all three demonstration families?")
  ) {
    Object.values(state.families).forEach((entry) =>
      entry.contributions.forEach((itemValue) => {
        if (itemValue.isObjectUrl) URL.revokeObjectURL(itemValue.photoSrc);
      }),
    );
    state = createDemoState();
    view = "setup";
    announce("All demonstration data restored.");
  }
  render();
});

app.addEventListener("change", (event) => {
  const input = event.target as
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  const family = activeFamily();
  if (input.id === "family-switcher") {
    state.activeFamilyId = input.value as FamilyId;
    render();
    focusView();
    announce(
      `Switched to ${activeFamily().familyName}. Only this family's content is visible.`,
    );
    return;
  }
  if (input.dataset.familyField) {
    const key = input.dataset.familyField as keyof FamilyWorkspace;
    const value: unknown =
      key === "textSize" || key === "issueNumber"
        ? Number(input.value)
        : input.value;
    (family as unknown as Record<string, unknown>)[key] = value;
    invalidateApproval(family);
    render();
    return;
  }
  const itemId =
    input.dataset.id ??
    input.closest<HTMLElement>("[data-item-id]")?.dataset.itemId;
  if (input.dataset.itemField && itemId) {
    const item = getItem(itemId);
    if (!item) return;
    const key = input.dataset.itemField as keyof Contribution;
    const value =
      input instanceof HTMLInputElement && input.type === "checkbox"
        ? input.checked
        : input.value;
    const previousOriginalCaption = item.originalCaption;
    (item as unknown as Record<string, unknown>)[key] = value;
    if (
      key === "originalCaption" &&
      typeof value === "string" &&
      (!item.editedCaption.trim() ||
        item.editedCaption === previousOriginalCaption)
    ) {
      item.editedCaption = value;
    }
    invalidateApproval(family);
    render();
    return;
  }
  if (input.dataset.photoInput) {
    const item = getItem(input.dataset.photoInput);
    const file = (input as HTMLInputElement).files?.[0];
    if (item && file) {
      replacePhoto(
        item,
        URL.createObjectURL(file),
        URL.revokeObjectURL.bind(URL),
      );
      invalidateApproval(family);
      render();
      announce("Local image replaced in browser memory only.");
    }
    return;
  }
  if (input.dataset.newPhotoInput !== undefined) {
    const files = (input as HTMLInputElement).files;
    if (!files?.length) return;
    const { added, rejected } = addLocalPhotos(files);
    render();
    announce(
      `${added} ${added === 1 ? "photo" : "photos"} added in browser memory.${
        rejected
          ? ` ${rejected} could not be added because of the issue limit, pilot limit, file type, or 15 MB size limit.`
          : ""
      }`,
    );
    return;
  }
  if (input.dataset.replyField) {
    family.reply ??= {
      text: "",
      method: "Handwriting",
      intendedRecipients: family.curatorName,
      permission: "Keep private",
      exactWordingApproved: false,
    };
    const key = input.dataset.replyField;
    (family.reply as unknown as Record<string, unknown>)[key] =
      input instanceof HTMLInputElement && input.type === "checkbox"
        ? input.checked
        : input.value;
    render();
  }
});

window.addEventListener("beforeunload", () => {
  Object.values(state.families).forEach((family) =>
    family.contributions.forEach((item) => {
      if (item.isObjectUrl) URL.revokeObjectURL(item.photoSrc);
    }),
  );
});

render();
