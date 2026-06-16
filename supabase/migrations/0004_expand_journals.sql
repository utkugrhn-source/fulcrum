-- Fulcrum — expand journal coverage (44 → ~95) and add JCR Impact Factor column.
-- Run in Supabase SQL Editor.

-- =============================================================================
-- SCHEMA: add impact_factor column
-- =============================================================================
alter table public.journals
  add column if not exists impact_factor numeric(6,3);

create index if not exists journals_if_idx on public.journals(impact_factor desc nulls last);

-- =============================================================================
-- BACKFILL existing 44 journals with approximate 2024 JCR Impact Factors
-- =============================================================================
update public.journals set impact_factor = 5.4   where title_iso = 'J Bone Joint Surg Am';
update public.journals set impact_factor = 4.9   where title_iso = 'Bone Joint J';
update public.journals set impact_factor = 5.7   where title_iso = 'Am J Sports Med';
update public.journals set impact_factor = 4.5   where title_iso = 'Arthroscopy';
update public.journals set impact_factor = 7.1   where title_iso = 'Osteoarthritis Cartilage';
update public.journals set impact_factor = 4.2   where title_iso = 'Spine J';
update public.journals set impact_factor = 3.4   where title_iso = 'Acta Orthop';
update public.journals set impact_factor = 4.0   where title_iso = 'Knee Surg Sports Traumatol Arthrosc';
update public.journals set impact_factor = 2.7   where title_iso = 'J Orthop Res';
update public.journals set impact_factor = 3.5   where title_iso = 'Clin Orthop Relat Res';

update public.journals set impact_factor = 2.9   where title_iso = 'Spine (Phila Pa 1976)';
update public.journals set impact_factor = 2.6   where title_iso = 'Eur Spine J';
update public.journals set impact_factor = 3.1   where title_iso = 'J Shoulder Elbow Surg';
update public.journals set impact_factor = 2.4   where title_iso = 'J Hand Surg Am';
update public.journals set impact_factor = 1.5   where title_iso = 'J Hand Surg Eur Vol';
update public.journals set impact_factor = 2.3   where title_iso = 'Foot Ankle Int';
update public.journals set impact_factor = 1.7   where title_iso = 'J Pediatr Orthop';
update public.journals set impact_factor = 4.1   where title_iso = 'J Arthroplasty';
update public.journals set impact_factor = 1.3   where title_iso = 'Hip Int';
update public.journals set impact_factor = 2.0   where title_iso = 'J Orthop Trauma';
update public.journals set impact_factor = 2.8   where title_iso = 'Injury';
update public.journals set impact_factor = 3.0   where title_iso = 'Bone Joint Res';
update public.journals set impact_factor = 2.5   where title_iso = 'Int Orthop';
update public.journals set impact_factor = 2.0   where title_iso = 'Knee';
update public.journals set impact_factor = 2.0   where title_iso = 'Skeletal Radiol';
update public.journals set impact_factor = 1.4   where title_iso = 'Sarcoma';
update public.journals set impact_factor = 2.0   where title_iso = 'J Bone Oncol';
update public.journals set impact_factor = 2.0   where title_iso = 'J Surg Oncol';

update public.journals set impact_factor = 2.5   where title_iso = 'Orthop J Sports Med';
update public.journals set impact_factor = 2.5   where title_iso = 'J Orthop Surg Res';
update public.journals set impact_factor = 2.2   where title_iso = 'BMC Musculoskelet Disord';
update public.journals set impact_factor = 1.6   where title_iso = 'J Orthop Sci';
update public.journals set impact_factor = 1.2   where title_iso = 'Indian J Orthop';
update public.journals set impact_factor = 1.5   where title_iso = 'World J Orthop';
update public.journals set impact_factor = 1.0   where title_iso = 'Cureus';
update public.journals set impact_factor = 1.0   where title_iso = 'J Orthop Surg (Hong Kong)';
update public.journals set impact_factor = 1.3   where title_iso = 'J Child Orthop';
update public.journals set impact_factor = 1.0   where title_iso = 'Shoulder Elbow';
update public.journals set impact_factor = 1.7   where title_iso = 'Hand (N Y)';
update public.journals set impact_factor = 1.7   where title_iso = 'Foot Ankle Surg';
update public.journals set impact_factor = 1.5   where title_iso = 'Arthroplast Today';
update public.journals set impact_factor = 1.0   where title_iso = 'N Am Spine Soc J';
update public.journals set impact_factor = 1.5   where title_iso = 'JB JS Open Access';

