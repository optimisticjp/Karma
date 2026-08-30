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
  /* tsconfig sets jsx: "preserve" because Next.js does its own transform.
     esbuild honours that, so a test importing a .tsx component would see raw
     JSX and fail to parse. Tests transform it themselves instead — this
     changes nothing about how the app is built. */
  oxc: { jsx: { runtime: "automatic" } },
  test: { environment: "node", include: ["tests/**/*.test.{ts,tsx}"] }
});
