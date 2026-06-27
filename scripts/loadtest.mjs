// Stress-test a REAL Firestore database (no emulator) via the Admin SDK.
//
// ⚠️  SAFETY — read before running:
//   • This writes/reads real documents and COSTS REAL MONEY and quota.
//   • Run it ONLY against a dedicated throwaway project (e.g. superwire-loadtest),
//     never production. The guards below refuse to run against known prod ids and
//     against any project whose id doesn't look like a test project (override with
//     --force only if you are certain).
//   • Every doc this creates carries a `loadtest: true` marker and an `lt_`-prefixed
//     id, so `--cleanup` can delete exactly what the test produced.
//
// Credentials: point GOOGLE_APPLICATION_CREDENTIALS at the test project's
// service-account key, and set the project id via --project or LOADTEST_PROJECT_ID.
//
// Examples:
//   GOOGLE_APPLICATION_CREDENTIALS=./loadtest-key.json \
//   node scripts/loadtest.mjs --project=superwire-loadtest --scenario=mixed \
//        --workers=50 --rate=200 --duration=60
//
//   node scripts/loadtest.mjs --project=superwire-loadtest --scenario=hot-counter \
//        --workers=20 --rate=50 --duration=30
//
//   node scripts/loadtest.mjs --project=superwire-loadtest --ramp        # 500/50/5
//   node scripts/loadtest.mjs --project=superwire-loadtest --cleanup

import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { performance } from "node:perf_hooks";

// --------------------------------------------------------------------------- //
// CLI args                                                                     //
// --------------------------------------------------------------------------- //
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : [a, true];
  }),
);

const SCENARIO = String(args.scenario ?? "mixed");
const WORKERS = Number(args.workers ?? 25); // concurrent in-flight operations
const DURATION = Number(args.duration ?? 30); // seconds (ignored if --ops given)
const OPS = args.ops ? Number(args.ops) : null; // total op budget (overrides duration)
const RAMP = !!args.ramp; // follow Firestore's 500/50/5 ramp
const BASE_RATE = Number(args.rate ?? (RAMP ? 500 : 200)); // ops/sec
const MAX_RATE = args["max-rate"] ? Number(args["max-rate"]) : Infinity;
const CLEANUP = !!args.cleanup;
const FORCE = !!args.force;

const PROJECT_ID =
  (typeof args.project === "string" && args.project) ||
  process.env.LOADTEST_PROJECT_ID ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.FIREBASE_PROJECT_ID ||
  "";

// --------------------------------------------------------------------------- //
// Safety guards                                                               //
// --------------------------------------------------------------------------- //
// Known non-test projects this script must never touch without --force.
const BLOCKLIST = new Set(["superwire-7872c"]);

