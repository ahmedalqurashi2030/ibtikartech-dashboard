const fs = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || process.env.LIGHTHOUSE_OUTPUT || 'artifacts/release-qa/lighthouse');
if (!fs.existsSync(root)) throw new Error(`Lighthouse output directory not found: ${root}`);

const files = fs.readdirSync(root).filter((name) => name.endsWith('.json')).sort();
if (!files.length) throw new Error(`No Lighthouse JSON reports found in ${root}`);

const failures = [];
const rows = [];

for (const file of files) {
  const report = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const categories = report.categories || {};
  const audits = report.audits || {};
  const mobile = file.includes('-mobile.json');
  const contact = /contact-(?:mobile|desktop)\.json$/.test(file);
  const score = (id) => Number(categories[id]?.score ?? 0);
  const perf = score('performance');
  const a11y = score('accessibility');
  const best = score('best-practices');
  const seo = score('seo');
  const lcp = Number(audits['largest-contentful-paint']?.numericValue ?? Infinity);
  const cls = Number(audits['cumulative-layout-shift']?.numericValue ?? Infinity);
  const perfFloor = mobile ? 0.85 : 0.90;

  rows.push({ file, perf, a11y, best, seo, lcp, cls });

  if (perf < perfFloor) failures.push(`${file}: performance ${perf.toFixed(2)} < ${perfFloor.toFixed(2)}`);
  if (a11y < 0.95) failures.push(`${file}: accessibility ${a11y.toFixed(2)} < 0.95`);
  if (best < 0.95) failures.push(`${file}: best-practices ${best.toFixed(2)} < 0.95`);
  if (!contact && seo < 0.95) failures.push(`${file}: SEO ${seo.toFixed(2)} < 0.95`);
  if (lcp > 2500) failures.push(`${file}: lab LCP ${Math.round(lcp)}ms > 2500ms`);
  if (cls > 0.10) failures.push(`${file}: lab CLS ${cls.toFixed(3)} > 0.10`);
}

const summary = {
  generatedAt: new Date().toISOString(),
  reports: rows.length,
  budgets: {
    mobilePerformance: 0.85,
    desktopPerformance: 0.90,
    accessibility: 0.95,
    bestPractices: 0.95,
    seoIndexable: 0.95,
    labLcpMs: 2500,
    labCls: 0.10,
  },
  rows,
  failures,
};
fs.writeFileSync(path.join(root, 'SUMMARY.json'), `${JSON.stringify(summary, null, 2)}\n`);

for (const row of rows) {
  console.log(`• ${row.file}: P=${row.perf.toFixed(2)} A=${row.a11y.toFixed(2)} BP=${row.best.toFixed(2)} SEO=${row.seo.toFixed(2)} LCP=${Math.round(row.lcp)}ms CLS=${row.cls.toFixed(3)}`);
}

if (failures.length) {
  console.error(`\nLighthouse release budgets failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`✗ ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`\n✓ Lighthouse release budgets passed for ${rows.length} representative audits.`);
}
