// POST /api/subscribe { email, lang? }
// Creates (or refreshes) a pending subscriber and sends a confirmation email.
// Double opt-in — no email lands in the digest queue until the link is clicked.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminClient } from "./_lib/supabase-admin.js";
import { setCors } from "./_lib/auth.js";
import { sendEmail, confirmationEmail, SITE_BASE } from "./_lib/email.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ ok: false, error: "method not allowed" }); return; }

  const body = (typeof req.body === "string" ? safeJson(req.body) : req.body) ?? {};
  const email = String(body.email ?? "").trim().toLowerCase();
  const lang  = body.lang === "tr" ? "tr" : "en";

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    res.status(400).json({ ok: false, error: "invalid email" });
    return;
  }

  const sb = adminClient();
  const ip = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() || null;
  const ua = (req.headers["user-agent"] as string | undefined) ?? null;

  // Upsert by email. If the row exists, rotate the token and reset status to
  // 'pending'. This is intentional so a forgotten signup can be retried.
  const { data: existing, error: selErr } = await sb
    .from("email_subscribers")
    .select("id, status, token")
    .eq("email", email)
    .maybeSingle();
  if (selErr) {
    res.status(500).json({ ok: false, error: `db.select: ${selErr.message}` });
    return;
  }

  if (existing?.status === "confirmed") {
    // Already on the list — return ok without resending. Confidential: don't
    // leak status (could enumerate). Pretend a confirmation was sent.
    res.status(200).json({ ok: true, message: "If this email is new, a confirmation has been sent." });
    return;
  }

  // Generate a fresh token even for retries.
  const newToken = randomToken();
  let row: { id: string; token: string };
  if (existing) {
    const { data, error } = await sb
      .from("email_subscribers")
      .update({ token: newToken, status: "pending", language: lang, ip, user_agent: ua, confirmed_at: null, unsubscribed_at: null })
      .eq("id", existing.id)
      .select("id, token")
      .single();
    if (error) { res.status(500).json({ ok: false, error: `db.update: ${error.message}` }); return; }
    row = data;
  } else {
    const { data, error } = await sb
      .from("email_subscribers")
      .insert({ email, token: newToken, language: lang, status: "pending", ip, user_agent: ua })
      .select("id, token")
      .single();
    if (error) { res.status(500).json({ ok: false, error: `db.insert: ${error.message}` }); return; }
    row = data;
  }

  const confirmUrl = `${SITE_BASE}/api/confirm?token=${encodeURIComponent(row.token)}`;
  const mail = confirmationEmail({ confirmUrl, lang });
  const send = await sendEmail({ to: email, subject: mail.subject, html: mail.html, text: mail.text });

  if (!send.ok) {
    // Mail provider failed — return success to the user but log internally.
    // The user can re-request later; the row is already 'pending'.
    res.status(202).json({ ok: true, mail: false, error: send.error });
    return;
  }

  res.status(200).json({ ok: true, mail: true });
}

function safeJson(s: string): Record<string, unknown> | null {
  try { return JSON.parse(s); } catch { return null; }
}

function randomToken(): string {
  // 48 hex chars (~24 bytes of entropy)
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
