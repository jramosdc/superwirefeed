// Seed the local Firebase emulator with a believable little information market:
// seller feeds, posts across every category/format/license, provenance chains,
// purchases → verified-buyer attestations, accuracy + trust, reviews, follows.
//
// SAFETY: this always targets the EMULATOR (the *_EMULATOR_HOST vars below are
// forced), never your real Firebase project.
//
// Usage: start the emulator (`npm run emulators`) in one terminal, then run
// `npm run seed` in another.

process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST ||= "127.0.0.1:9099";

import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const PROJECT_ID = "superwire-7872c";
const PASSWORD = "password123";
const BUYER_WEIGHT = 3;
const TRUSTED_THRESHOLD = 10;

const app = initializeApp({ projectId: PROJECT_ID });
const db = getFirestore(app);
const auth = getAuth(app);

const daysAgo = (n) => Timestamp.fromMillis(Date.now() - n * 86_400_000);

// ---- Sellers ---------------------------------------------------------------
const sellers = [
  {
    uid: "orbital-signals",
    name: "Orbital Signals",
    category: "Space & Frontier",
    about: "First-look detections and instrument feeds from deep-space observatories.",
    rating: { avg: 4.8, count: 9 },
  },
  {
    uid: "quant-desk",
    name: "Quant Desk",
    category: "Markets & Signals",
    about: "Quantitative market signals and probabilistic forecasts.",
    rating: { avg: 4.6, count: 7 },
    // Steady, similar-value output → offers a monthly subscription ($19/mo).
    subscription: 1900,
  },
  {
    uid: "sensor-collective",
    name: "Sensor Collective",
    category: "Datasets & Sensors",
    about: "Crowd-run environmental and urban sensor networks, published openly.",
    rating: { avg: 4.2, count: 4 },
    subscription: 900,
  },
  {
    uid: "osint-ledger",
    name: "OSINT Ledger",
    category: "Intelligence & OSINT",
    about: "Verified open-source intelligence with full provenance trails.",
    rating: { avg: 4.0, count: 3 },
  },
  {
    uid: "model-foundry",
    name: "Prompt Foundry",
    category: "AI & Prompts",
    about: "Battle-tested prompt libraries, eval sets and training corpora.",
    rating: { avg: 0, count: 0 },
  },
  {
    uid: "helix-bio",
    name: "Helix Bio",
    category: "Health & Biotech",
    about: "Clinical and genomic datasets for republication and research.",
    rating: { avg: 3.9, count: 2 },
  },
  {
    uid: "frontline-wire",
    name: "Frontline Wire",
    category: "Culture & Society",
    about: "On-the-ground photojournalism and dispatches from major events.",
    rating: { avg: 4.5, count: 5 },
  },
];

// ---- Posts -----------------------------------------------------------------
// license: CC_BY | CC_BY_ND | SELL_ATTRIBUTION | SELL_EXCLUSIVE
const csv = [
  ["timestamp", "lat", "lon", "value"],
  ["2026-06-01T00:00Z", "37.77", "-122.41", "412"],
  ["2026-06-01T01:00Z", "37.77", "-122.41", "418"],
  ["2026-06-01T02:00Z", "37.77", "-122.41", "421"],
];

