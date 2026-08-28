/**
 * Vitest stand-in for the `server-only` package.
 *
 * The real module throws on import outside a React Server Component, which is
 * exactly its job in the app — and exactly why a Node test runner cannot load
 * a server module without this alias. Aliased in vitest.config.ts.
 */
export {};
