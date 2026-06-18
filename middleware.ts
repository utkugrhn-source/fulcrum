// Edge middleware — intercept /a/:pmid requests from social-media crawlers
// and inject per-article Open Graph + Twitter Card meta tags so the share
// preview shows the right title, score, journal and uses the /api/og card.
//
// Humans get the SPA index.html unchanged.

export const config = {
  matcher: "/a/:pmid*",
};

const BOT_REGEX = /\b(twitterbot|facebookexternalhit|facebot|linkedinbot|slackbot-linkexpanding|slackbot|discordbot|telegrambot|whatsapp|skypeuripreview|embedly|redditbot|applebot|pinterestbot|googlebot|bingbot|duckduckbot|yandexbot|baiduspider|mastodon|akkoma|misskey|threads|nuzzel|outbrain|vkshare|w3c_validator|chatgpt|gptbot|claude-?web|claudebot|perplexitybot|metaverified|grapeshot|qwantify|tineye)\b/i;

interface ArticleMeta {
  title: string;
  journal: string;
  score: number;
  tier: number | null;
  subspecialty_en: string | null;
  ocebm_level: string | null;
  publication_types: string[];
}

function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => {
      const cp = parseInt(h, 16);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : "";
    })
    .replace(/&#(\d+);/g, (_, d) => {
      const cp = parseInt(d, 10);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : "";
    })
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"").replace(/&apos;/g, "'");
}

function escapeHtmlAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function fetchArticleMeta(pmid: string): Promise<ArticleMeta | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/v_articles?pmid=eq.${encodeURIComponent(pmid)}&select=title,journal_title,journal_title_raw,tier,subspecialty_name_en,score,ocebm_level,publication_types&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          Accept: "application/json",
        },
      }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<Record<string, unknown>>;
    const r = rows?.[0];
    if (!r) return null;
    return {
      title: decodeEntities(String(r.title ?? "")),
      journal: String(r.journal_title ?? r.journal_title_raw ?? ""),
      score: Math.round(Number(r.score ?? 0)),
      tier: (r.tier as number | null) ?? null,
      subspecialty_en: (r.subspecialty_name_en as string | null) ?? null,
      ocebm_level: (r.ocebm_level as string | null) ?? null,
      publication_types: (r.publication_types as string[] | null) ?? [],
    };
  } catch {
    return null;
  }
}

function publicationLabel(types: string[]): string | null {
  const priority = [
    "Meta-Analysis", "Systematic Review", "Randomized Controlled Trial",
    "Practice Guideline", "Clinical Trial", "Multicenter Study",
    "Comparative Study", "Observational Study", "Review", "Case Reports",
    "Editorial", "Letter",
  ];
  const set = new Set(types ?? []);
  for (const p of priority) if (set.has(p)) return p;
  return null;
}

function buildDescription(meta: ArticleMeta): string {
  const bits: string[] = [];
  if (meta.tier != null) bits.push(`T${meta.tier}`);
  if (meta.subspecialty_en) bits.push(meta.subspecialty_en);
  const ptype = publicationLabel(meta.publication_types);
  if (ptype) bits.push(ptype);
  if (meta.ocebm_level) bits.push(`OCEBM ${meta.ocebm_level}`);
  bits.push(`Score ${meta.score}`);
  const prefix = bits.join(" · ");
  const journal = meta.journal ? ` — ${meta.journal}` : "";
  return `${prefix}${journal}`;
}

function buildMeta(pmid: string, meta: ArticleMeta, origin: string): string {
  const ogImage = `${origin}/api/og?pmid=${encodeURIComponent(pmid)}`;
  const url = `${origin}/a/${encodeURIComponent(pmid)}`;
  const title = `${meta.title.slice(0, 240)} · Fulcrum`;
  const desc = buildDescription(meta);
  return [
    `<title>${escapeHtmlAttr(title)}</title>`,
    `<meta name="description" content="${escapeHtmlAttr(desc)}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:site_name" content="Fulcrum" />`,
    `<meta property="og:title" content="${escapeHtmlAttr(title)}" />`,
    `<meta property="og:description" content="${escapeHtmlAttr(desc)}" />`,
    `<meta property="og:url" content="${escapeHtmlAttr(url)}" />`,
    `<meta property="og:image" content="${escapeHtmlAttr(ogImage)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtmlAttr(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtmlAttr(desc)}" />`,
    `<meta name="twitter:image" content="${escapeHtmlAttr(ogImage)}" />`,
  ].join("\n    ");
}

export default async function middleware(req: Request): Promise<Response | undefined> {
  const ua = req.headers.get("user-agent") ?? "";
  const isBot = BOT_REGEX.test(ua);
  if (!isBot) return;

  const url = new URL(req.url);
  const pmid = url.pathname.split("/a/")[1]?.split("/")[0];
  if (!pmid || !/^\d+$/.test(pmid)) return;

  const meta = await fetchArticleMeta(pmid);
  if (!meta) return;

  // Pull the static SPA shell and inject our per-article meta tags.
  const htmlRes = await fetch(`${url.origin}/index.html`, {
    headers: { "x-middleware-bypass": "1" },
  });
  if (!htmlRes.ok) return;
  let html = await htmlRes.text();

  const replacement = buildMeta(pmid, meta, url.origin);
  html = html
    .replace(/<title>[^<]*<\/title>/i, "")
    .replace(/<meta\s+(name|property)="(og:[^"]+|twitter:[^"]+|description)"[^>]*>\s*/gi, "")
    .replace(/<\/head>/i, `    ${replacement}\n  </head>`);

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
