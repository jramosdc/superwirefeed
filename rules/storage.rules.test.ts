import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  initializeTestEnvironment,
  assertFails,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { ref, getBytes } from "firebase/storage";

// Verifies the gated asset under /assets/** is never client-readable — only the
// server download route (Admin SDK) may serve it.
//
// Run via: firebase emulators:exec --only storage "vitest run rules"
let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "superwire-rules-test",
    storage: {
      rules: readFileSync("storage.rules", "utf8"),
      host: "127.0.0.1",
      port: 9199,
    },
  });
});

afterAll(async () => {
  await testEnv?.cleanup();
});

describe("storage assets", () => {
  it("denies client reads of a gated asset", async () => {
    const buyer = testEnv.authenticatedContext("buyer").storage();
    await assertFails(getBytes(ref(buyer, "assets/seller/post1/data.csv")));
  });
});
