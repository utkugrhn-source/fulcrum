import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";

const TIER_SAMPLES: Array<{ tier: 1 | 2 | 3; n: number; sample: string }> = [
  { tier: 1, n: 14, sample: "JBJS · BJJ · AJSM · Osteoarthritis Cartilage · Spine J · KSSTA · BJSM · Sports Med" },
  { tier: 2, n: 38, sample: "JAAOS · JBJS Rev · OTSR · Arch Orthop Trauma Surg · Bone · Osteoporos Int · JSES · J Hand Surg Am · Foot Ankle Int · J Pediatr Orthop · J Arthroplasty · J Orthop Trauma · Injury" },
  { tier: 3, n: 46, sample: "Bone Jt Open · JSES Int · Arthroplasty · SICOT-J · J Exp Orthop · Global Spine J · Hand Surg Rehabil · Cureus · BMC Musculoskelet Disord · World J Orthop" },
];

const SUBSPECIALTIES: Array<{ slug: string; tr: string; en: string }> = [
  { slug: "trauma",          tr: "Travma",          en: "Trauma" },
  { slug: "sports",          tr: "Spor Hekimliği",  en: "Sports Medicine" },
  { slug: "arthroplasty",    tr: "Artroplasti",     en: "Arthroplasty" },
  { slug: "spine",           tr: "Omurga",          en: "Spine" },
  { slug: "pediatric",       tr: "Pediatrik",       en: "Pediatric" },
  { slug: "hand-upper",      tr: "El & Üst Ekstremite",  en: "Hand & Upper Extremity" },
  { slug: "foot-ankle",      tr: "Ayak & Ayak Bileği",   en: "Foot & Ankle" },
  { slug: "shoulder-elbow",  tr: "Omuz & Dirsek",   en: "Shoulder & Elbow" },
  { slug: "onc",             tr: "Onkoloji",        en: "Oncology" },
  { slug: "basic",           tr: "Temel Bilim",     en: "Basic Science" },
  { slug: "general",         tr: "Genel",           en: "General" },
];

