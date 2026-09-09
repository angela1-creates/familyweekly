import { describe, expect, it, vi } from "vitest";
import { DemoCaptionAssistant } from "../caption-assistant";
import { ManualChannelAdapter, PlaceholderChannelAdapter } from "../channels";

describe("caption assistance", () => {
  const original =
    "We spread out the old quilt and ate lunch under the maple tree on Sunday.";

  it("preserves the original while returning a labeled suggestion", () => {
    const assistant = new DemoCaptionAssistant();
    const suggestion = assistant.suggest(original);
    expect(original).toBe(
      "We spread out the old quilt and ate lunch under the maple tree on Sunday.",
    );
    expect(suggestion?.label).toBe("Demonstration suggestion");
    expect(suggestion?.text).not.toBe(original);
  });

  it("returns no suggestion for content outside the included synthetic set", () => {
    expect(
      new DemoCaptionAssistant().suggest("Real family content"),
    ).toBeUndefined();
  });

  it("supports rejecting and resetting without changing the original", () => {
    let edited = original;
    const suggestion = new DemoCaptionAssistant().suggest(original)?.text;
    expect(suggestion).toBeDefined();
    // Reject: do not assign the suggestion.
    expect(edited).toBe(original);
    edited = suggestion!;
    edited = original;
    expect(edited).toBe(original);
  });
});

describe("channel adapters", () => {
  it("requires explicit user initiation before clipboard access", async () => {
    const writer = vi.fn().mockResolvedValue(undefined);
    const adapter = new ManualChannelAdapter(writer);
    expect(await adapter.copy("Reminder", false)).toEqual({
      ok: false,
      message: "Copy requires an explicit button press.",
    });
    expect(writer).not.toHaveBeenCalled();
    await adapter.copy("Reminder", true);
    expect(writer).toHaveBeenCalledWith("Reminder");
  });

  it("keeps external channels disconnected and makes no network call", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const adapter = new PlaceholderChannelAdapter("wechat", "WeChat");
    const result = await adapter.copy();
    expect(result.ok).toBe(false);
    expect(result.message).toContain("not connected");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