const posts = [
  {
    id: "gw-detection",
    owner: "orbital-signals",
    title: "Candidate gravitational-wave event detected off-catalog",
    license: "CC_BY",
    category: "Space & Frontier",
    format: "Article",
    types: ["Article"],
    breaking: true,
    sources: [
      { url: "https://example.org/gw/alert", label: "Observatory alert", kind: "primary" },
    ],
    derivedFrom: [],
    days: 1,
  },
  {
    id: "gw-dataset",
    owner: "orbital-signals",
    title: "Strain dataset for the off-catalog GW candidate",
    license: "SELL_ATTRIBUTION",
    category: "Datasets & Sensors",
    format: "Dataset",
    types: ["Dataset"],
    breaking: false,
    sources: [{ url: "https://example.org/gw/strain", label: "Raw strain", kind: "data" }],
    derivedFrom: ["gw-detection"],
    asset: "gw-strain.csv",
    csvPreview: csv,
    previewText:
      "Calibrated strain time-series around the candidate event. Sample rows below; full dataset (10k+ rows, multi-detector) on purchase.",
    freePreviewRows: 2,
    days: 1,
  },
  {
    id: "gw-forecast",
    owner: "quant-desk",
    title: "Forecast: follow-up confirmation probability within 30 days",
    license: "SELL_EXCLUSIVE",
    category: "Forecasts & Predictions",
    format: "Investigation",
    types: ["Article", "Dataset"],
    breaking: false,
    sources: [{ url: "https://example.org/gw/model", label: "Model card", kind: "reporting" }],
    derivedFrom: ["gw-dataset"],
    days: 0,
  },
  {
    id: "market-microstructure",
    owner: "quant-desk",
    title: "Intraday liquidity anomalies across three exchanges",
    license: "SELL_ATTRIBUTION",
    category: "Markets & Signals",
    format: "Dataset",
    types: ["Dataset"],
    breaking: false,
    sources: [{ url: "https://example.org/mkt/feed", label: "Tick feed", kind: "data" }],
    derivedFrom: [],
    asset: "liquidity.csv",
    csvPreview: csv,
    previewText:
      "Liquidity anomaly windows across three venues. A couple of rows shown free — buy for the full tick-level set.",
    freePreviewRows: 1,
    days: 3,
  },
  {
    id: "air-quality-grid",
    owner: "sensor-collective",
    title: "Hyperlocal air-quality grid, hourly readings",
    license: "CC_BY",
    category: "Climate & Environment",
    format: "Dataset",
    types: ["Dataset"],
    breaking: false,
    sources: [{ url: "https://example.org/aq/nodes", label: "Sensor nodes", kind: "data" }],
    derivedFrom: [],
    asset: "air-quality.csv",
    csvPreview: csv,
    days: 5,
  },
  {
    id: "flood-satellite",
    owner: "sensor-collective",
    title: "Flood extent imagery, delta region",
    license: "SELL_ATTRIBUTION",
    category: "Geospatial & Satellite",
    format: "Photo set",
    types: ["Photo"],
    breaking: false,
    sources: [{ url: "https://example.org/sat/pass", label: "Satellite pass", kind: "primary" }],
    derivedFrom: ["air-quality-grid"],
    asset: "flood-extent.zip",
    days: 4,
  },
  {
    id: "osint-convoy",
    owner: "osint-ledger",
    title: "Verified: logistics convoy movements, geolocated",
    license: "SELL_ATTRIBUTION",
    category: "Intelligence & OSINT",
    format: "Investigation",
    types: ["Article", "Photo"],
    breaking: false,
    sources: [
      { url: "https://example.org/osint/clip", label: "Source clip", kind: "primary" },
      { url: "https://example.org/osint/geo", label: "Geolocation", kind: "reporting" },
    ],
    derivedFrom: [],
    asset: "convoy-brief.pdf",
    previewText:
      "Geolocated convoy movements over 72 hours, cross-checked against three independent sources. Full brief (PDF, maps + timestamps) on purchase.",
    days: 2,
  },
  {
    id: "llm-eval-set",
    owner: "model-foundry",
    title: "Production prompt library: reasoning + extraction",
    license: "SELL_EXCLUSIVE",
    category: "AI & Prompts",
    format: "Dataset",
    types: ["Dataset"],
    breaking: false,
    sources: [{ url: "https://example.org/ai/rubric", label: "Eval rubric", kind: "reporting" }],
    derivedFrom: [],
    asset: "prompt-library.csv",
    csvPreview: [
      ["name", "task", "prompt", "avg_score"],
      ["chain-extract", "extraction", "Extract every entity as JSON with…", "0.94"],
      ["stepwise-reason", "reasoning", "Think step by step, then answer…", "0.91"],
      ["rubric-grade", "evaluation", "Grade the answer 1-5 against…", "0.89"],
    ],
    previewText:
      "120 production prompts with eval scores across reasoning, extraction and grading tasks. A few shown free — full library (CSV + rubrics) on purchase.",
    freePreviewRows: 2,
    days: 6,
  },
  {
    id: "genomic-cohort",
    owner: "helix-bio",
    title: "De-identified genomic cohort summary statistics",
    license: "CC_BY_ND",
    category: "Health & Biotech",
    format: "Document",
    types: ["Document"],
    breaking: false,
    sources: [{ url: "https://example.org/bio/cohort", label: "Cohort", kind: "data" }],
    derivedFrom: [],
    asset: "cohort-stats.pdf",
    days: 7,
  },
  {
    id: "interview-audio",
    owner: "osint-ledger",
    title: "On-the-ground interview, translated transcript + audio",
    license: "SELL_ATTRIBUTION",
    category: "Culture & Society",
    format: "Audio",
    types: ["Audio", "Document"],
    breaking: false,
    sources: [{ url: "https://example.org/field/audio", label: "Field audio", kind: "primary" }],
    derivedFrom: [],
    asset: "interview.mp3",
    days: 8,
  },

  // --- Breaking-news events ---
  {
    id: "wc-usa-paraguay",
    owner: "frontline-wire",
    title: "USA 2–1 Paraguay: on-field photos from the World Cup",
    license: "SELL_ATTRIBUTION",
    category: "Culture & Society",
    format: "Photo set",
    types: ["Photo"],
    breaking: true,
    sources: [
      { url: "https://example.org/wc/pool", label: "Match pool", kind: "primary" },
    ],
    derivedFrom: [],
    asset: "usa-paraguay-photos.zip",
    previewText:
      "12 high-res, editorially-cleared match photos (goals, celebrations, crowd). Full set licensed for republication on purchase.",
    days: 0,
  },
  {
    id: "quake-images",
    owner: "frontline-wire",
    title: "Breaking: 6.8 earthquake — first images from the epicenter",
    license: "CC_BY",
    category: "Climate & Environment",
    format: "Photo set",
    types: ["Photo"],
    breaking: true,
    sources: [
      { url: "https://example.org/quake/feed", label: "Field dispatch", kind: "primary" },
    ],
    derivedFrom: [],
    asset: "quake-first-images.zip",
    days: 0,
  },
  {
    id: "rate-decision",
    owner: "quant-desk",
    title: "Breaking: central bank announces emergency 50bp cut",
    license: "CC_BY",
    category: "Markets & Signals",
    format: "Article",
    types: ["Article"],
    breaking: true,
    sources: [
      { url: "https://example.org/cb/statement", label: "Official statement", kind: "primary" },
    ],
    derivedFrom: [],
    days: 0,
  },
];

