"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/auth";
import { getUser } from "@/lib/db/users";
import { getTrust } from "@/lib/db/accuracy";
import {
  getMyCertification,
  getPostCertification,
  listCertificationsForPost,
  moderateAiFlag,
  submitCertification,
} from "@/lib/db/certifications";
import { canCertify, canModerate } from "@/lib/trust";
import { HumanCertifiedBadge } from "./HumanCertifiedBadge";
import type {
  CertificationDoc,
  CertificationKind,
  PostCertificationDoc,
  PostDoc,
} from "@/types";

export function CertificationPanel({ post }: { post: PostDoc }) {
  const { user } = useAuth();
  const [cert, setCert] = useState<PostCertificationDoc | null>(null);
  const [list, setList] = useState<CertificationDoc[]>([]);
  const [mine, setMine] = useState<CertificationDoc | null>(null);
  const [myTrust, setMyTrust] = useState(0);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const isOwner = user?.uid === post.ownerUid;

  const reload = useCallback(() => {
    getPostCertification(post.id).then(setCert);
    listCertificationsForPost(post.id).then(setList);
    if (user && !isOwner) getMyCertification(user.uid, post.id).then(setMine);
  }, [post.id, user, isOwner]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (user) getTrust(user.uid).then((t) => setMyTrust(t?.score ?? 0));
  }, [user]);

  const eligibleCertifier = !!user && !isOwner && canCertify(myTrust);
  const eligibleModerator = !!user && !isOwner && canModerate(myTrust);
  const aiFlagged = !!cert?.aiFlagged;

  async function certify(kind: CertificationKind) {
    if (!user) return;
    setBusy(kind);
    setError("");
    try {
      const profile = await getUser(user.uid);
      await submitCertification({
        postId: post.id,
        kind,
        note: note.trim() || undefined,
        certifierName: profile?.displayName ?? user.email ?? "Anon",
      });
      setNote("");
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to certify");
    } finally {
      setBusy("");
    }
  }

  async function flag(next: boolean) {
    setBusy("flag");
    setError("");
    try {
      await moderateAiFlag({ postId: post.id, aiFlagged: next, reason: reason.trim() });
      setReason("");
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update flag");
    } finally {
      setBusy("");
    }
  }

  // Nothing to show: no certification state and viewer can't act.
  if (!cert && !eligibleCertifier && !eligibleModerator) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Certification</h2>
        <HumanCertifiedBadge cert={cert} />
      </div>

      <p className="text-sm text-slate-600">
        Human Certified means a trusted third party vouches the content is
        human-authored or has reviewed its accuracy.
      </p>
      {aiFlagged && cert?.aiFlagReason && (
        <p className="mt-2 text-sm text-amber-800">⚠ {cert.aiFlagReason}</p>
      )}

      {/* Certifier controls */}
      {eligibleCertifier && (
        <div className="mt-4 space-y-2">
          {mine && (
            <p className="text-xs text-slate-500">
              You certified this as <strong>{mine.kind}</strong>.
            </p>
          )}
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note / rationale (optional)"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => certify("authored")}
              disabled={busy !== "" || aiFlagged}
              title={aiFlagged ? "Blocked: post is flagged as likely AI-generated" : ""}
              className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Certify: human-authored
            </button>
            <button
              onClick={() => certify("verified")}
              disabled={busy !== ""}
              className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Certify: human-verified
            </button>
          </div>
        </div>
      )}

      {/* Moderator control */}
      {eligibleModerator && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Moderator
          </p>
          {aiFlagged ? (
            <button
              onClick={() => flag(false)}
              disabled={busy !== ""}
              className="rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 disabled:opacity-50"
            >
              Clear AI flag
            </button>
          ) : (
            <div className="space-y-2">
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (optional)"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                onClick={() => flag(true)}
                disabled={busy !== ""}
                className="rounded bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
              >
                Flag as likely AI-generated
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {/* Ledger */}
      {list.length > 0 && (
        <ul className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-sm">
          {list.map((c) => (
            <li key={c.id} className="flex items-center gap-2">
              <span className="text-emerald-600">✓</span>
              <span className="font-medium">{c.certifierName}</span>
              <span className="text-slate-500">certified as {c.kind}</span>
              {c.note && <span className="text-slate-400">— {c.note}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
