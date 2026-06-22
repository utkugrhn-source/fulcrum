// GET /api/cron-digest    (called by Vercel Cron at 06:30 UTC daily)
//
// Pulls today's top N scored articles, then walks the confirmed subscriber
// list and sends each a personalized localized digest with a one-click
// unsubscribe link.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminClient } from "./_lib/supabase-admin.js";
import { requireCronSecret, setCors } from "./_lib/auth.js";
import { sendEmail, digestEmail, type DigestArticle, SITE_BASE } from "./_lib/email.js";

const DIGEST_SIZE = 5;

interface Subscriber {
  id: string;
  email: string;
  token: string;
  language: "tr" | "en";
}

interface ArticleRow {
  pmid: string;
  title: string;
  journal_title: string | null;
  journal_title_raw: string;
  tier: 1 | 2 | 3 | null;
  ocebm_level: string | null;
  score: number;
  subspecialty_name_en: string | null;
  subspecialty_name_tr: string | null;
}

interface Report {
  ok: boolean;
  attempted: number;
  sent: number;
  errors: string[];
  articles: number;
  date: string;
  duration_ms: number;
  error?: string;
}

function todayIssueDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function issueNumberForDate(iso: string): number {
  const [y, m, d] = iso.split("-").map((s) => parseInt(s, 10));
  if (!y || !m || !d) return 0;
  const start = new Date(Date.UTC(y, 0, 0));
  const date = new Date(Date.UTC(y, m - 1, d));
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

function formatDate(iso: string, lang: "tr" | "en"): string {
  const [y, m, d] = iso.split("-").map((s) => parseInt(s, 10));
  if (!y || !m || !d) return iso;
  const monthsTr = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  const monthsEn = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${d} ${(lang === "tr" ? monthsTr : monthsEn)[m - 1]} ${y}`;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, dx) => String.fromCodePoint(parseInt(dx, 10)))
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ ok: false, error: "method not allowed" }); return;
  }
  if (!requireCronSecret(req, res)) return;

  const t0 = Date.now();
  const date = todayIssueDate();
  const report: Report = { ok: true, attempted: 0, sent: 0, errors: [], articles: 0, date, duration_ms: 0 };

  try {
    const sb = adminClient();

    // Today's top N scored articles. Fall back to last 24h by entrez_date if
    // nothing carries today's date yet (cron timing race with ingestion).
    let { data: articles, error: aErr } = await sb
      .from("v_articles")
      .select("pmid, title, journal_title, journal_title_raw, tier, ocebm_level, score, subspecialty_name_en, subspecialty_name_tr")
      .eq("entrez_date", date)
      .order("score", { ascending: false })
      .limit(DIGEST_SIZE);
    if (aErr) throw new Error(`articles: ${aErr.message}`);

    if (!articles || articles.length === 0) {
      const yesterday = new Date(Date.now() - 24 * 3_600_000).toISOString().slice(0, 10);
      const fb = await sb
        .from("v_articles")
        .select("pmid, title, journal_title, journal_title_raw, tier, ocebm_level, score, subspecialty_name_en, subspecialty_name_tr")
        .gte("entrez_date", yesterday)
        .order("score", { ascending: false })
        .limit(DIGEST_SIZE);
      if (fb.error) throw new Error(`articles_fb: ${fb.error.message}`);
      articles = fb.data ?? [];
    }
    report.articles = articles.length;

    if (articles.length === 0) {
      // Nothing to send. Don't spam users with empty issues.
      report.duration_ms = Date.now() - t0;
      res.status(200).json(report);
      return;
    }

    const issueNo = issueNumberForDate(date);

    // Confirmed subscribers
    const { data: subs, error: sErr } = await sb
      .from("email_subscribers")
      .select("id, email, token, language")
      .eq("status", "confirmed");
    if (sErr) throw new Error(`subs: ${sErr.message}`);
    report.attempted = (subs ?? []).length;

    if (!subs || subs.length === 0) {
      report.duration_ms = Date.now() - t0;
      res.status(200).json(report);
      return;
    }

    // Send sequentially to stay under Resend rate limits (their free tier is
    // ~2 req/sec). For a low-volume launch this is plenty.
    for (const sub of subs as Subscriber[]) {
      const lang = sub.language === "tr" ? "tr" : "en";
      const dateLabel = formatDate(date, lang);
      const unsubscribeUrl = `${SITE_BASE}/api/unsubscribe?token=${encodeURIComponent(sub.token)}`;

      const digestArticles: DigestArticle[] = (articles as ArticleRow[]).map((a) => ({
        pmid: a.pmid,
        title: decodeEntities(a.title),
        journal: a.journal_title ?? a.journal_title_raw,
        score: Math.round(a.score),
        tier: a.tier,
        subspecialty_en: a.subspecialty_name_en,
        subspecialty_tr: a.subspecialty_name_tr,
        ocebm_level: a.ocebm_level,
        url: `${SITE_BASE}/a/${a.pmid}`,
      }));

      const mail = digestEmail({ articles: digestArticles, dateLabel, issueNo, unsubscribeUrl, lang });
      const send = await sendEmail({
        to: sub.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        unsubscribeUrl,
      });

      if (send.ok) {
        report.sent += 1;
        // Best-effort last_sent_at update; ignore errors here.
        await sb
          .from("email_subscribers")
          .update({ last_sent_at: new Date().toISOString() })
          .eq("id", sub.id);
      } else {
        report.errors.push(`${sub.email}: ${send.error ?? "unknown"}`);
      }
    }

    report.duration_ms = Date.now() - t0;
    res.status(200).json(report);
  } catch (e) {
    report.ok = false;
    report.error = (e as Error).message;
    report.duration_ms = Date.now() - t0;
    res.status(500).json(report);
  }
}
