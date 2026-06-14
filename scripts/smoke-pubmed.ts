#!/usr/bin/env tsx
// Smoke test: run a real PubMed esearch + efetch and print scored results.
// Usage: npm run smoke:pubmed -- [--days 2] [--max 30]
//
// Does NOT touch Supabase. Safe to run from any laptop with internet.

import { esearch, efetch } from "../api/_lib/pubmed.js";
import { buildJournalIndex, matchJournal } from "../api/_lib/journals.js";
import { classifySubspecialty } from "../api/_lib/subspecialty.js";
import { scoreArticle } from "../api/_lib/scoring.js";
import type { JournalRow } from "../api/_lib/types.js";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(): { days: number; max: number } {
  const argv = process.argv.slice(2);
  let days = 2, max = 30;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--days") days = parseInt(argv[++i], 10);
    if (argv[i] === "--max")  max  = parseInt(argv[++i], 10);
  }
  return { days, max };
}

// Parse the seed SQL into a tiny in-memory journal index so we can score
// without needing Supabase up.
function loadJournalsFromSeed(): JournalRow[] {
  const sqlPath = path.join(__dirname, "..", "supabase", "migrations", "0003_seed_journals.sql");
  const text = fs.readFileSync(sqlPath, "utf8");
  const rows: JournalRow[] = [];
  // Capture each "(...);" tuple inside the three "insert into ... values" blocks.
  const re = /\(\s*'([^']+)'\s*,\s*('([^']*)'|null)\s*,\s*('([^']*)'|null)\s*,\s*('([^']*)'|null)\s*,\s*(\d)\s*,\s*('([^']+)'|null)\s*\)/g;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    rows.push({
      id: `seed-${i++}`,
      title_full: m[1],
      title_iso: m[3] ?? null,
      issn_print: m[5] ?? null,
      issn_electronic: m[7] ?? null,
      tier: parseInt(m[8], 10) as 1 | 2 | 3,
      default_subspecialty: (m[10] ?? null) as JournalRow["default_subspecialty"],
    });
  }
  return rows;
}

async function main() {
  const { days, max } = parseArgs();
  console.log(`[fulcrum smoke] esearch reldays=${days} retmax=${max}`);

  const idList = await esearch({ reldays: days, retmax: max });
  console.log(`[fulcrum smoke] found ${idList.length} PMIDs`);
  if (idList.length === 0) {
    console.warn("No PMIDs returned. Try a wider --days window.");
    return;
  }

  const articles = await efetch(idList);
  console.log(`[fulcrum smoke] fetched ${articles.length} articles`);

  const journals = loadJournalsFromSeed();
  console.log(`[fulcrum smoke] loaded ${journals.length} journals from seed SQL`);
  const idx = buildJournalIndex(journals);
  const now = new Date();

  const scored = articles.map((a) => {
    const j = matchJournal(idx, { title_raw: a.journal_title_raw, iso: a.journal_iso, issn: a.issn });
    const cls = classifySubspecialty(a, j);
    const s = scoreArticle({ article: a, tier: j?.tier ?? null, now });
    return { a, j, cls, s };
  }).sort((x, y) => y.s.score - x.s.score);

  console.log("\n=== TOP 10 by score ===");
  for (const row of scored.slice(0, 10)) {
    const j = row.j?.title_iso ?? row.j?.title_full ?? row.a.journal_title_raw;
    const tier = row.j?.tier ?? "—";
    const type = row.a.publication_types[0] ?? "Article";
    console.log(
      `[${row.s.score.toString().padStart(6)}] ` +
      `T${tier}  ${row.cls.slug.padEnd(15)}  ${type.slice(0, 18).padEnd(18)}  ` +
      `${j.slice(0, 32).padEnd(32)}  ` +
      `${row.a.title.slice(0, 90)}`
    );
  }

  // Save raw output for inspection
  const out = path.join(__dirname, ".smoke-out");
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(
    path.join(out, "scored.json"),
    JSON.stringify(scored.slice(0, 50), null, 2)
  );
  console.log(`\n[fulcrum smoke] wrote top 50 to ${path.relative(process.cwd(), path.join(out, "scored.json"))}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
