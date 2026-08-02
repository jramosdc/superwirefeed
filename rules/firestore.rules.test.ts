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

describe("subscriptions", () => {
  it("blocks a client from forging a subscription doc", async () => {
    const buyer = testEnv.authenticatedContext("buyer").firestore();
    await assertFails(
      setDoc(doc(buyer, "subscriptions", "buyer_creator1"), {
        subscriberUid: "buyer",
        creatorUid: "creator1",
        status: "active",
      }),
    );
  });

  it("lets a user read only their own subscription", async () => {
    // Seed a subscription with admin (rules bypassed).
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "subscriptions", "buyer_creator1"), {
        subscriberUid: "buyer",
        creatorUid: "creator1",
        status: "active",
        priceCents: 1900,
      });
    });

    const buyer = testEnv.authenticatedContext("buyer").firestore();
    const stranger = testEnv.authenticatedContext("stranger").firestore();

    await assertSucceeds(getDoc(doc(buyer, "subscriptions", "buyer_creator1")));
    await assertFails(getDoc(doc(stranger, "subscriptions", "buyer_creator1")));
  });

  it("lets a signed-in user read a non-existent subscription (the 'am I subscribed?' check)", async () => {
    const buyer = testEnv.authenticatedContext("buyer").firestore();
    await assertSucceeds(getDoc(doc(buyer, "subscriptions", "buyer_never-subbed")));
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

describe("requests / bounties", () => {
  it("blocks creating a request as someone else", async () => {
    const mallory = testEnv.authenticatedContext("mallory").firestore();
    await assertFails(
      setDoc(doc(mallory, "requests", "r1"), {
        requesterUid: "victim",
        title: "spoofed",
        status: "open",
      }),
    );
  });

  it("allows creating your own request and lets anyone read it", async () => {
    const buyer = testEnv.authenticatedContext("buyer").firestore();
    await assertSucceeds(
      setDoc(doc(buyer, "requests", "r2"), {
        requesterUid: "buyer",
        title: "Need flood data",
        status: "open",
      }),
    );
    const stranger = testEnv.authenticatedContext("stranger").firestore();
    await assertSucceeds(getDoc(doc(stranger, "requests", "r2")));
  });

  it("blocks a non-requester from editing a request", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "requests", "r3"), {
        requesterUid: "buyer",
        title: "x",
        status: "open",
      });
    });
    const other = testEnv.authenticatedContext("other").firestore();
    await assertFails(setDoc(doc(other, "requests", "r3"), { status: "fulfilled" }));
  });

  it("lets a responder create their own response", async () => {
    const seller = testEnv.authenticatedContext("seller").firestore();
    await assertSucceeds(
      setDoc(doc(seller, "requestResponses", "resp1"), {
        requestId: "r2",
        responderUid: "seller",
        postId: "p1",
      }),
    );
  });
});

describe("postSecrets (seller-private deliverable links)", () => {
  it("lets the post owner create and read their secret", async () => {
    const author = testEnv.authenticatedContext("author").firestore();
    await setDoc(doc(author, "posts", "p10"), {
      ownerUid: "author",
      feedId: "author",
      title: "gated",
    });
    await assertSucceeds(
      setDoc(doc(author, "postSecrets", "p10"), {
        ownerUid: "author",
        deliverableUrl: "https://wetransfer.com/x",
      }),
    );
    await assertSucceeds(getDoc(doc(author, "postSecrets", "p10")));
  });

  it("blocks squatting a secret onto someone else's post", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "posts", "p11"), {
        ownerUid: "victim",
        feedId: "victim",
        title: "victim's post",
      });
    });
    const mallory = testEnv.authenticatedContext("mallory").firestore();
    // Even claiming their own uid on the secret, the POST isn't theirs.
    await assertFails(
      setDoc(doc(mallory, "postSecrets", "p11"), {
        ownerUid: "mallory",
        deliverableUrl: "https://evil.example",
      }),
    );
  });

  it("blocks anyone but the owner from reading the deliverable URL", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "postSecrets", "p12"), {
        ownerUid: "author",
        deliverableUrl: "https://wetransfer.com/secret",
      });
    });
    const stranger = testEnv.authenticatedContext("stranger").firestore();
    await assertFails(getDoc(doc(stranger, "postSecrets", "p12")));
    // A BUYER also can't read it directly — only the gated route serves it.
    const buyer = testEnv.authenticatedContext("buyer").firestore();
    await assertFails(getDoc(doc(buyer, "postSecrets", "p12")));
  });
});

