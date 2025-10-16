/**
 * Static scan for potential layout reflow triggers
 *
 * Scans client/src for:
 *  - transition-all usage (can animate width/height -> layout)
 *  - layout reads: getBoundingClientRect, getComputedStyle, offsetWidth/Height, clientWidth/Height, scrollWidth/Height
 *  - scroll/resize listeners
 *
 * Usage:
 *   node scripts/reflow-static-scan.cjs
 *
 * Output:
 *   - reflow-reports/static-scan-<timestamp>.json
 *   - reflow-reports/static-scan-<timestamp>.md
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'client', 'src');
const REPORT_DIR = path.join(ROOT, 'reflow-reports');

function ensureDir(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {}
}

function nowTs() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

function listFiles(dir, filterExt = ['.tsx', '.ts', '.css', '.js', '.jsx']) {
  const out = [];
  function walk(p) {
    const ents = fs.readdirSync(p, { withFileTypes: true });
    for (const e of ents) {
      const full = path.join(p, e.name);
      if (e.isDirectory()) {
        walk(full);
      } else {
        const ext = path.extname(e.name);
        if (filterExt.includes(ext)) out.push(full);
      }
    }
  }
  if (fs.existsSync(dir)) walk(dir);
  return out;
}

function scanFile(file) {
  const source = fs.readFileSync(file, 'utf8');
  const lc = source.toLowerCase();

  const stats = {
    file,
    size: source.length,
    counts: {
      transitionAll: (lc.match(/transition-all/g) || []).length,
      getBoundingClientRect: (source.match(/getBoundingClientRect\s*\(/g) || []).length,
      getComputedStyle: (source.match(/getComputedStyle\s*\(/g) || []).length,
      offsetWidth: (source.match(/offsetWidth/g) || []).length,
      offsetHeight: (source.match(/offsetHeight/g) || []).length,
      clientWidth: (source.match(/clientWidth/g) || []).length,
      clientHeight: (source.match(/clientHeight/g) || []).length,
      scrollWidth: (source.match(/scrollWidth/g) || []).length,
      scrollHeight: (source.match(/scrollHeight/g) || []).length,
      addEventListenerScroll: (source.match(/addEventListener\s*\(\s*['"]scroll['"]/g) || []).length,
      addEventListenerResize: (source.match(/addEventListener\s*\(\s*['"]resize['"]/g) || []).length,
      onScroll: (source.match(/\bonScroll\s*=/g) || []).length,
      onResize: (source.match(/\bonResize\s*=/g) || []).length,
    },
  };
  return stats;
}

function markdown(results) {
  const lines = [];
  lines.push('# Static Scan for Layout Reflow Triggers');
  lines.push('');
  lines.push(`Scanned ${results.filesScanned} files.`);
  lines.push('');
  lines.push('## Files with transition-all');
  for (const f of results.topTransitionAll.slice(0, 20)) {
    lines.push(`- ${f.file} — transition-all: ${f.counts.transitionAll}`);
  }
  if (!results.topTransitionAll.length) lines.push('- none');

  lines.push('');
  lines.push('## Files with layout reads');
  for (const f of results.topLayoutReads.slice(0, 20)) {
    const c = f.counts;
    lines.push(`- ${f.file} — gBCR:${c.getBoundingClientRect}, GCS:${c.getComputedStyle}, offW:${c.offsetWidth}, offH:${c.offsetHeight}, cW:${c.clientWidth}, cH:${c.clientHeight}, sW:${c.scrollWidth}, sH:${c.scrollHeight}`);
  }
  if (!results.topLayoutReads.length) lines.push('- none');

  lines.push('');
  lines.push('## Scroll/Resize listeners');
  for (const f of results.topEventListeners.slice(0, 20)) {
    lines.push(`- ${f.file} — scroll listeners:${f.counts.addEventListenerScroll + f.counts.onScroll}, resize listeners:${f.counts.addEventListenerResize + f.counts.onResize}`);
  }
  if (!results.topEventListeners.length) lines.push('- none');

  lines.push('');
  lines.push('## Recommendations');
  lines.push('- Replace transition-all with more specific transition classes (transition-colors, transition-opacity, transition-transform).');
  lines.push('- Throttle scroll/resize handlers (e.g., requestAnimationFrame or setTimeout at 100–200ms), or use CSS where possible.');
  lines.push('- Batch DOM writes, then read layout, or use requestAnimationFrame to separate writes from reads.');
  lines.push('- Prefer CSS transforms over animating width/height/left/top which trigger layout.');
  return lines.join('\n');
}

function main() {
  ensureDir(REPORT_DIR);
  const files = listFiles(SRC_DIR);
  const stats = files.map(scanFile);

  const topTransitionAll = stats
    .filter((s) => s.counts.transitionAll > 0)
    .sort((a, b) => b.counts.transitionAll - a.counts.transitionAll);

  const topLayoutReads = stats
    .filter(
      (s) =>
        s.counts.getBoundingClientRect +
          s.counts.getComputedStyle +
          s.counts.offsetWidth +
          s.counts.offsetHeight +
          s.counts.clientWidth +
          s.counts.clientHeight +
          s.counts.scrollWidth +
          s.counts.scrollHeight >
        0
    )
    .sort((a, b) => {
      const sum = (x) =>
        x.counts.getBoundingClientRect +
        x.counts.getComputedStyle +
        x.counts.offsetWidth +
        x.counts.offsetHeight +
        x.counts.clientWidth +
        x.counts.clientHeight +
        x.counts.scrollWidth +
        x.counts.scrollHeight;
      return sum(b) - sum(a);
    });

  const topEventListeners = stats
    .filter(
      (s) =>
        s.counts.addEventListenerScroll +
          s.counts.onScroll +
          s.counts.addEventListenerResize +
          s.counts.onResize >
        0
    )
    .sort((a, b) => {
      const sum = (x) =>
        x.counts.addEventListenerScroll + x.counts.onScroll + x.counts.addEventListenerResize + x.counts.onResize;
      return sum(b) - sum(a);
    });

  const ts = nowTs();
  const result = {
    filesScanned: files.length,
    topTransitionAll,
    topLayoutReads,
    topEventListeners,
  };

  const jsonPath = path.join(REPORT_DIR, `static-scan-${ts}.json`);
  const mdPath = path.join(REPORT_DIR, `static-scan-${ts}.md`);
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');
  fs.writeFileSync(mdPath, markdown(result), 'utf8');

  console.log('Static scan complete.');
  console.log('JSON report:', jsonPath);
  console.log('Markdown report:', mdPath);
}

if (require.main === module) {
  main();
}