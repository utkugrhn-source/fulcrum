// GET /api/confirm?token=<token>
// Marks the matching subscriber as confirmed and redirects to the site
// with a small thank-you state.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminClient } from "./_lib/supabase-admin.js";
import { setCors } from "./_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "GET") { res.status(405).json({ ok: false, error: "method not allowed" }); return; }

  const token = String(req.query.token ?? "").trim();
  if (!token || !/^[0-9a-f]{16,128}$/.test(token)) {
    res.redirect(303, "/?subscribe=invalid");
    return;
  }

  const sb = adminClient();
  const { data, error } = await sb
    .from("email_subscribers")
    .select("id, status")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) {
    res.redirect(303, "/?subscribe=invalid");
    return;
  }

  // Already confirmed -> idempotent success.
  if (data.status === "confirmed") {
    res.redirect(303, "/?subscribe=confirmed");
    return;
  }

  // If they previously unsubscribed and now re-confirm, re-activate.
  const { error: upErr } = await sb
    .from("email_subscribers")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString(), unsubscribed_at: null })
    .eq("id", data.id);
  if (upErr) {
    res.redirect(303, "/?subscribe=error");
    return;
  }

  res.redirect(303, "/?subscribe=confirmed");
}
