// Tiny shared auth helper for cron + manual triggers.
import type { VercelRequest, VercelResponse } from "@vercel/node";

export function requireCronSecret(req: VercelRequest, res: VercelResponse): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    // If you forgot to set CRON_SECRET, fail closed in production.
    if (process.env.NODE_ENV === "production") {
      res.status(500).json({ ok: false, error: "CRON_SECRET not configured" });
      return false;
    }
    return true;
  }
  // Vercel cron sends Authorization: Bearer <secret>
  const header = req.headers.authorization || "";
  const fromQuery = (req.query.token as string | undefined) || "";
  if (header === `Bearer ${expected}` || fromQuery === expected) return true;
  res.status(401).json({ ok: false, error: "unauthorized" });
  return false;
}

export function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}
