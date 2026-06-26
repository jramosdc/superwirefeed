import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Verifies the Firestore rules close the holes the old app had:
//  - a non-purchaser cannot forge a `purchases` doc
//  - a user can read only their OWN purchase
//  - a user cannot create a post claiming someone else as owner
//
// Run via: firebase emulators:exec --only firestore "vitest run rules"
let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "superwire-rules-test",
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv?.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe("purchases", () => {
  it("blocks a client from forging a purchase doc", async () => {
    const buyer = testEnv.authenticatedContext("buyer").firestore();
    await assertFails(
      setDoc(doc(buyer, "purchases", "buyer_post1"), {
        uid: "buyer",
        postId: "post1",
        amount: 0,
      }),
    );
  });

  it("lets a user read only their own purchase", async () => {
    // Seed a purchase with admin (rules bypassed).
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "purchases", "buyer_post1"), {
        uid: "buyer",
        postId: "post1",
        amount: 3500,
      });
    });

    const buyer = testEnv.authenticatedContext("buyer").firestore();
    const stranger = testEnv.authenticatedContext("stranger").firestore();

    await assertSucceeds(getDoc(doc(buyer, "purchases", "buyer_post1")));
    await assertFails(getDoc(doc(stranger, "purchases", "buyer_post1")));
  });

  it("lets a signed-in user read a non-existent purchase (the 'did I buy this?' check)", async () => {
    const buyer = testEnv.authenticatedContext("buyer").firestore();
    await assertSucceeds(getDoc(doc(buyer, "purchases", "buyer_never-bought")));
  });
});

describe("posts", () => {
  it("blocks creating a post owned by someone else", async () => {
    const mallory = testEnv.authenticatedContext("mallory").firestore();
    await assertFails(
      setDoc(doc(mallory, "posts", "p1"), {
        ownerUid: "victim",
        feedId: "victim",
        title: "spoofed",
      }),
    );
  });

  it("allows creating your own post", async () => {
    const author = testEnv.authenticatedContext("author").firestore();
    await assertSucceeds(
      setDoc(doc(author, "posts", "p2"), {
        ownerUid: "author",
        feedId: "author",
        title: "mine",
      }),
    );
  });
});

describe("reviews", () => {
  it("blocks a client from writing a review directly", async () => {
    // Reviews are written only by /api/reviews (Admin SDK) so the seller's
    // rating aggregate stays consistent. Direct client writes must fail.
    const author = testEnv.authenticatedContext("author").firestore();
    await assertFails(
      setDoc(doc(author, "reviews", "author_seller"), {
        sellerUid: "seller",
        authorUid: "author",
        rating: 5,
        text: "great",
      }),
    );
  });

  it("allows anyone to read reviews", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "reviews", "author_seller"), {
        sellerUid: "seller",
        authorUid: "author",
        rating: 4,
      });
    });
    const stranger = testEnv.authenticatedContext("stranger").firestore();
    await assertSucceeds(getDoc(doc(stranger, "reviews", "author_seller")));
  });
});

describe("trust & accuracy (server-only)", () => {
  it("blocks a client from forging an attestation", async () => {
    const u = testEnv.authenticatedContext("alice").firestore();
    await assertFails(
      setDoc(doc(u, "attestations", "alice_post1"), {
        attesterUid: "alice",
        postId: "post1",
        verdict: "corroborate",
        weight: 99,
        verifiedBuyer: true,
      }),
    );
  });

  it("blocks a client from writing their own trust score", async () => {
    const u = testEnv.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(u, "trust", "alice"), { score: 9999 }));
  });

  it("blocks a client from forging a post accuracy aggregate", async () => {
    const u = testEnv.authenticatedContext("alice").firestore();
    await assertFails(
      setDoc(doc(u, "postAccuracy", "post1"), { score: 1, corroborations: 50 }),
    );
  });

  it("allows anyone to read trust & accuracy", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "trust", "seller"), { score: 12 });
      await setDoc(doc(ctx.firestore(), "postAccuracy", "post1"), { score: 0.8 });
    });
    const stranger = testEnv.authenticatedContext("stranger").firestore();
    await assertSucceeds(getDoc(doc(stranger, "trust", "seller")));
    await assertSucceeds(getDoc(doc(stranger, "postAccuracy", "post1")));
  });
});

describe("certifications & AI flags (server-only)", () => {
  it("blocks a client from forging a certification", async () => {
    const u = testEnv.authenticatedContext("alice").firestore();
    await assertFails(
      setDoc(doc(u, "certifications", "alice_post1"), {
        postId: "post1",
        certifierUid: "alice",
        kind: "authored",
      }),
    );
  });

  it("blocks a client from writing the certification summary / AI flag", async () => {
    const u = testEnv.authenticatedContext("alice").firestore();
    await assertFails(
      setDoc(doc(u, "postCertification", "post1"), {
        authoredCount: 5,
        aiFlagged: false,
      }),
    );
  });

  it("allows anyone to read certifications", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "postCertification", "post1"), {
        authoredCount: 1,
        verifiedCount: 0,
        aiFlagged: false,
      });
    });
    const stranger = testEnv.authenticatedContext("stranger").firestore();
    await assertSucceeds(getDoc(doc(stranger, "postCertification", "post1")));
  });
});
