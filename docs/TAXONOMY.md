# Yan dal taksonomisi

| Slug             | TR                          | EN                          |
|------------------|-----------------------------|-----------------------------|
| `trauma`         | Travma                      | Trauma                      |
| `sports`         | Spor Hekimliği              | Sports Medicine             |
| `arthroplasty`   | Artroplasti                 | Arthroplasty                |
| `spine`          | Omurga                      | Spine                       |
| `pediatric`      | Pediatrik Ortopedi          | Pediatric Orthopaedics      |
| `hand-upper`     | El ve Üst Ekstremite        | Hand & Upper Extremity      |
| `foot-ankle`     | Ayak ve Ayak Bileği         | Foot & Ankle                |
| `shoulder-elbow` | Omuz ve Dirsek              | Shoulder & Elbow            |
| `onc`            | Kas-İskelet Tümörleri       | Musculoskeletal Oncology    |
| `basic`          | Temel Bilim                 | Basic Science               |
| `general`        | Genel Ortopedi              | General Orthopaedics        |

## Sınıflandırma akışı

1. **Dergi → varsayılan yan dal.** Tema dergisi varsa (AJSM → sports, JPO → pediatric, JSES → shoulder-elbow vb.) doğrudan o slug atanır. `subspecialty_source = "journal"`.
2. **MeSH skoru.** Generalist dergi ise her dal için MeSH ve title eşleşmeleri sayılır (`+3` MeSH, `+1` title). En yüksek skorlu dal seçilir. `subspecialty_source = "mesh"` veya `"title"`.
3. **Fallback.** Hiçbir eşleşme yoksa `general` atanır. `subspecialty_source = "default"`.

Önceliklendirme (tie-break sırası): `onc` > `spine` > `pediatric` > `arthroplasty` > `trauma` > `sports` > `hand-upper` > `foot-ankle` > `shoulder-elbow` > `basic` > `general`.

Bu sıra cerrahi alt branş yoğunluğunu yansıtır — örneğin pediatrik spine kemik tümörü, ayak ankle tendinopatisi yerine `onc` etiketini alır.

## Yeni dal eklemek

1. `supabase/migrations/000N_add_subspecialty.sql` ile yeni satır insert et.
2. `api/_lib/types.ts → SubspecialtySlug` union'una ekle (TS, frontend ile de paylaşılıyor).
3. `api/_lib/subspecialty.ts → MESH_RULES` ve `PRIORITY` listelerini güncelle.
4. `src/types.ts` ve `src/locales/{en,tr}.json → subspecialties` blokları.
5. `/api/score` çağır → mevcut makaleleri yeniden sınıflandır.
