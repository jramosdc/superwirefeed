"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth";
import { getUser } from "@/lib/db/users";
import { getPostAccuracy } from "@/lib/db/accuracy";
import {
  getMyAttestation,
  listAttestationsForPost,
  submitAttestation,
} from "@/lib/db/attestations";
import type {
  AttestationDoc,
  AttestationVerdict,
  PostAccuracyDoc,
  PostDoc,
} from "@/types";

// Gatekeeper-less accuracy: members corroborate or dispute a post, weighted by
// whether they actually bought it. The full ledger is public — the "editorial
// process" is the visible record itself.
export function AccuracyPanel({ post }: { post: PostDoc }) {
  const { user } = useAuth();
  const [accuracy, setAccuracy] = useState<PostAccuracyDoc | null>(null);
  const [attestations, setAttestations] = useState<AttestationDoc[]>([]);
  const [mine, setMine] = useState<AttestationDoc | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [busy, setBusy] = useState<AttestationVerdict | "">("");
  const [error, setError] = useState("");

  const isOwner = user?.uid === post.ownerUid;

  const reload = useCallback(() => {
    getPostAccuracy(post.id).then(setAccuracy);
    listAttestationsForPost(post.id).then(setAttestations);
    if (user && !isOwner) getMyAttestation(user.uid, post.id).then(setMine);
  }, [post.id, user, isOwner]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function attest(verdict: AttestationVerdict) {
    if (!user) return;
    setBusy(verdict);
    setError("");
    try {
      const profile = await getUser(user.uid);
      await submitAttestation({
        postId: post.id,
        verdict,
        evidenceUrl: evidenceUrl.trim() || undefined,
        // Sent for display only; the server trusts the token for the uid.
        attesterName: profile?.displayName ?? user.email ?? "Anon",
      });
      setEvidenceUrl("");
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setBusy("");
    }
  }

  const score = accuracy ? Math.round(accuracy.score * 100) : 0;
  const corr = accuracy?.corroborations ?? 0;
  const disp = accuracy?.disputes ?? 0;
  const hasData = corr + disp > 0;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Accuracy</h2>
        {hasData && (
          <span className="text-sm font-medium text-slate-600">
            {score}% corroborated · {corr} ✓ / {disp} ✕
          </span>
        )}
      </div>

      {hasData ? (
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-red-200">
          <div className="h-full bg-emerald-500" style={{ width: `${score}%` }} />
        </div>
      ) : (
        <p className="mb-4 text-sm text-slate-400">
          No accuracy attestations yet.
        </p>
      )}

      {/* Attest control */}
      {!user ? (
        <p className="text-sm text-slate-500">
          <Link href="/login" className="text-blue-700 hover:underline">
            Sign in
          </Link>{" "}
          to corroborate or dispute this post.
        </p>
      ) : isOwner ? (
        <p className="text-sm text-slate-400">
          You can&apos;t attest to your own post.
        </p>
      ) : (
        <div className="space-y-2">
          {mine && (
            <p className="text-xs text-slate-500">
              You marked this{" "}
              <strong>
                {mine.verdict === "corroborate" ? "corroborated" : "disputed"}
              </strong>
              . Submitting again updates your verdict.
            </p>
          )}
          <input
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            placeholder="Evidence link (optional)"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => attest("corroborate")}
              disabled={busy !== ""}
              className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {busy === "corroborate" ? "…" : "Corroborate"}
            </button>
            <button
              onClick={() => attest("dispute")}
              disabled={busy !== ""}
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {busy === "dispute" ? "…" : "Dispute"}
            </button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}

      {/* Transparent ledger */}
      {attestations.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-slate-100 pt-3">
          {attestations.map((a) => (
            <li key={a.id} className="flex items-center gap-2 text-sm">
              <span
                className={
                  a.verdict === "corroborate"
                    ? "text-emerald-600"
                    : "text-red-600"
                }
              >
                {a.verdict === "corroborate" ? "✓" : "✕"}
              </span>
              <span className="font-medium">{a.attesterName}</span>
              {a.verifiedBuyer && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
                  verified buyer
                </span>
              )}
              {a.evidenceUrl && (
                <a
                  href={a.evidenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 hover:underline"
                >
                  evidence
                </a>
              )}
              <span className="ml-auto text-xs text-slate-400">
                {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
