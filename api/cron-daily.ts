// GET /api/cron-daily — entry point for Vercel Cron (vercel.json).
// Pulls the last 2 days of new ortho papers and scores them.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { runPipeline } from "./_lib/pipeline.js";
import { requireCronSecret, setCors } from "./_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (!requireCronSecret(req, res)) return;
  try {
    const result = await runPipeline({ reldays: 2, retmax: 300, trigger: "cron" });
    res.status(200).json({ ok: true, ...result });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
}
