// GET /api/og?pmid=12345  -> 1200x630 PNG share card for an article.
// Runs on Vercel Edge runtime (fast, low cold-start).

import { ImageResponse } from "@vercel/og";

export const config = { runtime: "edge" };

// Colors locked to Varsity Codex palette.
const NAVY    = "#0F2540";
const NAVY_2  = "#143055";
const CREAM   = "#F4ECDB";
const BRASS   = "#B89968";
const BLOOD   = "#9E2A2B";
const LEAF    = "#C5BDA0";

interface ArticleRow {
  pmid: string;
  title: string;
  journal_title: string | null;
  journal_title_raw: string;
  tier: 1 | 2 | 3 | null;
  subspecialty: string;
  subspecialty_name_en: string | null;
  subspecialty_name_tr: string | null;
  score: number;
  ocebm_level: string | null;
  publication_types: string[];
}

function publicationLabel(types: string[]): string | null {
  const priority = [
    "Meta-Analysis", "Systematic Review", "Randomized Controlled Trial",
    "Practice Guideline", "Clinical Trial", "Multicenter Study",
    "Comparative Study", "Observational Study", "Review", "Case Reports",
    "Editorial", "Letter",
  ];
  const set = new Set(types ?? []);
  for (const p of priority) if (set.has(p)) return p.toUpperCase();
  return null;
}

async function fetchArticle(pmid: string): Promise<ArticleRow | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const res = await fetch(
    `${url}/rest/v1/v_articles?pmid=eq.${encodeURIComponent(pmid)}&select=pmid,title,journal_title,journal_title_raw,tier,subspecialty,subspecialty_name_en,subspecialty_name_tr,score,ocebm_level,publication_types&limit=1`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
    }
  );
  if (!res.ok) return null;
  const rows = (await res.json()) as ArticleRow[];
  return rows?.[0] ?? null;
}

