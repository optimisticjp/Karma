import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // `server-only` throws by design outside a React Server Component, which
      // would stop a Node test runner from importing any server module. The
      // stub keeps the guard real in the app and inert in tests.
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts")
    }
  },
  test: { environment: "node", include: ["tests/**/*.test.ts"] }
});