// ---- Attestations (drive accuracy + trust) ---------------------------------
// [postId, attesterUid, verdict, verifiedBuyer]
const attestations = [
  ["gw-detection", "quant-desk", "corroborate", true],
  ["gw-detection", "sensor-collective", "corroborate", true],
  ["gw-detection", "osint-ledger", "corroborate", true],
  ["gw-detection", "helix-bio", "corroborate", true],
  ["gw-dataset", "quant-desk", "corroborate", true],
  ["market-microstructure", "orbital-signals", "corroborate", true],
  ["market-microstructure", "sensor-collective", "corroborate", true],
  ["market-microstructure", "osint-ledger", "corroborate", true],
  ["market-microstructure", "helix-bio", "corroborate", true],
  ["osint-convoy", "orbital-signals", "corroborate", true],
  ["osint-convoy", "quant-desk", "dispute", false],
  ["llm-eval-set", "quant-desk", "dispute", true],
  ["air-quality-grid", "helix-bio", "corroborate", false],
];

// Buyers we must mark as having purchased (verified-buyer attestations + gated).
const purchases = attestations
  .filter(([, , , vb]) => vb)
  .map(([postId, uid]) => [uid, postId]);

const reviews = [
  ["orbital-signals", "quant-desk", 5, "Fast, well-sourced, reproducible."],
  ["orbital-signals", "osint-ledger", 5, "Provenance trail is exemplary."],
  ["quant-desk", "sensor-collective", 4, "Signals held up out of sample."],
  ["sensor-collective", "helix-bio", 4, "Clean data, clear licensing."],
];

