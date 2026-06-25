// GET /api/sitemap.xml  →  dynamic XML sitemap for search engines.
// Combines static routes, the 11 subspecialty pages, recent issues,
// and the top-scored articles. Crawled by Google + Bing.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminClient } from "./_lib/supabase-admin.js";

const SITE_BASE = "https://fulcrum.cyprusorthopaedics.com";

const STATIC_PATHS = [
  { path: "/",             changefreq: "daily",   priority: 1.0 },
  { path: "/archive",      changefreq: "daily",   priority: 0.8 },
  { path: "/scoring",      changefreq: "monthly", priority: 0.6 },
  { path: "/about",        changefreq: "monthly", priority: 0.5 },
];

const SUBSPECIALTIES = [
  "trauma", "sports", "arthroplasty", "spine", "pediatric",
  "hand-upper", "foot-ankle", "shoulder-elbow", "onc", "basic", "general",
];

function urlEntry(loc: string, lastmod?: string, changefreq?: string, priority?: number): string {
  const lines = [`  <url>`, `    <loc>${loc}</loc>`];
  if (lastmod)    lines.push(`    <lastmod>${lastmod}</lastmod>`);
  if (changefreq) lines.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority !== undefined) lines.push(`    <priority>${priority.toFixed(1)}</priority>`);
  lines.push(`  </url>`);
  return lines.join("\n");
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const urls: string[] = [];

  // Static
  for (const p of STATIC_PATHS) {
    urls.push(urlEntry(`${SITE_BASE}${p.path}`, undefined, p.changefreq, p.priority));
  }

  // Subspecialty landing pages
  for (const slug of SUBSPECIALTIES) {
    urls.push(urlEntry(`${SITE_BASE}/sub/${slug}`, undefined, "daily", 0.7));
  }

  try {
    const sb = adminClient();

    // Recent issue archive days (last 60 indexing dates)
    const { data: dates } = await sb
      .from("v_articles")
      .select("entrez_date")
      .not("entrez_date", "is", null)
      .order("entrez_date", { ascending: false })
      .limit(2000);
    if (dates) {
      const uniq = new Set<string>();
      for (const r of dates as Array<{ entrez_date: string }>) uniq.add(r.entrez_date);
      const list = Array.from(uniq).sort((a, b) => b.localeCompare(a)).slice(0, 60);
      for (const d of list) {
        urls.push(urlEntry(`${SITE_BASE}/issue/${escapeXml(d)}`, d, "weekly", 0.5));
      }
    }

    // Top-scored articles (so search engines have something to crawl for /a/:pmid)
    const { data: articles } = await sb
      .from("v_articles")
      .select("pmid, ingested_at, scored_at")
      .order("score", { ascending: false })
      .limit(500);
    if (articles) {
      for (const a of articles as Array<{ pmid: string; ingested_at: string; scored_at: string | null }>) {
        const lastmod = (a.scored_at ?? a.ingested_at)?.slice(0, 10);
        urls.push(urlEntry(`${SITE_BASE}/a/${escapeXml(a.pmid)}`, lastmod, "weekly", 0.4));
      }
    }
  } catch {
    // If the DB hiccups, still ship a valid sitemap with the static set.
  }

  const xml =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(xml);
}
