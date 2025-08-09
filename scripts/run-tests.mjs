#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getTestFiles() {
  const cwd = path.resolve(__dirname, '..');
  const all = fs.readdirSync(cwd);
  return all.filter(f => /^test-.*\.(mjs|js)$/i.test(f)).map(f => path.join(cwd, f));
}

const testFiles = getTestFiles();
if (testFiles.length === 0) {
  console.log('[test-runner] No test files found.');
  process.exit(0);
}

let failed = 0;
for (const file of testFiles) {
  console.log(`\n[test-runner] Running ${path.basename(file)} ...`);
  const res = spawnSync('node', ['--experimental-json-modules', '--no-warnings', file], {
    stdio: 'inherit'
  });
  if (res.status !== 0) {
    console.error(`[test-runner] ${path.basename(file)} failed with code ${res.status}`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n[test-runner] ${failed} test(s) failed.`);
  process.exit(1);
}
console.log('\n[test-runner] All tests passed.');