const follows = [
  ["quant-desk", "orbital-signals"],
  ["sensor-collective", "orbital-signals"],
  ["osint-ledger", "orbital-signals"],
  ["helix-bio", "quant-desk"],
];

// Human certifications by trusted third parties. [certifierUid, postId, kind]
// (certifiers must be trusted, score >= 10, and never the post owner).
const certifications = [
  ["quant-desk", "gw-detection", "authored"],
  ["quant-desk", "gw-dataset", "curated"],
  ["orbital-signals", "market-microstructure", "curated"],
  ["quant-desk", "wc-usa-paraguay", "authored"],
  ["orbital-signals", "rate-decision", "authored"],
];

// Requests / bounties (demand side).
const requests = [
  {
    id: "req-icu",
    requester: "helix-bio",
    title: "Anonymized ICU vitals time-series",
    description:
      "Looking for de-identified ICU vital-sign streams (HR, SpO2, BP) at 1-minute resolution for a research cohort. Clear licensing required.",
    category: "Health & Biotech",
    format: "Dataset",
    bounty: 150,
    status: "open",
    days: 2,
  },
  {
    id: "req-smoke",
    requester: "sensor-collective",
    title: "Wildfire smoke plume imagery, US West Coast",
    description: "Recent satellite/aerial imagery of smoke plumes, geolocated.",
    category: "Geospatial & Satellite",
    format: "Photo set",
    bounty: 80,
    status: "open",
    days: 1,
  },
  {
    id: "req-tick",
    requester: "osint-ledger",
    title: "Cross-venue tick data, 2026",
    description: "Tick-level trades across at least three exchanges for 2026.",
    category: "Markets & Signals",
    format: "Dataset",
    bounty: 120,
    status: "fulfilled",
    fulfilledByPostId: "market-microstructure",
    fulfilledByUid: "quant-desk",
    days: 5,
  },
];

const requestResponses = [
  {
    id: "resp-tick",
    requestId: "req-tick",
    responder: "quant-desk",
    postId: "market-microstructure",
    postTitle: "Intraday liquidity anomalies across three exchanges",
    note: "Covers all three venues at tick level.",
  },
];

