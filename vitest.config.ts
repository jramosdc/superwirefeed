import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["rules/**/*.test.ts"],
    testTimeout: 15000,
    hookTimeout: 30000,
    // Rules tests talk to the Firebase emulators over a shared connection.
    fileParallelism: false,
  },
});
