#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dist = path.resolve(__dirname, '..', 'dist', 'public', 'assets');

// Allow values like "1500" or "1500kb" (case-insensitive); default to 400kb when unset/invalid.
const rawBudget = process.env.BUNDLE_BUDGET_KB || '400';
const match = String(rawBudget).match(/(\d+(?:\.\d+)?)/);
const BUDGET_KB = match ? Number(match[1]) : 400;

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