async function run() {
  console.log(`Seeding emulator (project ${PROJECT_ID})…`);

  // Auth users + user/feed docs.
  for (const s of sellers) {
    try {
      await auth.createUser({
        uid: s.uid,
        email: `${s.uid}@superwire.test`,
        password: PASSWORD,
        displayName: s.name,
        emailVerified: true,
      });
    } catch (e) {
      if (e.code !== "auth/uid-already-exists") throw e;
    }
    await db.collection("users").doc(s.uid).set({
      uid: s.uid,
      email: `${s.uid}@superwire.test`,
      displayName: s.name,
      profileImageURL: "",
      backgroundImageURL: "",
      useBackgroundImage: false,
      interests: [s.category],
      about: s.about,
      onboarded: true,
      createdAt: daysAgo(20),
    });
    await db.collection("feeds").doc(s.uid).set({
      ownerUid: s.uid,
      name: s.name,
      category: s.category,
      about: s.about,
      likes: Math.floor(Math.random() * 40),
      postCategories: [s.category],
      coverImageURL: "",
      ratingAvg: s.rating.avg,
      ratingCount: s.rating.count,
      subscriptionEnabled: !!s.subscription,
      subscriptionPriceCents: s.subscription ?? 0,
      updatedAt: daysAgo(0),
    });
  }

  // Posts.
  for (const p of posts) {
    await db.collection("posts").doc(p.id).set({
      ownerUid: p.owner,
      feedId: p.owner,
      title: p.title,
      detailHtml: `<p>${p.title}. Published to the SuperWire information market with full provenance.</p>`,
      license: p.license,
      category: p.category,
      format: p.format,
      types: p.types,
      breaking: !!p.breaking,
      coverImage: "",
      mainUrl: p.sources?.[0]?.url ?? "",
      embed: null,
      imageURLs: [],
      assetPath: p.asset ? `assets/${p.owner}/${p.id}/${p.asset}` : null,
      assetName: p.asset ?? null,
      csvPreview: p.csvPreview ? JSON.stringify(p.csvPreview) : null,
      previewText: p.previewText ?? "",
      freePreviewRows: p.freePreviewRows ?? 0,
      sources: p.sources ?? [],
      derivedFrom: p.derivedFrom ?? [],
      createdAt: daysAgo(p.days),
      updatedAt: daysAgo(p.days),
    });
  }

  // Purchases (so verified-buyer attestations are legitimate).
  for (const [uid, postId] of purchases) {
    await db.collection("purchases").doc(`${uid}_${postId}`).set({
      uid,
      postId,
      amount: 3500,
      stripeSessionId: "seed",
      createdAt: daysAgo(1),
    });
  }

  // Usage stats (drives "Most used" / Trending). Purchases/downloads derive from
  // the seeded purchases; views are varied to create a believable ranking.
  const viewsByPost = {
    "gw-detection": 240,
    "market-microstructure": 180,
    "air-quality-grid": 130,
    "gw-dataset": 95,
    "osint-convoy": 70,
    "gw-forecast": 60,
    "llm-eval-set": 55,
    "flood-satellite": 40,
    "genomic-cohort": 30,
    "interview-audio": 25,
    "wc-usa-paraguay": 320,
    "quake-images": 280,
    "rate-decision": 150,
  };
  const purchasesByPost = {};
  for (const [, postId] of purchases) {
    purchasesByPost[postId] = (purchasesByPost[postId] ?? 0) + 1;
  }
  for (const p of posts) {
    const pur = purchasesByPost[p.id] ?? 0;
    await db.collection("postStats").doc(p.id).set({
      views: viewsByPost[p.id] ?? 10,
      purchases: pur,
      downloads: pur,
      updatedAt: daysAgo(0),
    });
  }

  // Attestations + derived accuracy aggregates + seller trust.
  const acc = {}; // postId -> {corr, disp, corrW, dispW}
  const trust = {}; // sellerUid -> score
  const ownerOf = Object.fromEntries(posts.map((p) => [p.id, p.owner]));

  for (const [postId, attesterUid, verdict, verifiedBuyer] of attestations) {
    const weight = verifiedBuyer ? BUYER_WEIGHT : 1;
    await db.collection("attestations").doc(`${attesterUid}_${postId}`).set({
      attesterUid,
      attesterName: sellers.find((s) => s.uid === attesterUid)?.name ?? "Anon",
      postId,
      sellerUid: ownerOf[postId],
      verdict,
      evidenceUrl: "",
      weight,
      verifiedBuyer,
      createdAt: daysAgo(0),
    });
    const a = (acc[postId] ??= { corr: 0, disp: 0, corrW: 0, dispW: 0 });
    if (verdict === "corroborate") {
      a.corr += 1;
      a.corrW += weight;
      if (verifiedBuyer) trust[ownerOf[postId]] = (trust[ownerOf[postId]] ?? 0) + weight;
    } else {
      a.disp += 1;
      a.dispW += weight;
    }
  }

  for (const [postId, a] of Object.entries(acc)) {
    const total = a.corrW + a.dispW;
    await db.collection("postAccuracy").doc(postId).set({
      corroborations: a.corr,
      disputes: a.disp,
      corrWeight: a.corrW,
      dispWeight: a.dispW,
      score: total > 0 ? Math.round((a.corrW / total) * 100) / 100 : 0,
      updatedAt: daysAgo(0),
    });
  }

  for (const [uid, score] of Object.entries(trust)) {
    await db.collection("trust").doc(uid).set({ score, updatedAt: daysAgo(0) });
  }

  // Reviews.
  for (const [sellerUid, authorUid, rating, text] of reviews) {
    await db.collection("reviews").doc(`${authorUid}_${sellerUid}`).set({
      sellerUid,
      authorUid,
      authorName: sellers.find((s) => s.uid === authorUid)?.name ?? "Anon",
      rating,
      text,
      createdAt: daysAgo(2),
    });
  }

  // Follows (subcollections, matching lib/db/follows).
  for (const [me, target] of follows) {
    await db.doc(`users/${me}/following/${target}`).set({ uid: target, createdAt: daysAgo(3) });
    await db.doc(`users/${target}/followers/${me}`).set({ uid: me, createdAt: daysAgo(3) });
  }

  // Human certifications + per-post summary.
  const certSummary = {}; // postId -> { authored, curated }
  for (const [certifierUid, postId, kind] of certifications) {
    await db.collection("certifications").doc(`${certifierUid}_${postId}`).set({
      postId,
      ownerUid: ownerOf[postId],
      certifierUid,
      certifierName: sellers.find((s) => s.uid === certifierUid)?.name ?? "Anon",
      kind,
      note: "",
      createdAt: daysAgo(0),
    });
    const s = (certSummary[postId] ??= { authored: 0, curated: 0 });
    if (kind === "authored") s.authored += 1;
    else s.curated += 1;
  }
  for (const [postId, s] of Object.entries(certSummary)) {
    await db.collection("postCertification").doc(postId).set(
      {
        authoredCount: s.authored,
        curatedCount: s.curated,
        aiFlagged: false,
        aiFlagReason: "",
        aiFlaggedBy: "",
        updatedAt: daysAgo(0),
      },
      { merge: true },
    );
  }

  // Requests / bounties + responses.
  for (const r of requests) {
    await db.collection("requests").doc(r.id).set({
      requesterUid: r.requester,
      requesterName: sellers.find((s) => s.uid === r.requester)?.name ?? "Anon",
      title: r.title,
      description: r.description,
      category: r.category,
      format: r.format,
      bountyUsd: r.bounty,
      status: r.status,
      fulfilledByPostId: r.fulfilledByPostId ?? "",
      fulfilledByUid: r.fulfilledByUid ?? "",
      createdAt: daysAgo(r.days ?? 2),
      updatedAt: daysAgo(0),
    });
  }
  for (const r of requestResponses) {
    await db.collection("requestResponses").doc(r.id).set({
      requestId: r.requestId,
      responderUid: r.responder,
      responderName: sellers.find((s) => s.uid === r.responder)?.name ?? "Anon",
      postId: r.postId,
      postTitle: r.postTitle,
      note: r.note,
      createdAt: daysAgo(1),
    });
  }

  const trusted = Object.entries(trust)
    .filter(([, s]) => s >= TRUSTED_THRESHOLD)
    .map(([u]) => u);

  console.log(`✓ Seeded ${sellers.length} sellers, ${posts.length} posts, ${attestations.length} attestations, ${certifications.length} certifications, ${requests.length} requests.`);
  console.log(`✓ Trusted sources (score ≥ ${TRUSTED_THRESHOLD}): ${trusted.join(", ") || "none"}`);
  console.log(`✓ Log in as e.g. orbital-signals@superwire.test / ${PASSWORD}`);
}

run().then(
  () => process.exit(0),
  (e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  },
);
