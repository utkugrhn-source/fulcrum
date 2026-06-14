// POST /api/ingest — pull last-N-days of ortho PubMed records,
// classify and score, upsert into Supabase. Idempotent.
//
// Body / query (all optional):
//   reldays  — default 2
//   retmax   — default 200
//   dryRun   — "1" to skip writes
//
// Auth: CRON_SECRET via Bearer header or ?token=

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { runPipeline } from "./_lib/pipeline.js";
import { requireCronSecret, setCors } from "./_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST" && req.method !== "GET") {
    res.status(405).json({ ok: false, error: "method not allowed" });
    return;
  }
  if (!requireCronSecret(req, res)) return;

  const reldays = numParam(req.query.reldays, 2);
  const retmax = numParam(req.query.retmax, 200);
  const dryRun = String(req.query.dryRun ?? "") === "1";

  try {
    const result = await runPipeline({
      reldays,
      retmax,
      dryRun,
      trigger: "manual",
    });
    res.status(200).json({ ok: true, ...result });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
}

function numParam(v: unknown, def: number): number {
  if (typeof v !== "string") return def;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
}
