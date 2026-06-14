#!/usr/bin/env tsx
// Run the full pipeline locally (requires .env with Supabase service-role key).
// Usage: npm run ingest:local -- [--days 2] [--max 200] [--dry]

import { runPipeline } from "../api/_lib/pipeline.js";

function parseArgs() {
  const argv = process.argv.slice(2);
  let days = 2, max = 200, dry = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--days") days = parseInt(argv[++i], 10);
    if (argv[i] === "--max")  max  = parseInt(argv[++i], 10);
    if (argv[i] === "--dry")  dry  = true;
  }
  return { days, max, dry };
}

const { days, max, dry } = parseArgs();
console.log(`[fulcrum ingest] reldays=${days} retmax=${max} dryRun=${dry}`);
runPipeline({ reldays: days, retmax: max, dryRun: dry, trigger: "manual" })
  .then((r) => {
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.errors.length > 0 ? 2 : 0);
  })
  .catch((err) => { console.error(err); process.exit(1); });
