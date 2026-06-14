# Fulcrum

> Günlük ortopedi literatürü, sıralanmış. — EM Pulse esinli.

Fulcrum, PubMed'in son 48 saatlik ortopedi yayınlarını çekip dergi katmanı, çalışma tipi ve güncellik üzerinden bir skorla sıralayan açık web aracıdır. EM Pulse'un acil tıp versiyonunun ortopedi adaptasyonu olarak yazılmıştır.

## Stack

- **Frontend:** Vite + React 18 + TypeScript + TailwindCSS + react-i18next (TR/EN UI)
- **Backend:** Vercel serverless functions (`/api/*`)
- **DB:** Supabase (Postgres, Frankfurt EU)
- **Cron:** Vercel Cron Jobs (günlük 06:00 UTC)
- **Veri kaynağı:** PubMed E-utilities (esearch + efetch)

## Hızlı başlangıç (lokal)

```bash
# 1) Bağımlılıklar
npm install

# 2) .env oluştur
cp .env.example .env
# .env içine Supabase anahtarlarını yaz

# 3) PubMed smoke testi (Supabase gerektirmez)
npm run smoke:pubmed -- --days 2 --max 30

# 4) Dev sunucu
npm run dev
# → http://localhost:5173
```

## Skorlama formülü

```
score = tier_weight × type_weight × recency_weight × 100
```

- **Tier:** T1 1.50 · T2 1.10 · T3 0.75 · unknown 0.50
- **Type:** RCT 1.50 · Meta 1.40 · Systematic Review 1.30 · Clinical Trial 1.10 · Cohort 1.00 · Editorial 0.60 · Letter 0.50
- **Recency:** 0-24h 1.50 · 1-3d 1.30 · 3-7d 1.20 · 7-30d 1.00 · 30-90d linear decay 0.85→0.40 · >90d 0.30

Detay: [`docs/SCORING.md`](docs/SCORING.md).

## Yan dal taksonomisi (11)

Travma · Spor Hekimliği · Artroplasti · Omurga · Pediatrik Ortopedi · El ve Üst Ekstremite · Ayak ve Ayak Bileği · Omuz ve Dirsek · Kas-İskelet Tümörleri · Temel Bilim · Genel Ortopedi

Sınıflandırma: dergi → MeSH headings → title keyword → "general". Detay: [`docs/TAXONOMY.md`](docs/TAXONOMY.md).

## Deploy

Tam adımlar: [`docs/DEPLOY.md`](docs/DEPLOY.md).

Kısa hâli:

1. Supabase projesi aç (region: `eu-central-1`, isim: `fulcrum`).
2. SQL editöründe `supabase/migrations/0001 → 0002 → 0003` sırasıyla çalıştır.
3. GitHub repo'sunu Vercel'e bağla, environment variable'ları ekle.
4. `fulcrum.cyprusorthopaedics.com` subdomain'i Vercel'e CNAME ile bağla.
5. İlk veri için Vercel Functions tab'ından `/api/cron-daily?token=<CRON_SECRET>` URL'sini bir kez çağır.

## Lisans

MIT. Veriler PubMed (NLM); kullanım NLM'in [terms](https://www.nlm.nih.gov/databases/download/terms_and_conditions.html) sayfasına tabi.
