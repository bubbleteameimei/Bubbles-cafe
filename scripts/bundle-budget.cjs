#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dist = path.resolve(__dirname, '..', 'dist', 'public', 'assets');
const BUDGET_KB = Number(process.env.BUNDLE_BUDGET_KB || 400);

function getFiles(dir) {
  try { return fs.readdirSync(dir).map(f => path.join(dir, f)); } catch { return []; }
}

function human(n) { return `${(n/1024).toFixed(1)}kb`; }

const files = getFiles(dist).filter(f => /\.(js|css)$/i.test(f));
let fail = false;
for (const f of files) {
  const size = fs.statSync(f).size;
  if (size > BUDGET_KB * 1024) {
    console.error(`Bundle budget exceeded: ${path.basename(f)} = ${human(size)} > ${BUDGET_KB}kb`);
    fail = true;
  } else {
    console.log(`OK: ${path.basename(f)} = ${human(size)}`);
  }
}
if (fail) process.exit(1);
console.log('Bundle budget checks passed.');