-- =============================================================================
-- T1 EXPANSION (4 new high-impact journals)
-- =============================================================================
insert into public.journals (title_full, title_iso, issn_print, issn_electronic, tier, default_subspecialty, impact_factor) values
  ('British Journal of Sports Medicine',                                'Br J Sports Med',              '0306-3674', '1473-0480', 1, 'sports',   13.8),
  ('Sports Medicine',                                                   'Sports Med',                   '0112-1642', '1179-2035', 1, 'sports',   9.3),
  ('Journal of Orthopaedic Translation',                                'J Orthop Translat',            null,        '2214-031X', 1, 'basic',    6.6),
  ('Journal of Orthopaedic & Sports Physical Therapy',                  'J Orthop Sports Phys Ther',    '0190-6011', '1938-1344', 1, 'sports',   6.1)
on conflict do nothing;

-- =============================================================================
-- T2 EXPANSION (18 new subspecialty leaders + general)
-- =============================================================================
insert into public.journals (title_full, title_iso, issn_print, issn_electronic, tier, default_subspecialty, impact_factor) values
  ('The Journal of the American Academy of Orthopaedic Surgeons',       'J Am Acad Orthop Surg',        '1067-151X', '1940-5480', 2, null,            3.5),
  ('JBJS Reviews',                                                      'JBJS Rev',                     null,        '2329-9185', 2, null,            3.5),
  ('Orthopaedics & Traumatology: Surgery & Research',                   'Orthop Traumatol Surg Res',    '1877-0568', '1877-0568', 2, null,            2.5),
  ('Archives of Orthopaedic and Trauma Surgery',                        'Arch Orthop Trauma Surg',      '0936-8051', '1434-3916', 2, 'trauma',        3.0),
  ('Bone',                                                              'Bone',                         '8756-3282', '1873-2763', 2, 'basic',         4.0),
  ('Osteoporosis International',                                        'Osteoporos Int',               '0937-941X', '1433-2965', 2, 'basic',         4.0),
  ('Calcified Tissue International',                                    'Calcif Tissue Int',            '0171-967X', '1432-0827', 2, 'basic',         3.4),
  ('Cartilage',                                                         'Cartilage',                    '1947-6035', '1947-6043', 2, 'basic',         3.0),
  ('Connective Tissue Research',                                        'Connect Tissue Res',           '0300-8207', '1607-8438', 2, 'basic',         2.7),
  ('Sports Health',                                                     'Sports Health',                '1941-7381', '1941-0921', 2, 'sports',        3.6),
  ('The Journal of Knee Surgery',                                       'J Knee Surg',                  '1538-8506', '1938-2480', 2, 'sports',        2.0),
  ('Knee Surgery & Related Research',                                   'Knee Surg Relat Res',          '2234-0726', '2234-2451', 2, 'sports',        2.5),
  ('EFORT Open Reviews',                                                'EFORT Open Rev',               null,        '2058-5241', 2, null,            3.6),
  ('Bone Reports',                                                      'Bone Rep',                     null,        '2352-1872', 2, 'basic',         2.6),
  ('Spine Surgery and Related Research',                                'Spine Surg Relat Res',         null,        '2432-261X', 2, 'spine',         2.0),
  ('Hand Clinics',                                                      'Hand Clin',                    '0749-0712', '1558-1969', 2, 'hand-upper',    1.9),
  ('Foot and Ankle Clinics',                                            'Foot Ankle Clin',              '1083-7515', '1558-1934', 2, 'foot-ankle',    1.8),
  ('Journal of Pediatric Orthopaedics. Part B',                         'J Pediatr Orthop B',           '1060-152X', '1473-5865', 2, 'pediatric',     1.2),
  ('World Neurosurgery',                                                'World Neurosurg',              '1878-8750', '1878-8769', 2, 'spine',         2.0),
  ('JOR Spine',                                                         'JOR Spine',                    null,        '2572-1143', 2, 'spine',         3.5)
on conflict do nothing;