function die(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

if (!PROJECT_ID) {
  die("No project id. Pass --project=<id> or set LOADTEST_PROJECT_ID.");
}
if (process.env.FIRESTORE_EMULATOR_HOST && !args["allow-emulator"]) {
  die(
    `FIRESTORE_EMULATOR_HOST is set (${process.env.FIRESTORE_EMULATOR_HOST}). ` +
      "This tool is for the REAL database — unset it (or pass --allow-emulator).",
  );
}
if (BLOCKLIST.has(PROJECT_ID) && !FORCE) {
  die(`Refusing to run against "${PROJECT_ID}" (looks like a real project). Use --force to override.`);
}
if (!/(loadtest|stress|staging|test)/i.test(PROJECT_ID) && !FORCE) {
  die(
    `"${PROJECT_ID}" doesn't look like a test project. Use a dedicated ` +
      "throwaway project, or pass --force if you are certain.",
  );
}

const app = initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
const db = getFirestore(app);

// Stable ids so reads / hot-doc contention target the same docs every run.
const FEED_ID = "lt_feed";
const HOT_POST_ID = "lt_hotpost"; // single-doc write contention target
const TX_FEED_ID = "lt_txfeed"; // transaction contention target
const READ_POOL = Array.from({ length: 50 }, (_, i) => `lt_readpost_${i}`);
const MARKER = { loadtest: true };

// --------------------------------------------------------------------------- //
// Cleanup mode                                                                //
// --------------------------------------------------------------------------- //
async function cleanup() {
  const collections = ["posts", "feeds", "purchases", "subscriptions", "postStats"];
  let total = 0;
  for (const name of collections) {
    // Single-field equality query — served by Firestore's automatic indexes.
    const snap = await db.collection(name).where("loadtest", "==", true).get();
    for (let i = 0; i < snap.docs.length; i += 450) {
      const batch = db.batch();
      for (const d of snap.docs.slice(i, i + 450)) batch.delete(d.ref);
      await batch.commit();
    }
    total += snap.size;
    console.log(`  ${name}: deleted ${snap.size}`);
  }
  console.log(`\n✓ Cleanup complete — removed ${total} load-test docs.`);
}

// --------------------------------------------------------------------------- //
// Setup — ensure read/contention targets exist                               //
// --------------------------------------------------------------------------- //
async function setup() {
  const batch = db.batch();
  batch.set(db.collection("feeds").doc(FEED_ID), {
    ...MARKER,
    ownerUid: FEED_ID,
    name: "Load Test Wire",
    ratingAvg: 0,
    ratingCount: 0,
    subscriptionEnabled: true,
    subscriptionPriceCents: 900,
    updatedAt: FieldValue.serverTimestamp(),
  });
  batch.set(db.collection("feeds").doc(TX_FEED_ID), {
    ...MARKER,
    ownerUid: TX_FEED_ID,
    ratingAvg: 0,
    ratingCount: 0,
    ratingSum: 0,
    updatedAt: FieldValue.serverTimestamp(),
  });
  batch.set(db.collection("postStats").doc(HOT_POST_ID), {
    ...MARKER,
    views: 0,
    purchases: 0,
    downloads: 0,
    updatedAt: FieldValue.serverTimestamp(),
  });
  for (const id of READ_POOL) {
    batch.set(db.collection("posts").doc(id), {
      ...MARKER,
      ownerUid: FEED_ID,
      feedId: FEED_ID,
      title: `Read pool ${id}`,
      license: "CC_BY",
      category: "Markets & Signals",
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
}

// --------------------------------------------------------------------------- //
// Operations — each returns a promise and is timed by the runner             //
// --------------------------------------------------------------------------- //
let seq = 0;
const ops = {
  // Spread writes across many new docs — raw write throughput + index load.
  async writePost() {
    const id = `lt_post_${process.pid}_${seq++}_${Math.random().toString(36).slice(2, 8)}`;
    await db.collection("posts").doc(id).set({
      ...MARKER,
      ownerUid: FEED_ID,
      feedId: FEED_ID,
      title: `Stress post ${id}`,
      license: "SELL_ATTRIBUTION",
      category: "Markets & Signals",
      format: "Article",
      breaking: false,
      createdAt: FieldValue.serverTimestamp(),
    });
  },

  // Random single-doc read from the pre-seeded pool.
  async readPost() {
    const id = READ_POOL[(Math.random() * READ_POOL.length) | 0];
    await db.collection("posts").doc(id).get();
  },

  // Query a feed's posts (collection query under load).
  async queryFeed() {
    await db.collection("posts").where("feedId", "==", FEED_ID).limit(20).get();
  },

  // Hammer a SINGLE document with increments — exposes Firestore's ~1 write/sec
  // sustained per-document ceiling (your postStats view/purchase counter path).
  async hotCounter() {
    await db.collection("postStats").doc(HOT_POST_ID).set(
      { ...MARKER, views: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
  },

  // Transaction contention on one feed doc — mirrors /api/reviews rating update.
  async ratingTx() {
    const ref = db.collection("feeds").doc(TX_FEED_ID);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const d = snap.data() ?? {};
      const count = (d.ratingCount ?? 0) + 1;
      const sum = (d.ratingSum ?? 0) + (1 + ((Math.random() * 5) | 0));
      tx.update(ref, { ratingCount: count, ratingSum: sum, ratingAvg: sum / count });
    });
  },

  // Purchase write + counter bump — mirrors the Stripe webhook path.
  async purchase() {
    const uid = `lt_buyer_${(Math.random() * 100000) | 0}`;
    const postId = READ_POOL[(Math.random() * READ_POOL.length) | 0];
    await db.collection("purchases").doc(`${uid}_${postId}`).set({
      ...MARKER,
      uid,
      postId,
      amount: 3500,
      createdAt: FieldValue.serverTimestamp(),
    });
  },
};

// Weighted op mix per scenario.
const SCENARIOS = {
  write: [["writePost", 1]],
  read: [["readPost", 0.7], ["queryFeed", 0.3]],
  "hot-counter": [["hotCounter", 1]],
  tx: [["ratingTx", 1]],
  purchase: [["purchase", 1]],
  mixed: [
    ["readPost", 0.45],
    ["queryFeed", 0.15],
    ["writePost", 0.2],
    ["hotCounter", 0.1],
    ["purchase", 0.1],
  ],
};

function buildPicker(weights) {
  const total = weights.reduce((s, [, w]) => s + w, 0);
  return () => {
    let r = Math.random() * total;
    for (const [name, w] of weights) if ((r -= w) <= 0) return name;
    return weights[0][0];
  };
}

// --------------------------------------------------------------------------- //
// Rate limiter — average pacing, with optional 500/50/5 ramp                  //
// --------------------------------------------------------------------------- //
function makeLimiter(startMs) {
  let nextSlot = performance.now();
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  return async () => {
    const elapsedMin = (performance.now() - startMs) / 60000;
    // 500/50/5: grow by 50% every 5 minutes; otherwise hold BASE_RATE.
    const rate = RAMP
      ? Math.min(MAX_RATE, BASE_RATE * Math.pow(1.5, Math.floor(elapsedMin / 5)))
      : BASE_RATE;
    const now = performance.now();
    nextSlot = Math.max(now, nextSlot) + 1000 / rate;
    const wait = nextSlot - now;
    if (wait > 0) await sleep(wait);
  };
}

// --------------------------------------------------------------------------- //
// Metrics                                                                     //
// --------------------------------------------------------------------------- //
const lat = []; // latency samples (ms)
let done = 0;
const errors = new Map();

function pct(sorted, p) {
  if (!sorted.length) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

function summary(startMs) {
  const secs = (performance.now() - startMs) / 1000;
  const sorted = [...lat].sort((a, b) => a - b);
  const errTotal = [...errors.values()].reduce((s, n) => s + n, 0);
  console.log("\n──────── load test summary ────────");
  console.log(`project    ${PROJECT_ID}`);
  console.log(`scenario   ${SCENARIO}   workers ${WORKERS}   ${RAMP ? "ramp 500/50/5" : `rate ${BASE_RATE}/s`}`);
  console.log(`elapsed    ${secs.toFixed(1)}s`);
  console.log(`ops ok     ${done}   (${(done / secs).toFixed(1)}/s)`);
  console.log(`errors     ${errTotal}`);
  for (const [code, n] of errors) console.log(`           ${code}: ${n}`);
  console.log(`latency    p50 ${pct(sorted, 50).toFixed(0)}ms   p95 ${pct(sorted, 95).toFixed(0)}ms   p99 ${pct(sorted, 99).toFixed(0)}ms   max ${(sorted.at(-1) ?? 0).toFixed(0)}ms`);
  console.log("───────────────────────────────────");
}

// --------------------------------------------------------------------------- //
// Runner                                                                      //
// --------------------------------------------------------------------------- //
async function run() {
  const weights = SCENARIOS[SCENARIO];
  if (!weights) die(`Unknown scenario "${SCENARIO}". Options: ${Object.keys(SCENARIOS).join(", ")}`);
  const pick = buildPicker(weights);

  console.log(`Setting up targets in ${PROJECT_ID} …`);
  await setup();

  const startMs = performance.now();
  const deadline = OPS ? Infinity : startMs + DURATION * 1000;
  let budget = OPS ?? Infinity;
  const limiter = makeLimiter(startMs);

  let stop = false;
  process.on("SIGINT", () => {
    stop = true;
    console.log("\nStopping …");
  });

  // Periodic progress.
  const ticker = setInterval(() => {
    const secs = (performance.now() - startMs) / 1000;
    process.stdout.write(`\r  ${done} ops  ${(done / secs).toFixed(0)}/s  p95 ${pct([...lat].sort((a, b) => a - b), 95).toFixed(0)}ms   `);
  }, 1000);

  async function worker() {
    while (!stop && performance.now() < deadline && budget > 0) {
      budget -= 1;
      await limiter();
      const op = ops[pick()];
      const t0 = performance.now();
      try {
        await op();
        lat.push(performance.now() - t0);
        done += 1;
      } catch (e) {
        const code = e?.code || e?.message || "unknown";
        errors.set(code, (errors.get(code) ?? 0) + 1);
      }
    }
  }

  console.log(`Running "${SCENARIO}" for ${OPS ? `${OPS} ops` : `${DURATION}s`} …`);
  await Promise.all(Array.from({ length: WORKERS }, worker));
  clearInterval(ticker);
  summary(startMs);
}

// --------------------------------------------------------------------------- //
if (CLEANUP) {
  console.log(`Cleaning up load-test docs in ${PROJECT_ID} …`);
  await cleanup();
} else {
  await run();
}
process.exit(0);
