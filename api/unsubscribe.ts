// GET /api/unsubscribe?token=<token>  (one-click, also accepts POST per RFC 8058)
// Marks the matching subscriber as unsubscribed. Idempotent.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminClient } from "./_lib/supabase-admin.js";
import { setCors } from "./_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ ok: false, error: "method not allowed" }); return;
  }

  const token = String(req.query.token ?? "").trim();
  if (!token || !/^[0-9a-f]{16,128}$/.test(token)) {
    res.redirect(303, "/?unsubscribe=invalid");
    return;
  }

  const sb = adminClient();
  const { data, error } = await sb
    .from("email_subscribers")
    .select("id, status")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) {
    res.redirect(303, "/?unsubscribe=invalid");
    return;
  }

  if (data.status !== "unsubscribed") {
    await sb
      .from("email_subscribers")
      .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
      .eq("id", data.id);
  }

  res.redirect(303, "/?unsubscribe=done");
}