// Decode the same PubMed numeric refs the frontend does.
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

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const pmid = url.searchParams.get("pmid");

  let title = "Fulcrum";
  let subtitle = "Daily orthopaedic literature, ranked";
  let journal: string | null = null;
  let tier: 1 | 2 | 3 | null = null;
  let sub: string | null = null;
  let score: number | null = null;
  let ptype: string | null = null;
  let ocebm: string | null = null;

  if (pmid) {
    const row = await fetchArticle(pmid);
    if (row) {
      title    = decodeEntities(row.title).slice(0, 240);
      journal  = (row.journal_title ?? row.journal_title_raw).toUpperCase();
      tier     = row.tier;
      sub      = (row.subspecialty_name_en ?? row.subspecialty)?.toUpperCase() ?? null;
      score    = Math.round(row.score);
      ptype    = publicationLabel(row.publication_types ?? []);
      ocebm    = row.ocebm_level;
      subtitle = "";
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          background: NAVY,
          color: CREAM,
          fontFamily: "Georgia, 'Times New Roman', serif",
          position: "relative",
        }}
      >
        {/* Top brass rule */}
        <div style={{ height: 6, background: BRASS, display: "flex" }} />

        {/* Header strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "28px 56px 0",
          }}
        >
          {/* Brand: sapling + Fulcrum */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Andry sapling glyph */}
            <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 44 L14 18 C14 12 18 8 24 8 C30 8 34 12 34 18 L34 44" stroke={BRASS} strokeWidth="2.5" fill="none" />
              <path d="M24 8 L24 44" stroke={BRASS} strokeWidth="2.5" fill="none" />
              <line x1="6" y1="44" x2="42" y2="44" stroke={BRASS} strokeWidth="3" />
              <circle cx="24" cy="44" r="3" fill={BLOOD} />
            </svg>
            <div style={{ fontStyle: "italic", fontWeight: 700, fontSize: 44, letterSpacing: -1, display: "flex" }}>
              <span style={{ color: BLOOD }}>F</span>
              <span style={{ color: CREAM }}>ulcrum</span>
            </div>
          </div>
          <div
            style={{
              fontSize: 14,
              letterSpacing: 4,
              color: LEAF,
              textTransform: "uppercase",
              fontFamily: "Inter, sans-serif",
              display: "flex",
            }}
          >
            FULCRUM.CYPRUSORTHOPAEDICS.COM
          </div>
        </div>

        {/* Hair rule below header */}
        <div style={{ height: 1, background: BRASS, margin: "20px 56px 0", display: "flex" }} />

        {/* Body row: meta + title (left) + score (right) */}
        <div
          style={{
            display: "flex",
            flex: 1,
            padding: "28px 56px 0",
            gap: 36,
          }}
        >
          {/* Title block */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {/* Tier + subspecialty + ptype meta */}
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 22 }}>
              {tier && (
                <div
                  style={{
                    border: `2px solid ${BRASS}`,
                    color: BRASS,
                    background: `${BRASS}22`,
                    padding: "2px 12px",
                    fontStyle: "italic",
                    fontWeight: 700,
                    fontSize: 22,
                    display: "flex",
                  }}
                >
                  T{tier}
                </div>
              )}
              {sub && (
                <div
                  style={{
                    color: BLOOD,
                    letterSpacing: 4,
                    fontSize: 16,
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    display: "flex",
                  }}
                >
                  {sub}
                </div>
              )}
              {ptype && (
                <div
                  style={{
                    color: LEAF,
                    letterSpacing: 3,
                    fontSize: 14,
                    fontFamily: "Inter, sans-serif",
                    display: "flex",
                  }}
                >
                  · {ptype}
                </div>
              )}
              {ocebm && (
                <div
                  style={{
                    color: LEAF,
                    letterSpacing: 3,
                    fontSize: 14,
                    fontFamily: "Inter, sans-serif",
                    display: "flex",
                  }}
                >
                  · OCEBM {ocebm}
                </div>
              )}
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: pmid ? 50 : 64,
                fontWeight: 700,
                color: CREAM,
                lineHeight: 1.08,
                letterSpacing: -1,
                display: "flex",
                maxWidth: 760,
              }}
            >
              {title.length > 180 ? title.slice(0, 177) + "…" : title}
            </div>

            {subtitle && (
              <div
                style={{
                  marginTop: 18,
                  fontSize: 22,
                  color: `${CREAM}cc`,
                  fontStyle: "italic",
                  display: "flex",
                }}
              >
                {subtitle}
              </div>
            )}

            {/* Journal + footer */}
            {journal && (
              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 6, paddingTop: 24 }}>
                <div
                  style={{
                    color: LEAF,
                    letterSpacing: 3,
                    fontSize: 16,
                    fontFamily: "Inter, sans-serif",
                    display: "flex",
                  }}
                >
                  {journal.length > 60 ? journal.slice(0, 57) + "…" : journal}
                </div>
              </div>
            )}
          </div>

          {/* Score block (right) */}
          {score !== null && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                justifyContent: "flex-start",
                minWidth: 200,
              }}
            >
              <div
                style={{
                  color: LEAF,
                  letterSpacing: 5,
                  fontSize: 14,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                SCORE
              </div>
              <div
                style={{
                  fontStyle: "italic",
                  fontWeight: 700,
                  color: BLOOD,
                  fontSize: 180,
                  lineHeight: 1,
                  letterSpacing: -6,
                  marginTop: 4,
                  display: "flex",
                }}
              >
                {score}
              </div>
            </div>
          )}
        </div>

        {/* Bottom blood rule */}
        <div style={{ display: "flex", padding: "0 56px 28px", marginTop: 24 }}>
          <div
            style={{
              flex: 1,
              height: 4,
              background: BLOOD,
              display: "flex",
            }}
          />
          <div
            style={{
              marginLeft: 16,
              color: BRASS,
              letterSpacing: 4,
              fontSize: 14,
              fontFamily: "Inter, sans-serif",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Varsity Codex · v0.5
          </div>
        </div>

        {/* Side brass rule */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 6,
            bottom: 0,
            width: 8,
            background: NAVY_2,
            display: "flex",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}
