-- Fulcrum — seed the journal tier list.
-- Tiers reflect roughly 2024 JCR IF and ortho-specific reputation:
--   T1: top-impact orthopaedics + foundational subspecialty leaders
--   T2: strong subspecialty / general ortho journals
--   T3: broader open-access / general MSK
--
-- default_subspecialty:
--   set when a journal is dedicated; left NULL for generalist titles
--   (those get classified per-article from MeSH/title).

-- ============================================================================
-- TIER 1
-- ============================================================================
insert into public.journals (title_full, title_iso, issn_print, issn_electronic, tier, default_subspecialty) values
  ('The Journal of Bone and Joint Surgery. American Volume',           'J Bone Joint Surg Am',         '0021-9355', '1535-1386', 1, null),
  ('The Bone & Joint Journal',                                          'Bone Joint J',                 '2049-4394', '2049-4408', 1, null),
  ('The American Journal of Sports Medicine',                           'Am J Sports Med',              '0363-5465', '1552-3365', 1, 'sports'),
  ('Arthroscopy: The Journal of Arthroscopic and Related Surgery',      'Arthroscopy',                  '0749-8063', '1526-3231', 1, 'sports'),
  ('Osteoarthritis and Cartilage',                                      'Osteoarthritis Cartilage',     '1063-4584', '1522-9653', 1, 'basic'),
  ('The Spine Journal',                                                 'Spine J',                      '1529-9430', '1878-1632', 1, 'spine'),
  ('Acta Orthopaedica',                                                 'Acta Orthop',                  '1745-3674', '1745-3682', 1, null),
  ('Knee Surgery, Sports Traumatology, Arthroscopy',                    'Knee Surg Sports Traumatol Arthrosc', '0942-2056', '1433-7347', 1, 'sports'),
  ('Journal of Orthopaedic Research',                                   'J Orthop Res',                 '0736-0266', '1554-527X', 1, 'basic'),
  ('Clinical Orthopaedics and Related Research',                        'Clin Orthop Relat Res',        '0009-921X', '1528-1132', 1, null);

-- ============================================================================
-- TIER 2
-- ============================================================================
insert into public.journals (title_full, title_iso, issn_print, issn_electronic, tier, default_subspecialty) values
  ('Spine',                                                             'Spine (Phila Pa 1976)',        '0362-2436', '1528-1159', 2, 'spine'),
  ('European Spine Journal',                                            'Eur Spine J',                  '0940-6719', '1432-0932', 2, 'spine'),
  ('Journal of Shoulder and Elbow Surgery',                             'J Shoulder Elbow Surg',        '1058-2746', '1532-6500', 2, 'shoulder-elbow'),
  ('The Journal of Hand Surgery',                                       'J Hand Surg Am',               '0363-5023', '1531-6564', 2, 'hand-upper'),
  ('Journal of Hand Surgery, European Volume',                          'J Hand Surg Eur Vol',          '1753-1934', '2043-6289', 2, 'hand-upper'),
  ('Foot & Ankle International',                                        'Foot Ankle Int',               '1071-1007', '1944-7876', 2, 'foot-ankle'),
  ('Journal of Pediatric Orthopaedics',                                 'J Pediatr Orthop',             '0271-6798', '1539-2570', 2, 'pediatric'),
  ('The Journal of Arthroplasty',                                       'J Arthroplasty',               '0883-5403', '1532-8406', 2, 'arthroplasty'),
  ('Hip International',                                                 'Hip Int',                      '1120-7000', '1724-6067', 2, 'arthroplasty'),
  ('Journal of Orthopaedic Trauma',                                     'J Orthop Trauma',              '0890-5339', '1531-2291', 2, 'trauma'),
  ('Injury',                                                            'Injury',                       '0020-1383', '1879-0267', 2, 'trauma'),
  ('Bone & Joint Research',                                             'Bone Joint Res',               null,        '2046-3758', 2, 'basic'),
  ('International Orthopaedics',                                        'Int Orthop',                   '0341-2695', '1432-5195', 2, null),
  ('The Knee',                                                          'Knee',                         '0968-0160', '1873-5800', 2, 'sports'),
  ('Skeletal Radiology',                                                'Skeletal Radiol',              '0364-2348', '1432-2161', 2, null),
  ('Sarcoma',                                                           'Sarcoma',                      '1357-714X', '1369-1643', 2, 'onc'),
  ('Journal of Bone Oncology',                                          'J Bone Oncol',                 null,        '2212-1374', 2, 'onc'),
  ('Journal of Surgical Oncology',                                      'J Surg Oncol',                 '0022-4790', '1096-9098', 2, 'onc');

-- ============================================================================
-- TIER 3
-- ============================================================================
insert into public.journals (title_full, title_iso, issn_print, issn_electronic, tier, default_subspecialty) values
  ('Orthopaedic Journal of Sports Medicine',                            'Orthop J Sports Med',          null,        '2325-9671', 3, 'sports'),
  ('Journal of Orthopaedic Surgery and Research',                       'J Orthop Surg Res',            null,        '1749-799X', 3, null),
  ('BMC Musculoskeletal Disorders',                                     'BMC Musculoskelet Disord',     null,        '1471-2474', 3, null),
  ('Journal of Orthopaedic Science',                                    'J Orthop Sci',                 '0949-2658', '1436-2023', 3, null),
  ('Indian Journal of Orthopaedics',                                    'Indian J Orthop',              '0019-5413', '1998-3727', 3, null),
  ('World Journal of Orthopedics',                                      'World J Orthop',               null,        '2218-5836', 3, null),
  ('Cureus',                                                            'Cureus',                       null,        '2168-8184', 3, null),
  ('Journal of Orthopaedic Surgery (Hong Kong)',                        'J Orthop Surg (Hong Kong)',    '1022-5536', '2309-4990', 3, null),
  ('Journal of Children''s Orthopaedics',                               'J Child Orthop',               '1863-2521', '1863-2548', 3, 'pediatric'),
  ('Shoulder & Elbow',                                                  'Shoulder Elbow',               '1758-5732', '1758-5740', 3, 'shoulder-elbow'),
  ('Hand',                                                              'Hand (N Y)',                   '1558-9447', '1558-9455', 3, 'hand-upper'),
  ('Foot & Ankle Surgery',                                              'Foot Ankle Surg',              '1268-7731', '1460-9584', 3, 'foot-ankle'),
  ('Journal of Shoulder and Elbow Arthroplasty',                        'J Shoulder Elbow Arthroplast', null,        '2471-5492', 3, 'shoulder-elbow'),
  ('Arthroplasty Today',                                                'Arthroplast Today',            null,        '2352-3441', 3, 'arthroplasty'),
  ('North American Spine Society Journal',                              'N Am Spine Soc J',             null,        '2666-5484', 3, 'spine'),
  ('JBJS Open Access',                                                  'JB JS Open Access',            null,        '2472-7245', 3, null);