-- =============================================================================
-- T3 EXPANSION (30 open-access / general / case journals)
-- =============================================================================
insert into public.journals (title_full, title_iso, issn_print, issn_electronic, tier, default_subspecialty, impact_factor) values
  ('Bone & Joint Open',                                                 'Bone Jt Open',                 null,        '2633-1462', 3, null,            2.4),
  ('JSES International',                                                'JSES Int',                     null,        '2666-6383', 3, 'shoulder-elbow', 1.5),
  ('JSES Reviews, Reports, and Techniques',                             'JSES Rev Rep Tech',            null,        '2666-6391', 3, 'shoulder-elbow', 1.2),
  ('Arthroplasty',                                                      'Arthroplasty',                 null,        '2524-7948', 3, 'arthroplasty',  1.8),
  ('Annals of Joint',                                                   'Ann Joint',                    null,        '2415-6809', 3, null,            1.0),
  ('SICOT-J',                                                           'SICOT J',                      null,        '2426-8887', 3, null,            1.4),
  ('Journal of Experimental Orthopaedics',                              'J Exp Orthop',                 null,        '2197-1153', 3, 'basic',         2.0),
  ('Global Spine Journal',                                              'Global Spine J',               '2192-5682', '2192-5690', 3, 'spine',         2.6),
  ('Asian Spine Journal',                                               'Asian Spine J',                '1976-1902', '1976-7846', 3, 'spine',         2.7),
  ('Hand Surgery and Rehabilitation',                                   'Hand Surg Rehabil',            null,        '2468-1229', 3, 'hand-upper',    1.5),
  ('The Open Orthopaedics Journal',                                     'Open Orthop J',                null,        '1874-3250', 3, null,            0.5),
  ('Strategies in Trauma and Limb Reconstruction',                      'Strategies Trauma Limb Reconstr', '1828-8936', '1828-8928', 3, 'trauma',     0.7),
  ('Trauma Case Reports',                                               'Trauma Case Rep',              null,        '2352-6440', 3, 'trauma',        0.4),
  ('JBJS Case Connector',                                               'JBJS Case Connect',            null,        '2160-3251', 3, null,            0.5),
  ('Frontiers in Surgery',                                              'Front Surg',                   null,        '2296-875X', 3, null,            1.6),
  ('Frontiers in Pediatrics',                                           'Front Pediatr',                null,        '2296-2360', 3, 'pediatric',     2.5),
  ('Frontiers in Bioengineering and Biotechnology',                     'Front Bioeng Biotechnol',      null,        '2296-4185', 3, 'basic',         5.7),
  ('BMC Surgery',                                                       'BMC Surg',                     null,        '1471-2482', 3, null,            1.8),
  ('Journal of Clinical Orthopaedics and Trauma',                       'J Clin Orthop Trauma',         null,        '0976-5662', 3, 'trauma',        1.7),
  ('The Surgeon',                                                       'Surgeon',                      '1479-666X', '2405-5840', 3, null,            2.0),
  ('Orthopedics',                                                       'Orthopedics',                  '0147-7447', '1938-2367', 3, null,            1.4),
  ('Sports Medicine - Open',                                            'Sports Med Open',              null,        '2199-1170', 3, 'sports',        3.8),
  ('The Iowa Orthopaedic Journal',                                      'Iowa Orthop J',                '1541-5457', '1555-1377', 3, null,            0.5),
  ('SAGE Open Medicine',                                                'SAGE Open Med',                null,        '2050-3121', 3, null,            2.0),
  ('Medicine',                                                          'Medicine (Baltimore)',         '0025-7974', '1536-5964', 3, null,            1.5),
  ('Heliyon',                                                           'Heliyon',                      null,        '2405-8440', 3, null,            3.4),
  ('Skeletal Muscle',                                                   'Skelet Muscle',                null,        '2044-5040', 3, 'basic',         5.0),
  ('Journal of Orthopaedic Reports',                                    'J Orthop Rep',                 null,        '2773-157X', 3, null,            0.5),
  ('European Journal of Orthopaedic Surgery & Traumatology',            'Eur J Orthop Surg Traumatol',  '1633-8065', '1432-1068', 3, null,            1.7),
  ('Journal of Children''s Orthopaedics. Open',                         'J Child Orthop Open',          null,        '2210-0676', 3, 'pediatric',     1.0)
on conflict do nothing;

-- =============================================================================
-- VERIFY
-- =============================================================================
-- select tier, count(*) from public.journals group by tier order by tier;
-- select tier, round(avg(impact_factor)::numeric, 2) as avg_if from public.journals
--   where impact_factor is not null group by tier order by tier;
