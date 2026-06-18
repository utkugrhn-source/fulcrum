import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Weight reference: keep in sync with api/_lib/scoring.ts
const OCEBM_TABLE: Array<{ type_en: string; type_tr: string; level: string; weight: number }> = [
  { type_en: "Meta-Analysis",                level: "1a", weight: 1.30, type_tr: "Meta-analiz" },
  { type_en: "Systematic Review",            level: "1a", weight: 1.25, type_tr: "Sistematik derleme" },
  { type_en: "Practice Guideline",           level: "1a", weight: 1.15, type_tr: "Klinik rehber" },
  { type_en: "Randomized Controlled Trial",  level: "1b", weight: 1.20, type_tr: "Randomize kontrollü çalışma" },
  { type_en: "Clinical Trial",               level: "2b", weight: 1.10, type_tr: "Klinik çalışma" },
  { type_en: "Multicenter Study",            level: "2b", weight: 1.05, type_tr: "Çok merkezli çalışma" },
  { type_en: "Observational Study",          level: "2b", weight: 1.00, type_tr: "Gözlemsel çalışma" },
  { type_en: "Comparative Study",            level: "3",  weight: 1.05, type_tr: "Karşılaştırmalı çalışma" },
  { type_en: "Review",                       level: "—",  weight: 1.05, type_tr: "Derleme" },
  { type_en: "Case Reports",                 level: "4",  weight: 0.70, type_tr: "Olgu sunumu" },
  { type_en: "Editorial",                    level: "5",  weight: 0.60, type_tr: "Editör yazısı" },
  { type_en: "Letter",                       level: "5",  weight: 0.50, type_tr: "Mektup" },
];

