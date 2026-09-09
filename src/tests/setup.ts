import { afterEach, beforeEach, vi } from "vitest";

beforeEach(() => {
  document.body.innerHTML = '<div id="app"></div>';
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
  Object.defineProperty(window, "confirm", {
    configurable: true,
    value: vi.fn(() => true),
  });
  Object.defineProperty(window, "print", {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: vi.fn(() => "blob:synthetic-local-image"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});
