# Skorlama formülü

Bir makalenin skoru üç çarpanın çarpımıdır:

```
score = tier_weight × type_weight × recency_weight × 100
```

## Tier (dergi katmanı)

| Tier | Ağırlık | Tanım                                  | Örnek dergiler                            |
|------|---------|----------------------------------------|-------------------------------------------|
| 1    | 1.50    | Top-impact ortopedi + alan liderleri   | JBJS Am, BJJ, AJSM, Arthroscopy, KSSTA, JOR, OAC, Acta Orthop, Spine J, CORR |
| 2    | 1.10    | Güçlü yan dal / genel ortopedi          | Spine, ESJ, JSES, JHS, FAI, JPO, J Arthroplasty, Hip Int, JOT, Injury, Bone Joint Res, Int Orthop |
| 3    | 0.75    | Açık erişim / genel MSK                 | OJSM, JOSR, BMC Musculoskelet, JOS, Cureus, Indian J Orthop |
| —    | 0.50    | Tier listesinde olmayan dergiler        | (unknown)                                 |

Tier listesi tam olarak `supabase/migrations/0003_seed_journals.sql` içinde. Güncellemek için yeni satırlar ekle ya da `tier` alanını değiştir; `/api/score` veya `npm run ingest:local` koşturarak tüm tabloyu yeniden puanla.

## Type (MEDLINE Publication Type)

| Etiket                        | Ağırlık |
|-------------------------------|---------|
| Randomized Controlled Trial   | 1.50    |
| Meta-Analysis                 | 1.40    |
| Systematic Review             | 1.30    |
| Practice Guideline            | 1.25    |
| Guideline                     | 1.20    |
| Clinical Trial, Phase III     | 1.20    |
| Multicenter Study             | 1.10    |
| Clinical Trial                | 1.10    |
| Comparative Study             | 1.05    |
| Observational Study           | 1.00    |
| Journal Article (default)     | 0.95    |
| Review (narrative)            | 0.95    |
| Case Reports                  | 0.70    |
| Editorial                     | 0.60    |
| Letter / Comment              | 0.50    |
| Published Erratum             | 0.20    |

Bir makale birden fazla tag taşıdığında **en yüksek** ağırlık alınır (RCT + Multicenter Study → 1.50).

## Recency (güncellik)

`entrez_date` (PubMed'e eklenme) varsa kullanılır; yoksa `pub_date` fallback.

| Yaş     | Ağırlık                              |
|---------|--------------------------------------|
| 0–24h   | 1.50                                 |
| 1–3 gün | 1.30                                 |
| 3–7 gün | 1.20                                 |
| 7–30 gün| 1.00                                 |
| 30–90 g | doğrusal düşüş 0.85 → 0.40           |
| > 90 g  | 0.30                                 |

## Uç değer örnekleri

- **En üstte:** 24 saat içinde yayımlanan T1 dergideki RCT → 1.50 × 1.50 × 1.50 × 100 = **337.50**
- **Tipik T1 makale:** 1 haftalık T1 + Cohort → 1.50 × 1.00 × 1.20 × 100 = **180**
- **En altta:** 3 aylık T3 editorial → 0.75 × 0.60 × 0.30 × 100 = **13.50**
