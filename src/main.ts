import "./styles.css";
import { DemoCaptionAssistant } from "./caption-assistant";
import {
  approvalErrors,
  canAddPhoto,
  canPrint,
  clearIssue,
  invalidateApproval,
  issueCutoffDate,
  issueNeedsApproval,
  MAX_ISSUE_ITEMS,
  replacePhoto,
  selectedItems,
  type Contribution,
  type FamilyContributor,
  type FamilyWorkspace,
  type IssueStatus,
} from "./model";
import { createDemoState } from "./synthetic-data";

type View = "setup" | "contributions" | "builder" | "approval";

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

const openContributorInvite = (): void => {
  const parts = window.location.hash.replace(/^#contributor\//, "").split("/");
  if (parts.length !== 3 || !window.location.hash.startsWith("#contributor/")) return;
  const family = state.families[parts[0] as keyof typeof state.families];
  const contributor = family?.contributors.find(
    (entry) => entry.id === parts[1] && entry.token === parts[2] && entry.active,
  );
  if (!family || !contributor) return;
  state.activeFamilyId = family.id;
  family.activeContributorId = contributor.id;
  view = "contributions";
};

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

const statusLabel = (status: IssueStatus): string =>
  status === "Approved" ? "Ready to print" : status;

const photoStyle = (item: Contribution): string => {
  if (!item.photoSrc) return "";
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

const contributorInviteUrl = (family: FamilyWorkspace, contributor: FamilyContributor): string =>
  `${window.location.origin}${import.meta.env.BASE_URL}#contributor/${family.id}/${contributor.id}/${contributor.token}`;

const newToken = (): string => {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const nav = (): string => {
  const items: Array<[View, string, string]> = [
    ["setup", "1", "Family setup"],
    ["contributions", "2", "Contributions"],
    ["builder", "3", "Issue builder"],
    ["approval", "4", "Approve & deliver"],
  ];
  return `<nav class="workflow-nav" aria-label="Issue workflow">${items
    .map(
      ([id, number, label]) =>
        `<button class="workflow-step ${view === id ? "is-current" : ""}" data-action="view" data-view="${id}" aria-current="${view === id ? "step" : "false"}"><span>${number}</span>${label}</button>`,
    )
    .join("")}</nav>`;
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
  return `<section class="view-panel" aria-labelledby="view-title">
    <div class="eyebrow">Part 1 of 4</div><h2 id="view-title" tabindex="-1">Family setup</h2>
    <p class="lede">Name the people this private issue belongs to. The schedule and print defaults are handled for you.</p>
    <div class="form-grid">
      ${field("Family name", "familyName", family.familyName)}
      ${field("Older recipient's preferred name", "recipientName", family.recipientName)}
      ${field("Family organizer", "curatorName", family.curatorName)}
    </div>
    <section class="share-panel schedule-summary" aria-label="Automatic issue schedule"><div><span class="eyebrow">Issue ${family.issueNumber}</span><h3>${formatDate(family.issueDate)}</h3><small>Publication date</small></div><div><span class="eyebrow">Photo cutoff</span><h3>${formatDate(cutoffDate)}</h3><small>After Wednesday, photos move to the following Sunday.</small></div></section>
    <section class="share-panel contributor-invites" aria-labelledby="contributors-title"><div class="section-heading"><div><span class="eyebrow">Persistent family circle</span><h3 id="contributors-title">Invite contributors once</h3><p>Each person gets a private link they can reuse for every weekly issue. The organizer owns the family circle and cannot be revoked.</p></div><button data-action="invite-contributor">Add contributor</button></div><div class="invite-list">${family.contributors.map((contributor) => `<div class="invite-row ${contributor.active ? "" : "is-revoked"}"><div><strong>${escapeHtml(contributor.name)}</strong><small>${contributor.role === "curator" ? "Organizer · permanent member" : contributor.active ? "Active member" : "Revoked"}</small></div><div class="invite-actions">${contributor.role === "curator" ? `<button class="secondary" data-action="share-contributor" data-contributor-id="${contributor.id}">Share link</button>` : contributor.active ? `<button class="secondary" data-action="share-contributor" data-contributor-id="${contributor.id}">Share link</button><button class="text-button danger" data-action="revoke-contributor" data-contributor-id="${contributor.id}">Revoke</button>` : `<button class="secondary" data-action="restore-contributor" data-contributor-id="${contributor.id}">Restore</button>`}</div></div>`).join("")}</div></section>
  </section>`;
};

const contributionCard = (
  item: Contribution,
  index: number,
): string => `<article class="contribution-card" data-item-id="${item.id}">
  <div class="photo-frame" role="img" aria-label="${escapeHtml(photoLabel(item))}" style="${photoStyle(item)}">${item.photoSrc ? "" : "<span>No photo added yet</span>"}<button class="photo-remove" data-action="remove-item" data-id="${item.id}" aria-label="Remove ${escapeHtml(item.headline)}">×</button></div>
  <div class="contribution-content"><div class="card-heading"><div><span class="item-number">Item ${index + 1}</span><h3>${escapeHtml(item.headline)}</h3></div><span class="status">${item.status}</span></div>
    <label class="field"><span>Headline</span><input data-item-field="headline" value="${escapeHtml(item.headline)}"></label>
    <label class="field"><span>Original caption</span><textarea data-item-field="originalCaption" rows="3">${escapeHtml(item.originalCaption)}</textarea></label>
    <fieldset class="permission-panel"><legend>Photo permission <strong>Required</strong></legend><label class="check"><input type="checkbox" data-item-field="permission" ${item.permission ? "checked" : ""}><span>I have permission to share this photo with this Family Weekly.</span></label></fieldset>
    <div class="form-grid compact">${fieldForItem(item, "Who is pictured", "who", item.who)}${fieldForItem(item, "Optional date", "date", item.date ?? "", "date")}${fieldForItem(item, "Optional place", "place", item.place ?? "")}${fieldForItem(item, "Contributor", "contributor", item.contributor)}</div>
    <label class="field"><span>Status</span><select data-item-field="status">${["Draft", "Ready for review", "Deferred", "Excluded"].map((status) => `<option ${item.status === status ? "selected" : ""}>${status}</option>`).join("")}</select></label>
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
  (family.contributions.filter(
    (item) => item.contributorId === family.activeContributorId && item.isObjectUrl,
  ).length < 4 || hasOnlySampleContributions(family));

const contributionsView = (
  family: FamilyWorkspace,
): string => `<section class="view-panel" aria-labelledby="view-title">
  <div class="eyebrow">Part 2 of 4</div><div class="section-heading"><div><h2 id="view-title" tabindex="-1">Contributions</h2><p class="lede">Contributors may submit up to four photos each. Select up to ${MAX_ISSUE_ITEMS} stories for this issue; captions remain editable.</p></div><div class="count-box"><strong>${selectedItems(family).length}/${MAX_ISSUE_ITEMS}</strong><span>selected</span><small>${state.pilotPhotoCount}/50 pilot photos</small></div></div>
  <section class="upload-panel" aria-labelledby="upload-title"><div><div class="eyebrow">Your family moments</div><h3 id="upload-title">Add up to four photos</h3><p>Select several images at once when your device allows it. If the picker only accepts one, choose this button again to add the rest. Photos stay in this browser tab and are never uploaded.</p></div><label class="field"><span>Submitting as</span><select data-family-field="activeContributorId">${family.contributors.filter((contributor) => contributor.active).map((contributor) => `<option value="${contributor.id}" ${family.activeContributorId === contributor.id ? "selected" : ""}>${escapeHtml(contributor.name)}</option>`).join("")}</select></label><label class="upload-control ${canChoosePhotos(family) ? "" : "is-disabled"}"><span>Choose photos</span><input type="file" accept="image/*" multiple data-new-photo-input ${canChoosePhotos(family) ? "" : "disabled"}></label><small>Up to 4 photos per contributor. The organizer selects up to 16 stories for the printed issue.</small></section>
  <div class="contribution-list">${family.contributions.filter((item) => item.photoSrc).map(contributionCard).join("") || `<div class="empty-state"><h3>No photos added yet</h3><p>Choose up to four photos above. Your selected photos will appear here for captions and permission.</p></div>`}</div>
</section>`;

const builderItem = (
  item: Contribution,
  index: number,
  family: FamilyWorkspace,
): string => `<article class="editor-row">
  <div class="photo-frame editor-photo" role="img" aria-label="${escapeHtml(photoLabel(item))}" style="${photoStyle(item)}">${item.photoSrc ? "" : "<span>No photo added yet</span>"}</div>
  <div><div class="card-heading"><div><span class="item-number">Story ${index + 1}</span><h3>${escapeHtml(item.headline)}</h3></div><div class="order-buttons"><button class="icon-button" data-action="move-earlier" data-id="${item.id}" aria-label="Move ${escapeHtml(item.headline)} earlier" ${index === 0 ? "disabled" : ""}>↑</button><button class="icon-button" data-action="move-later" data-id="${item.id}" aria-label="Move ${escapeHtml(item.headline)} later" ${index === selectedItems(family).length - 1 ? "disabled" : ""}>↓</button></div></div>
    <div class="comparison"><div><span>Original</span><p>${escapeHtml(item.originalCaption)}</p></div><label><span>Edited caption</span><textarea rows="4" data-item-field="editedCaption" data-id="${item.id}">${escapeHtml(item.editedCaption)}</textarea></label></div>
    ${item.suggestion ? `<div class="suggestion"><span class="eyebrow">Demonstration suggestion</span><p>${escapeHtml(item.suggestion)}</p><div class="button-row"><button data-action="accept-suggestion" data-id="${item.id}">Accept suggestion</button><button class="secondary" data-action="reject-suggestion" data-id="${item.id}">Reject</button></div></div>` : ""}
    <div class="button-row"><button class="secondary" data-action="suggest" data-id="${item.id}">Suggest caption edit</button><button class="secondary" data-action="reset-caption" data-id="${item.id}">Reset to original</button><button class="text-button" data-action="defer-item" data-id="${item.id}">Defer item</button></div>
  </div></article>`;

const newspaper = (family: FamilyWorkspace): string => {
  const items = selectedItems(family);
  const pages = Array.from(
    { length: Math.max(1, Math.ceil(items.length / 4)) },
    (_, index) => items.slice(index * 4, index * 4 + 4),
  );
  return `<div id="newspaper" class="print-root paper-${family.paperSize.toLowerCase()} text-${family.textSize}" aria-label="${pages.length}-page newspaper preview">${pages
    .map(
      (
        pageItems,
        pageIndex,
      ) => `<article class="newspaper-page" aria-label="Page ${pageIndex + 1} of ${pages.length}">
      ${pageIndex === 0 ? `<header class="masthead"><span>Family Weekly</span><span>${escapeHtml(family.familyName)}</span></header><div class="newspaper-title"><p>Issue ${family.issueNumber} - ${escapeHtml(family.issueDate)}</p><h1>${escapeHtml(family.headline)}</h1><p>Made for ${escapeHtml(family.recipientName)}</p></div>` : `<header class="page-kicker"><span>Family Weekly - ${escapeHtml(family.familyName)} - For ${escapeHtml(family.recipientName)}</span><span>Page ${pageIndex + 1}</span></header>`}
      ${family.openingReply && pageIndex === 0 ? `<blockquote class="reply-note"><strong>A note from ${escapeHtml(family.recipientName)}</strong><p>${escapeHtml(family.openingReply)}</p></blockquote>` : ""}
      <div class="story-grid">${pageItems.map((item) => `<section class="newspaper-story"><div class="photo-frame newspaper-photo" role="img" aria-label="${escapeHtml(photoLabel(item))}" style="${photoStyle(item)}">${item.photoSrc ? "" : "<span>No photo</span>"}</div><div><h2>${escapeHtml(item.headline)}</h2>${item.editedCaption.trim() ? `<p>${escapeHtml(item.editedCaption)}</p>` : ""}<p class="story-meta">${escapeHtml([item.who, item.place, item.date].filter(Boolean).join(" - "))}</p></div></section>`).join("")}</div>
      ${pageItems.length === 0 ? `<div class="quiet-page"><p>A little breathing room this week.</p><p>Fewer stories, never smaller words.</p></div>` : ""}
      <section class="private-note-space" aria-label="Handwriting space on the printed issue"><h2>Notes for me</h2><p>After printing, handwrite a memory, question, or private note in this space. Nothing written here is stored digitally.</p><div class="note-lines" aria-hidden="true"></div></section>
      <footer><span>Private family issue - Local-first prototype</span><span>${pageIndex + 1} / ${pages.length}</span></footer>
    </article>`,
    )
    .join("")}</div>`;
};

const builderView = (
  family: FamilyWorkspace,
): string => `<section class="view-panel builder-view" aria-labelledby="view-title">
  <div class="eyebrow">Part 3 of 4</div><h2 id="view-title" tabindex="-1">Issue builder</h2><p class="lede">Edit words on the left. The fixed, family-specific newspaper stays visible on the right.</p>
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
  const approvalRecorded = [
    "Approved",
    "Printed",
    "Sent or handed off",
    "Received",
  ].includes(family.issueStatus);
  return `<section class="view-panel" aria-labelledby="view-title"><div class="eyebrow">Part 4 of 4</div><div class="section-heading"><div><h2 id="view-title" tabindex="-1">Approval, print & delivery</h2><p class="lede">Photo permissions are always required. Curator preview can be skipped only for routine issues with a standing preference.</p></div><span class="${statusClass(family.issueStatus)}">${family.issueStatus}</span></div>
  ${errors.length ? `<div class="validation-summary" role="alert" tabindex="-1"><h3>Complete these checks</h3><ul>${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join("")}</ul><button class="secondary" data-action="view" data-view="contributions">Go to Step 2 photo permissions</button></div>` : `<div class="callout success"><strong>${needsPreview ? "Ready for organizer review" : "Ready under the standing preference"}</strong><span>All required identity and photo-permission checks pass.</span></div>`}
  <div class="approval-layout"><div class="approval-actions"><section><span class="eyebrow">Organizer review</span><h3>${escapeHtml(family.curatorName)}</h3><p>${errors.length ? "Use the checklist above to finish photo permissions, then approve here." : needsPreview ? "The complete issue is visible beside this panel. The family organizer can approve it when ready." : "This routine issue can be approved under the standing preference."}</p><div class="button-stack"><button data-action="approve" ${approvalRecorded ? "disabled" : ""}>${approvalRecorded ? "Approval recorded" : needsPreview ? "Approve issue" : "Approve routine issue"}</button><button class="secondary" data-action="request-changes">Request changes</button><button class="text-button" data-action="skip-issue">Skip this issue</button></div>${family.issueNumber === 1 && approvalRecorded ? `<div class="standing-preference"><strong>Future routine issues</strong><p>${family.approvalLevel === "Preauthorized" ? "Organizer previews may be skipped when all permissions are complete." : "Organizer review is still required for every issue."}</p>${family.approvalLevel === "Preauthorized" ? "" : `<button class="secondary" data-action="preauthorize-future">Allow routine issues without another preview</button>`}</div>` : ""}</section><section><span class="eyebrow">Print & handoff</span><label class="field"><span>Delivery method</span><select data-family-field="deliveryMethod">${["Family handoff", "Senior-center handoff", "Local mail"].map((option) => `<option ${family.deliveryMethod === option ? "selected" : ""}>${option}</option>`).join("")}</select></label><div class="button-stack"><button data-action="print" ${canPrint(family) ? "" : "disabled"}>Open browser print</button><button class="secondary" data-action="mark-sent" ${family.issueStatus !== "Printed" ? "disabled" : ""}>Record sent or handed off</button><button class="secondary" data-action="mark-received" ${family.issueStatus !== "Sent or handed off" ? "disabled" : ""}>Record received (optional)</button></div><p class="fine-print">Received is a voluntary delivery note. It is not engagement, wellbeing, or relationship data.</p></section></div><div class="mini-preview">${newspaper(family)}</div></div></section>`;
};

const render = (): void => {
  const family = activeFamily();
  const views: Record<View, (value: FamilyWorkspace) => string> = {
    setup: setupView,
    contributions: contributionsView,
    builder: builderView,
    approval: approvalView,
  };
  app.innerHTML = `<div class="prototype-banner" role="note"><strong>Private prototype:</strong> photos stay in this browser tab so you can arrange and print them. Nothing is uploaded, and closing the tab clears them.</div><div class="app-shell"><header class="app-header"><a class="brand" href="#" data-action="view" data-view="setup" aria-label="Family Weekly home"><span>Family</span> Weekly</a><div class="issue-status"><span class="${statusClass(family.issueStatus)}">${statusLabel(family.issueStatus)}</span><small>Issue ${family.issueNumber}</small></div></header><div class="identity-strip"><div><span>Family</span><strong>${escapeHtml(family.familyName)}</strong></div><div><span>Made for</span><strong>${escapeHtml(family.recipientName)}</strong></div></div>${nav()}<main id="main-content">${views[view](family)}</main><footer class="app-footer"><p>Local-first prototype · Sample or personal photos · No external integrations</p><div><button class="text-button" data-action="clear-issue">Clear current issue</button><button class="text-button" data-action="reset-family">Reset current family demo</button><button class="text-button danger" data-action="reset-all">Reset all demonstration data</button></div></footer></div><div id="live-status" class="sr-only" role="status" aria-live="polite"></div>`;
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
    const contributorPhotoCount = family.contributions.filter(
      (item) => item.contributorId === family.activeContributorId && item.isObjectUrl,
    ).length;
    if (!canAddPhoto(state) || contributorPhotoCount >= 4) {
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
      contributor: family.contributors.find((entry) => entry.id === family.activeContributorId)?.name ?? family.curatorName,
      contributorId: family.activeContributorId,
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

const getContributor = (family: FamilyWorkspace, id: string): FamilyContributor | undefined =>
  family.contributors.find((contributor) => contributor.id === id);

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
  if (action === "invite-contributor") {
    const name = window.prompt("Contributor name")?.trim();
    if (name) {
      const contributor: FamilyContributor = {
        id: `${family.id}-contributor-${Date.now()}`,
        name,
        token: newToken(),
        active: true,
        role: "contributor",
      };
      family.contributors.push(contributor);
      family.activeContributorId = contributor.id;
      announce(`${name} added as a family contributor.`);
    }
  }
  if (["revoke-contributor", "restore-contributor"].includes(action ?? "")) {
    const contributor = target.dataset.contributorId
      ? getContributor(family, target.dataset.contributorId)
      : undefined;
    if (contributor && contributor.role !== "curator") {
      contributor.active = action === "restore-contributor";
      if (!contributor.active && family.activeContributorId === contributor.id) {
        family.activeContributorId = family.contributors.find((entry) => entry.active)?.id ?? family.activeContributorId;
      }
      announce(`${contributor.name}'s contributor link ${contributor.active ? "restored" : "revoked"}.`);
    }
  }
  if (action === "share-contributor") {
    const contributor = target.dataset.contributorId
      ? getContributor(family, target.dataset.contributorId)
      : undefined;
    if (contributor) {
      const url = contributorInviteUrl(family, contributor);
      const shareData = { title: `Family Weekly for ${family.recipientName}`, text: `Add something from your week to ${family.familyName}'s Family Weekly.`, url };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
          announce("Invitation shared.");
        } catch {
          announce("Share canceled.");
        }
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        announce("Invitation link copied.");
      } else {
        window.prompt("Copy this private contributor link", url);
      }
    }
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
  if (action === "approve") {
    const errors = approvalErrors(family);
    if (errors.length) {
      announce(`Cannot approve yet. ${errors.join(" ")}`);
      document.querySelector<HTMLElement>(".validation-summary")?.focus();
      return;
    }
    family.issueStatus = "Approved";
    announce(
      issueNeedsApproval(family)
        ? "Curator approval recorded. The issue is ready to print."
        : "Routine issue approved. It is ready to print.",
    );
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
  if (
    action === "clear-issue" &&
    confirmReset(
      `Clear Issue ${family.issueNumber} for ${family.recipientName}?`,
    )
  )
    clearIssue(family, URL.revokeObjectURL.bind(URL));
  if (
    action === "reset-family" &&
    confirmReset(`Reset all prototype data for ${family.familyName}?`)
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
          ? ` ${rejected} could not be added because of the four-photo-per-contributor, pilot, file type, or 15 MB limit.`
          : ""
      }`,
    );
    return;
  }
});

window.addEventListener("beforeunload", () => {
  Object.values(state.families).forEach((family) =>
    family.contributions.forEach((item) => {
      if (item.isObjectUrl) URL.revokeObjectURL(item.photoSrc);
    }),
  );
});

openContributorInvite();
render();
