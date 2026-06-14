-- Fulcrum — seed the orthopaedic subspecialty taxonomy (11 buckets).
insert into public.subspecialties (slug, name_en, name_tr, display_order) values
  ('trauma',         'Trauma',                       'Travma',                          10),
  ('sports',         'Sports Medicine',              'Spor Hekimliği',                  20),
  ('arthroplasty',   'Arthroplasty',                 'Artroplasti',                     30),
  ('spine',          'Spine',                        'Omurga',                          40),
  ('pediatric',      'Pediatric Orthopaedics',       'Pediatrik Ortopedi',              50),
  ('hand-upper',     'Hand & Upper Extremity',       'El ve Üst Ekstremite',            60),
  ('foot-ankle',     'Foot & Ankle',                 'Ayak ve Ayak Bileği',             70),
  ('shoulder-elbow', 'Shoulder & Elbow',             'Omuz ve Dirsek',                  80),
  ('onc',            'Musculoskeletal Oncology',     'Kas-İskelet Tümörleri',           90),
  ('basic',          'Basic Science',                'Temel Bilim',                    100),
  ('general',        'General Orthopaedics',         'Genel Ortopedi',                 110)
on conflict (slug) do update set
  name_en       = excluded.name_en,
  name_tr       = excluded.name_tr,
  display_order = excluded.display_order;
