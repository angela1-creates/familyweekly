import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const loadApp = async () => {
  vi.resetModules();
  document.body.innerHTML = '<div id="app"></div>';
  await import("../main");
};

describe("Stage 0 application", () => {
  beforeEach(async () => {
    await loadApp();
  });

  it("shows the persistent local-only notice and simulated link", () => {
    expect(document.body.textContent).toContain(
      "photos stay in this browser tab",
    );
    expect(document.body.textContent).toContain(
      "Demonstration link · not active",
    );
    expect(document.body.textContent).toContain("example.invalid");
  });

  it("replaces sample stories with locally selected photos and optional captions", () => {
    document.querySelector<HTMLElement>('[data-view="contributions"]')?.click();
    const input = document.querySelector<HTMLInputElement>(
      "[data-new-photo-input]",
    )!;
    expect(input.disabled).toBe(false);
    const photo = new File(["image bytes"], "Sunday picnic.jpg", {
      type: "image/jpeg",
    });
    Object.defineProperty(input, "files", {
      configurable: true,
      value: [photo],
    });
    input.dispatchEvent(new Event("change", { bubbles: true }));

    expect(document.querySelectorAll(".contribution-card")).toHaveLength(1);
    expect(document.body.textContent).toContain("Sunday picnic");
    expect(
      document.querySelector<HTMLTextAreaElement>(
        '[data-item-field="originalCaption"]',
      )?.value,
    ).toBe("");
    expect(URL.createObjectURL).toHaveBeenCalledWith(photo);

    const caption = document.querySelector<HTMLTextAreaElement>(
      '[data-item-field="originalCaption"]',
    )!;
    caption.value = "We finally got everyone together for a picnic.";
    caption.dispatchEvent(new Event("change", { bubbles: true }));
    document.querySelector<HTMLElement>('[data-view="builder"]')?.click();
    expect(
      document.querySelector<HTMLTextAreaElement>(
        '[data-item-field="editedCaption"]',
      )?.value,
    ).toBe("We finally got everyone together for a picnic.");
  });

  it("switches families without leaving the previous identity visible", () => {
    const select =
      document.querySelector<HTMLSelectElement>("#family-switcher")!;
    expect(document.body.textContent).toContain("Rivera Family");
    select.value = "demo-b";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    expect(document.querySelector(".identity-strip")?.textContent).toContain(
      "Patel Family",
    );
    expect(
      document.querySelector(".identity-strip")?.textContent,
    ).not.toContain("Rivera Family");
  });

  it("renders print controls disabled before curator approval", () => {
    document.querySelector<HTMLElement>('[data-view="approval"]')?.click();
    const print = document.querySelector<HTMLButtonElement>(
      '[data-action="print"]',
    );
    expect(print?.disabled).toBe(true);
  });

  it("contains no persistent storage or external request calls", async () => {
    const source = await import("../main?raw");
    expect(source.default).not.toMatch(
      /localStorage|sessionStorage|indexedDB|document\.cookie/,
    );
    expect(source.default).not.toMatch(
      /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket/,
    );
  });

  it("print CSS hides operator controls and defines exactly two printable pages", () => {
    const css = readFileSync(join(process.cwd(), "src", "styles.css"), "utf8");
    expect(css).toContain("@media print");
    expect(css).toContain(".workflow-nav");
    expect(css).toContain("display: none !important");
    document.querySelector<HTMLElement>('[data-view="builder"]')?.click();
    expect(document.querySelectorAll(".newspaper-page")).toHaveLength(2);
  });

  it("completes the full synthetic contribute-to-next-issue journey", () => {
    document.querySelector<HTMLElement>('[data-view="contributions"]')?.click();

    const permission = document.querySelector<HTMLInputElement>(
      '[data-item-id="demo-a-item-2"] [data-item-field="permission"]',
    )!;
    permission.checked = true;
    permission.dispatchEvent(new Event("change", { bubbles: true }));

    const guardian = document.querySelector<HTMLInputElement>(
      '[data-item-id="demo-a-item-2"] [data-item-field="guardianPermission"]',
    )!;
    guardian.checked = true;
    guardian.dispatchEvent(new Event("change", { bubbles: true }));

    document.querySelector<HTMLElement>('[data-view="builder"]')?.click();
    document
      .querySelector<HTMLElement>(
        '[data-action="suggest"][data-id="demo-a-item-1"]',
      )
      ?.click();
    expect(document.body.textContent).toContain("Demonstration suggestion");
    document
      .querySelector<HTMLElement>(
        '[data-action="accept-suggestion"][data-id="demo-a-item-1"]',
      )
      ?.click();
    document
      .querySelector<HTMLElement>(
        '[data-action="move-later"][data-id="demo-a-item-1"]',
      )
      ?.click();

    document.querySelector<HTMLElement>('[data-view="approval"]')?.click();
    const sendPreview = document.querySelector<HTMLButtonElement>(
      '[data-action="send-preview"]',
    )!;
    expect(sendPreview.disabled).toBe(false);
    sendPreview.click();
    document.querySelector<HTMLElement>('[data-action="approve"]')?.click();
    expect(document.body.textContent).toContain("Approved");
    document.querySelector<HTMLElement>('[data-action="print"]')?.click();
    expect(window.print).toHaveBeenCalledOnce();
    document.querySelector<HTMLElement>('[data-action="mark-sent"]')?.click();
    expect(document.body.textContent).toContain("Sent or handed off");

    document.querySelector<HTMLElement>('[data-view="reply"]')?.click();
    const replyText = document.querySelector<HTMLTextAreaElement>(
      '[data-reply-field="text"]',
    )!;
    replyText.value =
      "I loved the fort. Please tell June I want the full story.";
    replyText.dispatchEvent(new Event("change", { bubbles: true }));
    const permissionChoice = document.querySelector<HTMLSelectElement>(
      '[data-reply-field="permission"]',
    )!;
    permissionChoice.value = "Include in next issue";
    permissionChoice.dispatchEvent(new Event("change", { bubbles: true }));
    const exactApproval = document.querySelector<HTMLInputElement>(
      '[data-reply-field="exactWordingApproved"]',
    )!;
    exactApproval.checked = true;
    exactApproval.dispatchEvent(new Event("change", { bubbles: true }));

    const nextIssue = document.querySelector<HTMLButtonElement>(
      '[data-action="next-issue"]',
    )!;
    expect(nextIssue.disabled).toBe(false);
    nextIssue.click();
    expect(document.body.textContent).toContain("Issue 2");
    expect(document.body.textContent).toContain(
      "I loved the fort. Please tell June I want the full story.",
    );
    expect(document.querySelectorAll(".newspaper-page")).toHaveLength(2);
  });
});