export function Methodology() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("tr") ? "tr" : "en";

  const card       = "bg-cream-2 dark:bg-navy-2 border border-brass rounded-sm px-5 sm:px-7 py-6";
  const cardDark   = "bg-navy text-cream rounded-sm border-l-4 border-l-brass px-5 sm:px-7 py-6";
  const eyebrow    = "editorial text-[11px] tracking-[0.3em] text-blood font-medium";
  const sectionH   = "display text-[26px] sm:text-[32px] leading-tight text-navy dark:text-cream mt-10 mb-4";
  const para       = "body-serif text-[14.5px] text-ink dark:text-cream/80 leading-relaxed";
  const mono       = "font-mono text-[13.5px]";

  return (
    <div className="container-prose py-7 sm:py-10">
      <Link to="/" className="editorial text-[11px] tracking-[0.2em] text-blood hover:text-navy dark:hover:text-cream inline-flex items-center gap-1">
        <ArrowLeft size={14} /> {t("detail.back")}
      </Link>

      {/* Hero */}
      <header className="mt-5 pb-6 border-b border-brass">
        <div className={eyebrow}>{lang === "tr" ? "FULCRUM METODOLOJİSİ" : "FULCRUM METHODOLOGY"}</div>
        <h1 className="display text-[44px] sm:text-[56px] leading-none text-navy dark:text-cream mt-2">
          {lang === "tr" ? "Skorlama nasıl çalışır" : "How scoring works"}
        </h1>
        <p className={`${para} mt-4 max-w-2xl`}>
          {lang === "tr"
            ? "Fulcrum, PubMed ortopedi literatürünü her gün indirir, 11 yan dala dağıtır ve beş bileşenli bir formül ile sıralar: dergi etki faktörü, kanıt düzeyi, güncellik, örneklem büyüklüğü ve açık erişim. Aşağıda her bileşen ve hesap, kaynaklarıyla birlikte."
            : "Fulcrum ingests PubMed orthopaedic literature daily, classifies it across 11 subspecialties, and ranks it by a five-component formula: journal impact, evidence level, recency, sample size, and open access. Each component and its calculation are below, with sources."}
        </p>
      </header>

      {/* Formula */}
      <section className={`mt-7 ${cardDark}`}>
        <div className="editorial text-[10.5px] tracking-[0.3em] text-brass mb-3">
          {lang === "tr" ? "FORMÜL" : "THE FORMULA"}
        </div>
        <div className="font-mono text-cream text-[16px] sm:text-[19px] tracking-wide">
          score = <span className="text-brass">JIF</span> × <span className="text-brass">OCEBM</span> × <span className="text-brass">Recency</span> × <span className="text-brass">N</span> × <span className="text-brass">OA</span> × 100
        </div>
        <p className="editorial text-[10.5px] tracking-[0.18em] text-leaf mt-3 leading-relaxed">
          {lang === "tr"
            ? "Beş çarpan da [0, 2] aralığında. Tipik makale 30 – 120 arası skor alır, en yüksek değer ≈ 200."
            : "Each factor lives roughly in [0, 2]. A typical paper scores 30 – 120; the ceiling is around 200."}
        </p>
      </section>

      {/* JIF */}
      <h2 className={sectionH}>{lang === "tr" ? "1. Dergi etki faktörü (JIF)" : "1. Journal Impact Factor (JIF)"}</h2>
      <div className={card}>
        <p className={para}>
          {lang === "tr"
            ? "Her dergiye 2024 JCR Impact Factor değerine göre logaritmik bir ağırlık verilir. Eğri çok yüksek IF'lerin dominasyonunu engellemek için tasarlandı."
            : "Each journal gets a logarithmic weight based on its 2024 JCR Impact Factor. The curve is designed so very-high-IF journals don't dominate."}
        </p>
        <div className={`${mono} mt-3 text-blood`}>
          JIF<sub>w</sub> = clip(0.30 + 0.32 · log₂(IF + 1), 0.25, 1.50)
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[{if:1,w:0.62},{if:3,w:0.94},{if:5,w:1.13},{if:10,w:1.41}].map((r) => (
            <div key={r.if} className="bg-cream dark:bg-navy border border-brass/40 rounded-sm py-2.5">
              <div className="editorial text-[10px] tracking-[0.22em] text-ink-2 dark:text-leaf">IF {r.if}</div>
              <div className="font-mono text-blood text-[15px] mt-1">×{r.w.toFixed(2)}</div>
            </div>
          ))}
        </div>
        <p className="editorial text-[10.5px] tracking-[0.18em] text-ink-2 dark:text-leaf mt-4 leading-relaxed">
          {lang === "tr"
            ? "IF bilinmiyorsa katman bazlı yedek değer kullanılır (T1 ≈ 4.0, T2 ≈ 2.0, T3 ≈ 1.0). Kaynak: Clarivate JCR 2024."
            : "If IF is unknown, a tier-based proxy is used (T1 ≈ 4.0, T2 ≈ 2.0, T3 ≈ 1.0). Source: Clarivate JCR 2024."}
        </p>
      </div>

      {/* OCEBM */}
      <h2 className={sectionH}>{lang === "tr" ? "2. Kanıt düzeyi (OCEBM)" : "2. Evidence level (OCEBM)"}</h2>
      <div className={card}>
        <p className={para}>
          {lang === "tr"
            ? "PubMed MEDLINE yayın tipinden yola çıkarak makaleye bir Oxford Centre for Evidence-Based Medicine seviyesi atanır ve buna göre çarpan uygulanır."
            : "Each article's MEDLINE publication type maps to an Oxford Centre for Evidence-Based Medicine level, which sets the weight."}
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="editorial text-[10px] tracking-[0.22em] text-ink-2 dark:text-leaf border-b border-brass/40">
                <th className="py-2 pr-4">{lang === "tr" ? "YAYIN TİPİ" : "PUBLICATION TYPE"}</th>
                <th className="py-2 pr-4">OCEBM</th>
                <th className="py-2">{lang === "tr" ? "AĞIRLIK" : "WEIGHT"}</th>
              </tr>
            </thead>
            <tbody>
              {OCEBM_TABLE.map((r) => (
                <tr key={r.type_en} className="border-b border-brass/15">
                  <td className="py-2 pr-4 body-serif text-[14px] text-ink dark:text-cream">
                    {lang === "tr" ? r.type_tr : r.type_en}
                  </td>
                  <td className="py-2 pr-4 font-mono text-[13px] text-blood">{r.level}</td>
                  <td className="py-2 font-mono text-[13px] text-ink dark:text-cream">×{r.weight.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="editorial text-[10.5px] tracking-[0.18em] text-ink-2 dark:text-leaf mt-4 leading-relaxed">
          {lang === "tr"
            ? "Birden fazla tip varsa en yüksek ağırlıklı olan seçilir. Kaynak: OCEBM Levels of Evidence (March 2009)."
            : "When multiple types apply, the highest-weight match wins. Source: OCEBM Levels of Evidence (March 2009)."}
        </p>
      </div>

      {/* Recency */}
      <h2 className={sectionH}>{lang === "tr" ? "3. Güncellik" : "3. Recency"}</h2>
      <div className={card}>
        <p className={para}>
          {lang === "tr"
            ? "Eksponansiyel bozulma — yeni makaleler daha yüksek ağırlık alır, yaşlandıkça düşer. 14 günden eski makaleler hızla geriler."
            : "Exponential decay — fresh papers carry full weight, older ones fade. Anything past about 14 days drops off quickly."}
        </p>
        <div className={`${mono} mt-3 text-blood`}>
          Recency<sub>w</sub> = max(0.30, e<sup>−days / 14</sup>)
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[{d:1,w:0.93},{d:7,w:0.61},{d:14,w:0.37},{d:30,w:0.30}].map((r) => (
            <div key={r.d} className="bg-cream dark:bg-navy border border-brass/40 rounded-sm py-2.5">
              <div className="editorial text-[10px] tracking-[0.22em] text-ink-2 dark:text-leaf">{r.d}d</div>
              <div className="font-mono text-blood text-[15px] mt-1">×{r.w.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* N */}
      <h2 className={sectionH}>{lang === "tr" ? "4. Örneklem büyüklüğü (N)" : "4. Sample size (N)"}</h2>
      <div className={card}>
        <p className={para}>
          {lang === "tr"
            ? "Özetten regex ile çıkarılan örneklem büyüklüğü logaritmik bir bonus verir. N bilinmezse 1.00 olarak alınır."
            : "Sample size extracted from the abstract via regex gives a logarithmic bonus. Unknown N defaults to 1.00."}
        </p>
        <div className={`${mono} mt-3 text-blood`}>
          N<sub>w</sub> = clip(0.70 + 0.10 · log₁₀(N + 1), 0.80, 1.25)
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[{n:50,w:0.87},{n:500,w:0.97},{n:5000,w:1.07},{n:50000,w:1.17}].map((r) => (
            <div key={r.n} className="bg-cream dark:bg-navy border border-brass/40 rounded-sm py-2.5">
              <div className="editorial text-[10px] tracking-[0.22em] text-ink-2 dark:text-leaf">N = {r.n}</div>
              <div className="font-mono text-blood text-[15px] mt-1">×{r.w.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* OA */}
      <h2 className={sectionH}>{lang === "tr" ? "5. Açık erişim (OA)" : "5. Open access (OA)"}</h2>
      <div className={card}>
        <p className={para}>
          {lang === "tr"
            ? "PubMed ArticleIdList'inde PMC ID varsa makale halka açık erişimde demektir; %8'lik küçük bir bonus uygulanır."
            : "When PubMed exposes a PMC ID for the article, the paper is freely accessible; we apply a small 8% bonus."}
        </p>
        <div className={`${mono} mt-3 text-blood`}>
          OA<sub>w</sub> = PMC ID ? 1.08 : 1.00
        </div>
      </div>

      {/* Worked example */}
      <h2 className={sectionH}>{lang === "tr" ? "Örnek hesap" : "Worked example"}</h2>
      <div className={`${cardDark}`}>
        <div className="editorial text-[10.5px] tracking-[0.22em] text-brass mb-3">
          {lang === "tr"
            ? "T1 dergi · sistematik derleme · 3 gün önce · N = 1 200 · OA"
            : "T1 journal · systematic review · 3 days old · N = 1,200 · OA"}
        </div>
        <div className="font-mono text-[13.5px] text-cream leading-relaxed">
          score = 1.13 (IF 5) × 1.25 (SR) × 0.81 (3d) × 0.98 (N) × 1.08 (OA) × 100<br />
          <span className="text-brass">→ ≈ 121</span>
        </div>
      </div>

      <p className="editorial text-[10.5px] tracking-[0.22em] text-ink-2 dark:text-leaf mt-8 leading-relaxed">
        {lang === "tr"
          ? "Kaynaklar: PubMed E-utilities · Clarivate JCR 2024 · OCEBM Levels of Evidence (March 2009) · MEDLINE Publication Types."
          : "Sources: PubMed E-utilities · Clarivate JCR 2024 · OCEBM Levels of Evidence (March 2009) · MEDLINE Publication Types."}
      </p>
    </div>
  );
}
