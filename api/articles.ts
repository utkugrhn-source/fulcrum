// GET /api/articles — public list endpoint. Filters: subspecialty, tier,
// fromDate, q (title/abstract search), limit (max 200).
//
// Note: the frontend can also query Supabase directly via PostgREST,
// but this endpoint gives us a stable contract + cheap caching.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminClient } from "./_lib/supabase-admin.js";
import { setCors } from "./_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "method not allowed" });
    return;
  }

  const sb = adminClient();
  const limit = Math.min(parseInt(String(req.query.limit ?? "60"), 10) || 60, 200);
  const q = (req.query.q as string | undefined)?.trim();
  const sub = req.query.subspecialty as string | string[] | undefined;
  const tier = req.query.tier as string | string[] | undefined;
  const fromDate = req.query.fromDate as string | undefined;

  let query = sb.from("v_articles").select("*").order("score", { ascending: false }).limit(limit);
  if (sub) {
    const arr = Array.isArray(sub) ? sub : sub.split(",");
    query = query.in("subspecialty", arr);
  }
  if (tier) {
    const arr = (Array.isArray(tier) ? tier : tier.split(",")).map((t) => parseInt(t, 10)).filter(Number.isFinite);
    if (arr.length) query = query.in("tier", arr);
  }
  if (fromDate) {
    query = query.gte("pub_date", fromDate);
  }
  if (q) {
    // PostgREST full-text search via tsvector index
    query = query.textSearch("title", q, { type: "websearch", config: "english" });
  }

  const { data, error } = await query;
  if (error) {
    res.status(500).json({ ok: false, error: error.message });
    return;
  }
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
  res.status(200).json({ ok: true, articles: data ?? [] });
}
