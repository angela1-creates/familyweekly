import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/familyweekly/",
  server: { host: "127.0.0.1", port: 4173 },
  preview: { host: "127.0.0.1", port: 4173 },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    include: ["src/tests/**/*.test.ts"],
    exclude: ["node_modules/**", "dist/**", ".artifacts/**"],
  },
});
