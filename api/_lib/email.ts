// Thin wrapper around Resend's REST API.
// Avoids the SDK dependency to keep edge bundle slim.

const RESEND_URL = "https://api.resend.com/emails";

export const DIGEST_FROM = "Fulcrum <digest@fulcrum.cyprusorthopaedics.com>";
export const DIGEST_REPLY_TO = "utkugrhn@gmail.com";
export const SITE_BASE = "https://fulcrum.cyprusorthopaedics.com";

export interface SendArgs {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  /** Used to populate List-Unsubscribe header (RFC 8058) — pass per-recipient. */
  unsubscribeUrl?: string;
}

export interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
  status?: number;
}

export async function sendEmail(args: SendArgs): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Local dev or pre-Resend-setup: don't crash, just report.
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }
  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
  // RFC 8058: List-Unsubscribe + List-Unsubscribe-Post lets inbox providers
  // show a native unsubscribe button.
  const customHeaders: Array<{ name: string; value: string }> = [];
  if (args.unsubscribeUrl) {
    customHeaders.push({ name: "List-Unsubscribe", value: `<${args.unsubscribeUrl}>` });
    customHeaders.push({ name: "List-Unsubscribe-Post", value: "List-Unsubscribe=One-Click" });
  }
  const body = {
    from: DIGEST_FROM,
    to: Array.isArray(args.to) ? args.to : [args.to],
    reply_to: DIGEST_REPLY_TO,
    subject: args.subject,
    html: args.html,
    text: args.text,
    headers: customHeaders.length ? customHeaders : undefined,
  };
  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: text.slice(0, 500), status: res.status };
    }
    const json = await res.json() as { id?: string };
    return { ok: true, id: json.id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// =============================================================================
// HTML templates
// =============================================================================

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const STYLE_BODY  = "font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Inter',system-ui,sans-serif; background:#ffffff; color:#1d1d1f; margin:0; padding:0;";
const STYLE_INNER = "max-width:600px; margin:0 auto; padding:24px 20px;";
const STYLE_RULE  = "border:none; border-top:1px solid #d2d2d7; margin:24px 0;";
const STYLE_FOOTER = "color:#6e6e73; font-size:13px; line-height:1.5; margin-top:32px;";
const STYLE_LINK  = "color:#007aff; text-decoration:none;";

function shellHtml(inner: string): string {
  return `<!doctype html><html><body style="${STYLE_BODY}"><div style="${STYLE_INNER}">${inner}</div></body></html>`;
}

export function confirmationEmail(opts: { confirmUrl: string; lang: "tr" | "en" }): { subject: string; html: string; text: string } {
  const { confirmUrl, lang } = opts;
  if (lang === "tr") {
    return {
      subject: "Fulcrum aboneliğini onayla",
      html: shellHtml(`
        <h1 style="font-size:28px; font-weight:700; letter-spacing:-0.02em; margin:0 0 16px;">Fulcrum</h1>
        <p style="font-size:17px; line-height:1.5; margin:0 0 18px;">Günlük PubMed ortopedi özetine abone olmak üzere bir istek aldık. Onaylamak için aşağıdaki bağlantıya tıkla:</p>
        <p style="margin:24px 0;"><a href="${confirmUrl}" style="display:inline-block; background:#007aff; color:#ffffff; padding:12px 22px; border-radius:12px; font-weight:600; text-decoration:none;">Aboneliği Onayla</a></p>
        <p style="font-size:13px; color:#6e6e73; line-height:1.5;">Eğer bu isteği sen yapmadıysan, bu e-postayı yok say. Adresin onaylanmadığı sürece liste içine girmeyecek.</p>
        <hr style="${STYLE_RULE}" />
        <p style="${STYLE_FOOTER}">Fulcrum · ${SITE_BASE.replace("https://","")}</p>
      `),
      text: `Fulcrum aboneliğini onayla\n\nGünlük PubMed ortopedi özetine abone olmak üzere bir istek aldık. Onaylamak için: ${confirmUrl}\n\nBu isteği sen yapmadıysan, bu e-postayı yok say.\n\n— Fulcrum`,
    };
  }
  return {
    subject: "Confirm your Fulcrum subscription",
    html: shellHtml(`
      <h1 style="font-size:28px; font-weight:700; letter-spacing:-0.02em; margin:0 0 16px;">Fulcrum</h1>
      <p style="font-size:17px; line-height:1.5; margin:0 0 18px;">Someone requested a daily PubMed orthopaedic digest at this address. To confirm and start receiving it, click below:</p>
      <p style="margin:24px 0;"><a href="${confirmUrl}" style="display:inline-block; background:#007aff; color:#ffffff; padding:12px 22px; border-radius:12px; font-weight:600; text-decoration:none;">Confirm subscription</a></p>
      <p style="font-size:13px; color:#6e6e73; line-height:1.5;">If you didn't request this, ignore this email — your address won't be added until you confirm.</p>
      <hr style="${STYLE_RULE}" />
      <p style="${STYLE_FOOTER}">Fulcrum · ${SITE_BASE.replace("https://","")}</p>
    `),
    text: `Confirm your Fulcrum subscription\n\nSomeone requested a daily PubMed orthopaedic digest at this address. To confirm: ${confirmUrl}\n\nIf you didn't request this, ignore this email.\n\n— Fulcrum`,
  };
}

export interface DigestArticle {
  pmid: string;
  title: string;
  journal: string;
  score: number;
  tier: number | null;
  subspecialty_en: string | null;
  subspecialty_tr: string | null;
  ocebm_level: string | null;
  url: string;
}

export function digestEmail(opts: {
  articles: DigestArticle[];
  dateLabel: string;
  issueNo: number;
  unsubscribeUrl: string;
  lang: "tr" | "en";
}): { subject: string; html: string; text: string } {
  const { articles, dateLabel, issueNo, unsubscribeUrl, lang } = opts;

  const lead = lang === "tr"
    ? `Bugünün PubMed ortopedi özeti — JIF, kanıt düzeyi, güncellik ve örneklem büyüklüğüyle sıralanmış en iyi ${articles.length} makale.`
    : `Today's PubMed orthopaedic digest — the top ${articles.length} articles ranked by JIF, evidence level, recency, and sample size.`;

  const rows = articles.map((a, i) => {
    const sub = lang === "tr" ? (a.subspecialty_tr ?? a.subspecialty_en ?? "") : (a.subspecialty_en ?? "");
    const tierTag = a.tier ? `T${a.tier}` : "—";
    const ocebmTag = a.ocebm_level ? ` · OCEBM ${a.ocebm_level}` : "";
    return `
      <div style="border-top:1px solid #d2d2d7; padding:18px 0;">
        <div style="display:flex; gap:14px;">
          <div style="font-weight:700; font-size:22px; color:#86868b; min-width:36px; line-height:1.2;">№${i + 1}</div>
          <div style="flex:1;">
            <div style="font-size:12px; color:#c8252a; letter-spacing:0.08em; text-transform:uppercase; font-weight:600; margin-bottom:6px;">
              ${tierTag} · ${escapeHtml(sub)}${ocebmTag}
            </div>
            <a href="${a.url}" style="${STYLE_LINK} font-size:17px; font-weight:700; line-height:1.35; display:block; margin-bottom:6px;">${escapeHtml(a.title)}</a>
            <div style="font-size:13px; color:#6e6e73; line-height:1.4;">${escapeHtml(a.journal)} · ${lang === "tr" ? "Skor" : "Score"} <strong style="color:#c8252a;">${a.score}</strong></div>
          </div>
        </div>
      </div>`;
  }).join("");

  const eyebrow = lang === "tr"
    ? `BUGÜNÜN SAYISI · FOLIO I · NO. ${issueNo}`
    : `TODAY'S ISSUE · FOLIO I · NO. ${issueNo}`;

  const headlinesText = articles.map((a, i) =>
    `${i + 1}. ${a.title}\n   ${a.journal} · ${lang === "tr" ? "Skor" : "Score"} ${a.score} · T${a.tier ?? "—"}\n   ${a.url}`
  ).join("\n\n");

  const ctaSite = lang === "tr" ? "TAM SIRALAMAYI AÇ" : "OPEN FULL RANKING";
  const ctaUnsub = lang === "tr" ? "Aboneliği iptal et" : "Unsubscribe";

  return {
    subject: lang === "tr"
      ? `Fulcrum · ${dateLabel} · Üst ${articles.length} ortopedi makalesi`
      : `Fulcrum · ${dateLabel} · Top ${articles.length} orthopaedic papers`,
    html: shellHtml(`
      <div style="font-size:12px; color:#c8252a; letter-spacing:0.08em; font-weight:600; margin-bottom:6px;">${eyebrow}</div>
      <h1 style="font-size:36px; font-weight:800; letter-spacing:-0.025em; margin:0 0 4px; line-height:1.05;">${escapeHtml(dateLabel)}</h1>
      <div style="width:64px; border-top:2px solid #007aff; margin:14px 0;"></div>
      <p style="font-size:15px; color:#1d1d1f; line-height:1.5; margin:0 0 8px;">${lead}</p>
      ${rows}
      <p style="margin:32px 0 8px;"><a href="${SITE_BASE}" style="display:inline-block; background:#007aff; color:#ffffff; padding:10px 18px; border-radius:10px; font-weight:600; text-decoration:none; font-size:13px; letter-spacing:0.05em;">${ctaSite} →</a></p>
      <hr style="${STYLE_RULE}" />
      <p style="${STYLE_FOOTER}">
        Fulcrum · ${SITE_BASE.replace("https://","")}<br />
        <a href="${unsubscribeUrl}" style="color:#6e6e73; text-decoration:underline;">${ctaUnsub}</a>
      </p>
    `),
    text: lang === "tr"
      ? `Fulcrum · ${dateLabel}\n${lead}\n\n${headlinesText}\n\nTam sıralama: ${SITE_BASE}\nAboneliği iptal et: ${unsubscribeUrl}`
      : `Fulcrum · ${dateLabel}\n${lead}\n\n${headlinesText}\n\nFull ranking: ${SITE_BASE}\nUnsubscribe: ${unsubscribeUrl}`,
  };
}