export function About() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("tr") ? "tr" : "en";

  const card     = "bg-cream-2 dark:bg-navy-2 border border-brass rounded-sm px-5 sm:px-7 py-6";
  const cardDark = "bg-navy text-cream rounded-sm border-l-4 border-l-brass px-5 sm:px-7 py-6";
  const eyebrow  = "editorial text-[11px] tracking-[0.3em] text-blood font-medium";
  const sectionH = "display text-[26px] sm:text-[32px] leading-tight text-navy dark:text-cream mt-10 mb-4";
  const para     = "body-serif text-[14.5px] text-ink dark:text-cream/80 leading-relaxed";

  return (
    <div className="container-prose py-7 sm:py-10">
      <Link to="/" className="editorial text-[11px] tracking-[0.2em] text-blood hover:text-navy dark:hover:text-cream inline-flex items-center gap-1">
        <ArrowLeft size={14} /> {t("detail.back")}
      </Link>

      {/* Hero */}
      <header className="mt-5 pb-6 border-b border-brass">
        <div className={eyebrow}>{lang === "tr" ? "FULCRUM HAKKINDA" : "ABOUT FULCRUM"}</div>
        <h1 className="display text-[44px] sm:text-[56px] leading-none text-navy dark:text-cream mt-2">
          {lang === "tr" ? "Günlük ortopedi sayısı" : "A daily orthopaedic issue"}
        </h1>
        <p className={`${para} mt-4 max-w-2xl`}>
          {lang === "tr"
            ? "Fulcrum, her sabah PubMed'i tarar, ortopedi ile ilgili tüm yeni makaleleri akademik bir sıralamayla sunar. Disiplinli, ücretsiz, açık kaynak — Andry'nin 1741 fidanından ilham alan biomekanik bir dayanak."
            : "Fulcrum scans PubMed every morning and presents new orthopaedic papers in an academic ranking. Disciplined, free, open-source — a biomechanical pivot inspired by Andry's 1741 sapling."}
        </p>
      </header>

      {/* Pipeline */}
      <h2 className={sectionH}>{lang === "tr" ? "Veri akışı" : "Data pipeline"}</h2>
      <div className={card}>
        <ol className="space-y-3 body-serif text-[14px] text-ink dark:text-cream/80">
          <li><span className="editorial text-blood text-[10.5px] tracking-[0.22em] mr-2">01</span>
            {lang === "tr"
              ? "Her sabah 06:00 UTC'de Vercel cron PubMed E-utilities (esearch + efetch) ile son 24 saatte indekslenen makaleleri çeker."
              : "Every morning at 06:00 UTC, a Vercel cron pulls articles indexed in the last 24 h via PubMed E-utilities (esearch + efetch)."}
          </li>
          <li><span className="editorial text-blood text-[10.5px] tracking-[0.22em] mr-2">02</span>
            {lang === "tr"
              ? "98 ortopedik dergiden gelen makaleler ayrıştırılır: başlık, özet, yazarlar, MeSH başlıkları, yayın tipleri, DOI, PMC ID."
              : "Articles from 98 orthopaedic journals are parsed: title, abstract, authors, MeSH headings, publication types, DOI, PMC ID."}
          </li>
          <li><span className="editorial text-blood text-[10.5px] tracking-[0.22em] mr-2">03</span>
            {lang === "tr"
              ? "Her makale: (1) dergiyle eşleştirilir, (2) MeSH + başlık ile 11 yan daldan birine sınıflandırılır, (3) örneklem büyüklüğü özetten çıkarılır."
              : "Each article: (1) is matched to its journal, (2) classified into one of 11 subspecialties via MeSH + title cues, (3) sample size is extracted from the abstract."}
          </li>
          <li><span className="editorial text-blood text-[10.5px] tracking-[0.22em] mr-2">04</span>
            {lang === "tr"
              ? "v0.3 skor formülü uygulanır: JIF × OCEBM × Recency × N × OA × 100."
              : "The v0.3 score is applied: JIF × OCEBM × Recency × N × OA × 100."}
          </li>
          <li><span className="editorial text-blood text-[10.5px] tracking-[0.22em] mr-2">05</span>
            {lang === "tr"
              ? "Sonuçlar Supabase Postgres'e (Frankfurt) yazılır. Frontend doğrudan PostgREST'ten okur — herkes anonim okuyabilir, yazma yalnız servis rolüyle."
              : "Results are written to Supabase Postgres (Frankfurt). The frontend reads PostgREST directly — anonymous read for all, writes only via service role."}
          </li>
        </ol>
        <Link to="/scoring" className="mt-5 editorial text-[11px] tracking-[0.22em] text-blood hover:text-navy dark:hover:text-cream inline-flex items-center gap-1">
          {lang === "tr" ? "FORMÜLÜN DETAYI →" : "FULL METHODOLOGY →"}
        </Link>
      </div>

      {/* Coverage table */}
      <h2 className={sectionH}>{lang === "tr" ? "Dergi kapsamı" : "Journal coverage"}</h2>
      <div className={card}>
        <p className={para}>
          {lang === "tr"
            ? "Toplam 98 dergi, üç katmana ayrılır. Her dergi 2024 JCR Impact Factor değeriyle eşleştirilmiştir."
            : "98 journals total, split across three tiers. Each is tagged with its 2024 JCR Impact Factor."}
        </p>
        <div className="mt-4 space-y-3">
          {TIER_SAMPLES.map((t) => (
            <div key={t.tier} className="border border-brass/30 rounded-sm px-4 py-3">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-serif italic font-bold text-[18px] text-brass">T{t.tier}</span>
                <span className="editorial text-[10.5px] tracking-[0.22em] text-blood">
                  {lang === "tr" ? `${t.n} DERGİ` : `${t.n} JOURNALS`}
                </span>
              </div>
              <div className="body-serif italic text-[12.5px] text-ink-2 dark:text-leaf leading-relaxed">
                {t.sample}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subspecialties */}
      <h2 className={sectionH}>{lang === "tr" ? "Yan dal taksonomisi" : "Subspecialty taxonomy"}</h2>
      <div className={card}>
        <p className={para}>
          {lang === "tr"
            ? "Her makale 11 yan daldan birine düşer. Sınıflandırma sırası: dergi varsayılanı → MeSH başlıkları → başlık anahtar kelimeleri → 'genel'."
            : "Every article lands in one of 11 subspecialties. Classification order: journal default → MeSH headings → title keywords → 'general'."}
        </p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {SUBSPECIALTIES.map((s) => (
            <span key={s.slug} className="pill text-[11.5px] uppercase">
              {lang === "tr" ? s.tr : s.en}
            </span>
          ))}
        </div>
      </div>

      {/* Stack */}
      <h2 className={sectionH}>{lang === "tr" ? "Yığın" : "Stack"}</h2>
      <div className={`${cardDark}`}>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-[12.5px]">
          <div><dt className="editorial text-[9px] tracking-[0.22em] text-leaf">FRONTEND</dt><dd className="mt-1">React · Vite · Tailwind · React Router</dd></div>
          <div><dt className="editorial text-[9px] tracking-[0.22em] text-leaf">BACKEND</dt><dd className="mt-1">Vercel serverless · Vercel Cron</dd></div>
          <div><dt className="editorial text-[9px] tracking-[0.22em] text-leaf">DATABASE</dt><dd className="mt-1">Supabase Postgres (eu-central-1)</dd></div>
          <div><dt className="editorial text-[9px] tracking-[0.22em] text-leaf">SOURCE</dt><dd className="mt-1">PubMed E-utilities</dd></div>
          <div><dt className="editorial text-[9px] tracking-[0.22em] text-leaf">CONTENT</dt><dd className="mt-1">~50 – 100 makale/gün</dd></div>
          <div><dt className="editorial text-[9px] tracking-[0.22em] text-leaf">LICENSE</dt><dd className="mt-1">MIT — açık kaynak</dd></div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-5 editorial text-[11px] tracking-[0.18em]">
          <a href="https://github.com/utkugrhn-source/fulcrum" target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-1 text-brass hover:text-cream">
            GITHUB <ExternalLink size={11} />
          </a>
          <a href="mailto:utkugrhn@gmail.com" className="inline-flex items-center gap-1 text-brass hover:text-cream">
            UTKUGRHN@GMAIL.COM <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 editorial text-[10.5px] tracking-[0.18em] text-ink-2 dark:text-leaf leading-relaxed">
        {lang === "tr"
          ? "Fulcrum bir literatür özet aracıdır, klinik karar verme aracı değildir. Tedavi kararları için her zaman tam metni okuyun ve klinik bağlamı değerlendirin."
          : "Fulcrum is a literature digest, not a clinical decision tool. Always read the full text and evaluate the clinical context before any treatment decision."}
      </div>
    </div>
  );
}