describe("shares (create-only growth events)", () => {
  it("lets a user record their own share", async () => {
    const sharer = testEnv.authenticatedContext("sharer").firestore();
    await assertSucceeds(
      setDoc(doc(sharer, "shares", "s1"), {
        sharerUid: "sharer",
        requestId: "r1",
        platform: "web",
      }),
    );
  });

  it("blocks recording a share as someone else", async () => {
    const mallory = testEnv.authenticatedContext("mallory").firestore();
    await assertFails(
      setDoc(doc(mallory, "shares", "s2"), {
        sharerUid: "victim",
        requestId: "r1",
        platform: "web",
      }),
    );
  });

  it("blocks reading and editing share events", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "shares", "s3"), {
        sharerUid: "sharer",
        requestId: "r1",
        platform: "ios",
      });
    });
    const sharer = testEnv.authenticatedContext("sharer").firestore();
    await assertFails(getDoc(doc(sharer, "shares", "s3")));
    await assertFails(
      setDoc(doc(sharer, "shares", "s3"), {
        sharerUid: "sharer",
        requestId: "OTHER",
        platform: "web",
      }),
    );
  });
});

describe("waiver credits (server-granted, read-own)", () => {
  it("lets a user read their own credit but not someone else's", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "waiverCredits", "c1"), {
        uid: "earner",
        source: "created-and-shared",
        requestId: "r1",
        consumedByTransactionId: null,
      });
    });
    const earner = testEnv.authenticatedContext("earner").firestore();
    const stranger = testEnv.authenticatedContext("stranger").firestore();
    await assertSucceeds(getDoc(doc(earner, "waiverCredits", "c1")));
    await assertFails(getDoc(doc(stranger, "waiverCredits", "c1")));
  });

  it("blocks a client from minting a credit", async () => {
    const mallory = testEnv.authenticatedContext("mallory").firestore();
    await assertFails(
      setDoc(doc(mallory, "waiverCredits", "forged"), {
        uid: "mallory",
        source: "share-converted",
        consumedByTransactionId: null,
      }),
    );
  });
});

describe("transactions & payouts (webhook/admin-written ledger)", () => {
  it("lets a seller read their own transaction but not someone else's", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "transactions", "sess_1"), {
        sellerUid: "seller",
        buyerUid: "buyer",
        grossCents: 3500,
        netCents: 3325,
      });
    });
    const seller = testEnv.authenticatedContext("seller").firestore();
    const stranger = testEnv.authenticatedContext("stranger").firestore();
    await assertSucceeds(getDoc(doc(seller, "transactions", "sess_1")));
    await assertFails(getDoc(doc(stranger, "transactions", "sess_1")));
  });

  it("blocks a client from writing to the ledger", async () => {
    const mallory = testEnv.authenticatedContext("mallory").firestore();
    await assertFails(
      setDoc(doc(mallory, "transactions", "forged"), {
        sellerUid: "mallory",
        netCents: 999999,
      }),
    );
  });

  it("payouts: read-own only, no client writes", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "payouts", "p1"), {
        uid: "seller",
        amountCents: 2500,
      });
    });
    const seller = testEnv.authenticatedContext("seller").firestore();
    const stranger = testEnv.authenticatedContext("stranger").firestore();
    await assertSucceeds(getDoc(doc(seller, "payouts", "p1")));
    await assertFails(getDoc(doc(stranger, "payouts", "p1")));
    await assertFails(
      setDoc(doc(seller, "payouts", "p2"), { uid: "seller", amountCents: 1 }),
    );
  });
});

describe("fcmTokens & postNotifications (push)", () => {
  it("lets a user register and read their own device token", async () => {
    const u = testEnv.authenticatedContext("alice").firestore();
    await assertSucceeds(
      setDoc(doc(u, "fcmTokens", "tok-1"), { uid: "alice", platform: "ios" }),
    );
    await assertSucceeds(getDoc(doc(u, "fcmTokens", "tok-1")));
  });

  it("blocks registering a token for someone else or reading theirs", async () => {
    const mallory = testEnv.authenticatedContext("mallory").firestore();
    await assertFails(
      setDoc(doc(mallory, "fcmTokens", "tok-2"), { uid: "victim", platform: "ios" }),
    );
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "fcmTokens", "tok-3"), {
        uid: "victim",
        platform: "ios",
      });
    });
    await assertFails(getDoc(doc(mallory, "fcmTokens", "tok-3")));
  });

  it("postNotifications: owner reads own marker, nobody writes", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "postNotifications", "p1"), {
        ownerUid: "author",
        sentCount: 3,
      });
    });
    const author = testEnv.authenticatedContext("author").firestore();
    const stranger = testEnv.authenticatedContext("stranger").firestore();
    await assertSucceeds(getDoc(doc(author, "postNotifications", "p1")));
    await assertFails(getDoc(doc(stranger, "postNotifications", "p1")));
    await assertFails(
      setDoc(doc(author, "postNotifications", "p2"), { ownerUid: "author" }),
    );
  });
});

describe("post stats (server-only)", () => {
  it("blocks a client from inflating usage counters", async () => {
    const u = testEnv.authenticatedContext("alice").firestore();
    await assertFails(
      setDoc(doc(u, "postStats", "post1"), { views: 99999, purchases: 100 }),
    );
  });

  it("allows anyone to read usage counters", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "postStats", "post1"), {
        views: 10,
        purchases: 2,
        downloads: 1,
      });
    });
    const stranger = testEnv.authenticatedContext("stranger").firestore();
    await assertSucceeds(getDoc(doc(stranger, "postStats", "post1")));
  });
});
