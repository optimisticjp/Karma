import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Default config. To enable ISR caching later, add an R2 incremental cache here:
// https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig();
