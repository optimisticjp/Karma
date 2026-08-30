import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // `.claude/` and `.specify/` are a VENDORED third-party skill library
    // (docs/claude-skills.md), not Karma source. They ship CommonJS helper
    // scripts and at least one file that does not parse as modern JS, so
    // linting them fails the build over code this project neither wrote nor
    // runs. Karma's own scripts stay linted.
    ignores: [
      ".next/**",
      ".open-next/**",
      "node_modules/**",
      "drizzle/**",
      ".claude/**",
      ".specify/**",
      "next-env.d.ts",
      "cloudflare-env.d.ts"
    ]
  }
];

export default eslintConfig;
