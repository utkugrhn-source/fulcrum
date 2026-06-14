# Deploy rehberi

## 1. Supabase

1. https://supabase.com/dashboard → New project.
   - **Name:** `fulcrum`
   - **Region:** `Central EU (Frankfurt)` — Türkiye'ye en yakın gecikme.
   - **DB password:** güçlü, password manager'a kaydet.
2. SQL Editor → "New query" → sırayla yapıştırıp çalıştır:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_seed_subspecialties.sql`
   - `supabase/migrations/0003_seed_journals.sql`
3. Project Settings → API:
   - **Project URL** → `SUPABASE_URL` ve `VITE_SUPABASE_URL`
   - **anon (public)** → `VITE_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` *(gizli, sadece sunucuda)*

## 2. NCBI API anahtarı (opsiyonel ama önerilir)

https://www.ncbi.nlm.nih.gov/account/settings/ → API Key Management
- Anahtarsız: 3 req/s
- Anahtarlı: 10 req/s

Çıkan değeri `NCBI_API_KEY` olarak Vercel env'e ekle.

## 3. GitHub repo

```bash
cd C:\Users\Hp\Documents\fulcrum
git init
git add .
git commit -m "feat: initial fulcrum scaffold"
git branch -M main
git remote add origin git@github.com:utkugrhn-source/fulcrum.git
git push -u origin main
```

## 4. Vercel

1. https://vercel.com/new → GitHub repo'yu import et.
2. **Framework preset:** Vite (otomatik algılanır).
3. **Environment Variables** (Production + Preview):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NCBI_API_KEY` (opsiyonel)
   - `NCBI_TOOL=fulcrum`
   - `NCBI_EMAIL=utkugrhn@gmail.com`
   - `CRON_SECRET` — `openssl rand -hex 24` ile üret
4. Deploy. İlk build ~1.5 dk.

## 5. Domain

1. Vercel project → Settings → Domains → `fulcrum.cyprusorthopaedics.com` ekle.
2. DNS sağlayıcında CNAME:
   ```
   fulcrum  CNAME  cname.vercel-dns.com.
   ```
3. SSL otomatik gelir (Let's Encrypt).

## 6. İlk veriyi çek

Vercel deploy tamamlandıktan sonra, tarayıcıdan **bir defa**:

```
https://fulcrum.cyprusorthopaedics.com/api/cron-daily?token=<CRON_SECRET>
```

JSON `{ "ok": true, "fetched": N, "upserted": N, ... }` dönerse cron hattı çalışıyordur. Sonrasında Vercel Cron her sabah 06:00 UTC'de aynı endpoint'i çağıracak (`vercel.json` içinde tanımlı).

## 7. Doğrulama

- Supabase → Table editor → `articles` tablosunda satırlar görünmeli.
- `scoring_runs` tablosunda son çalıştırma `ok = true` olmalı.
- `fulcrum.cyprusorthopaedics.com` ana sayfasında skora göre sıralı liste görünmeli.

## 8. Olası sorunlar

- **401 unauthorized** → `CRON_SECRET` eksik veya yanlış. URL'de `?token=` parametresini, veya `Authorization: Bearer …` header'ını doğrula.
- **PubMed timeout** → NCBI gece güncellemesi yapıyor olabilir (UTC 22:00–02:00). Cron'u 06:00 UTC tutarsan çakışmaz.
- **Supabase RLS hatası** → `articles` ve `subspecialties` policy'lerinin `for select using (true)` olduğundan emin ol; `0001_init.sql` bunu zaten yapar.
