import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const loadApp = async () => {
  vi.resetModules();
  document.body.innerHTML = '<div id="app"></div>';
  await import("../main");
};

describe("Family Weekly application", () => {
  beforeEach(async () => {
    await loadApp();
  });

  it("explains local printing without showing inactive sharing tools", () => {
    expect(document.body.textContent).toContain(
      "photos stay in this browser tab",
    );
    expect(document.body.textContent).toContain("arrange and print them");
    expect(document.body.textContent).not.toContain("Demonstration link");
    expect(document.body.textContent).not.toContain("example.invalid");
    expect(document.body.textContent).not.toContain("Copy tools");
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
    expect(document.querySelector(".permission-panel")?.textContent).toContain(
      "Photo permission Required",
    );
    expect(
      document.querySelector<HTMLInputElement>(
        '.permission-panel [data-item-field="permission"]',
      ),
    ).not.toBeNull();
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
    expect(document.body.textContent).toContain("Your notes");
  });

  it("keeps three fictional family workspaces visibly separate", () => {
    const switcher =
      document.querySelector<HTMLSelectElement>("#family-switcher")!;
    expect(switcher.options).toHaveLength(3);
    expect(document.body.textContent).toContain("Rivera Family");
    expect(document.querySelector(".identity-strip")?.textContent).toContain(
      "Nana Rosa",
    );
    switcher.value = "demo-b";
    switcher.dispatchEvent(new Event("change", { bubbles: true }));
    expect(document.querySelector(".identity-strip")?.textContent).toContain(
      "Patel Family",
    );
    expect(
      document.querySelector(".identity-strip")?.textContent,
    ).not.toContain("Rivera Family");
    expect(document.body.textContent).not.toContain("14 steps");
  });

  it("keeps setup focused and moves optional choices to their point of use", () => {
    expect(document.querySelectorAll("[data-family-field]")).toHaveLength(3);
    expect(
      document.querySelector('[data-family-field="issueDate"]'),
    ).toBeNull();
    expect(
      document.querySelector('[data-family-field="issueNumber"]'),
    ).toBeNull();
    expect(document.querySelector('[data-family-field="channel"]')).toBeNull();
    expect(
      document.querySelector('[data-family-field="approvalLevel"]'),
    ).toBeNull();
    expect(document.body.textContent).toContain("Photo cutoff");

    document.querySelector<HTMLElement>('[data-view="builder"]')?.click();
    expect(
      document.querySelector('[data-family-field="paperSize"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('[data-family-field="textSize"]'),
    ).not.toBeNull();
    document.querySelector<HTMLElement>('[data-view="delivery"]')?.click();
    expect(
      document.querySelector('[data-family-field="deliveryMethod"]'),
    ).not.toBeNull();
  });

  it("renders print controls disabled before curator approval", () => {
    document.querySelector<HTMLElement>('[data-view="delivery"]')?.click();
    const print = document.querySelector<HTMLButtonElement>(
      '[data-action="print"]',
    );
    expect(print?.disabled).toBe(true);
    document.querySelector<HTMLElement>('[data-view="approval"]')?.click();
    const approve = document.querySelector<HTMLButtonElement>(
      '[data-action="approve"]',
    )!;
    expect(approve.disabled).toBe(false);
    approve.click();
    expect(document.querySelector("#live-status")?.textContent).toContain(
      "Cannot approve yet",
    );
    document
      .querySelector<HTMLElement>(
        '.validation-summary [data-view="contributions"]',
      )
      ?.click();
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

  it("print CSS hides operator controls and supports dynamic page counts", () => {
    const css = readFileSync(join(process.cwd(), "src", "styles.css"), "utf8");
    expect(css).toContain("@media print");
    expect(css).toContain(".workflow-nav");
    expect(css).toContain("display: none !important");
    document.querySelector<HTMLElement>('[data-view="contributions"]')?.click();
    document
      .querySelector<HTMLElement>('[data-action="load-sample-issue"]')
      ?.click();
    document.querySelector<HTMLElement>('[data-view="builder"]')?.click();
    expect(document.querySelectorAll(".newspaper-page")).toHaveLength(2);
  });

  it("loads a fictional issue and unlocks approval, print, delivery, and reply", () => {
    document.querySelector<HTMLElement>('[data-view="contributions"]')?.click();
    document
      .querySelector<HTMLElement>('[data-action="load-sample-issue"]')
      ?.click();
    expect(document.querySelectorAll(".contribution-card")).toHaveLength(4);
    expect(
      document.querySelectorAll<HTMLInputElement>(
        '[data-item-field="permission"]:checked',
      ),
    ).toHaveLength(4);

    document.querySelector<HTMLElement>('[data-view="approval"]')?.click();
    document.querySelector<HTMLElement>('[data-action="approve"]')?.click();
    expect(document.querySelector(".app-header .status")?.textContent).toBe(
      "Ready to print",
    );

    document.querySelector<HTMLElement>('[data-view="delivery"]')?.click();
    document.querySelector<HTMLElement>('[data-action="print"]')?.click();
    document
      .querySelector<HTMLElement>('[data-action="mark-printed"]')
      ?.click();
    document.querySelector<HTMLElement>('[data-action="mark-sent"]')?.click();
    expect(document.body.textContent).toContain("Sent or handed off");

    document.querySelector<HTMLElement>('[data-view="reply"]')?.click();
    expect(document.body.textContent).toContain("Record a reply (optional)");
    expect(document.querySelector('[data-reply-field="text"]')).not.toBeNull();
  });

  it("completes the contribute-to-print journey", () => {
    document.querySelector<HTMLElement>('[data-view="contributions"]')?.click();
    const input = document.querySelector<HTMLInputElement>(
      "[data-new-photo-input]",
    )!;
    const first = new File(["one"], "one.jpg", { type: "image/jpeg" });
    Object.defineProperty(input, "files", {
      configurable: true,
      value: [first],
    });
    input.dispatchEvent(new Event("change", { bubbles: true }));
    const permission = document.querySelector<HTMLInputElement>(
      '[data-item-field="permission"]',
    )!;
    permission.checked = true;
    permission.dispatchEvent(new Event("change", { bubbles: true }));

    document.querySelector<HTMLElement>('[data-view="builder"]')?.click();
    document.querySelector<HTMLElement>('[data-action="move-later"]')?.click();

    document.querySelector<HTMLElement>('[data-view="approval"]')?.click();
    const approve = document.querySelector<HTMLButtonElement>(
      '[data-action="approve"]',
    )!;
    expect(approve.disabled).toBe(false);
    approve.click();
    expect(document.body.textContent).toContain("Approved");
    expect(document.querySelector(".app-header .status")?.textContent).toBe(
      "Ready to print",
    );
    document
      .querySelector<HTMLElement>('[data-action="preauthorize-future"]')
      ?.click();
    expect(document.body.textContent).toContain(
      "Organizer previews may be skipped",
    );
    document.querySelector<HTMLElement>('[data-view="delivery"]')?.click();
    document.querySelector<HTMLElement>('[data-action="print"]')?.click();
    expect(window.print).toHaveBeenCalledOnce();
    document
      .querySelector<HTMLElement>('[data-action="mark-printed"]')
      ?.click();
    document.querySelector<HTMLElement>('[data-action="mark-sent"]')?.click();
    expect(document.body.textContent).toContain("Sent or handed off");
    expect(document.querySelector('[data-view="reply"]')).not.toBeNull();
    document.querySelector<HTMLElement>('[data-view="reply"]')?.click();
    expect(document.body.textContent).toContain(
      "reviewed and approved this exact wording",
    );
  });
});
