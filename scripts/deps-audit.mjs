import { exec } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: join(__dirname, '..') }, (err, stdout, stderr) => {
      if (err) return reject(Object.assign(err, { stderr, stdout }));
      resolve({ stdout, stderr });
    });
  });
}

async function loadPackageJson() {
  const pkg = await readFile(join(__dirname, '..', 'package.json'), 'utf8');
  return JSON.parse(pkg);
}

async function main() {
  console.log('=== Lightweight Dependency Audit ===');

  const pkg = await loadPackageJson();
  const directDeps = Object.keys(pkg.dependencies || {});
  const directDevDeps = Object.keys(pkg.devDependencies || {});

  // 1) npm outdated for overview
  try {
    const { stdout } = await run('npm outdated --json');
    const data = stdout ? JSON.parse(stdout) : {};
    const entries = Object.entries(data);
    if (entries.length === 0) {
      console.log('No outdated dependencies detected.');
    } else {
      console.log('\nOutdated dependencies:');
      for (const [name, info] of entries) {
        const current = info.current;
        const latest = info.latest;
        const wanted = info.wanted;
        console.log(`- ${name}: current=${current} wanted=${wanted} latest=${latest}`);
      }
    }
  } catch (e) {
    console.log('npm outdated failed or returned non-JSON output; continuing.');
  }

  // 2) Check deprecations for direct dependencies only
  async function checkDeprecated(name) {
    try {
      const { stdout } = await run(`npm view ${name} deprecated`);
      const msg = (stdout || '').trim();
      if (msg && msg !== 'undefined' && msg !== 'null') {
        return msg;
      }
    } catch {}
    return null;
  }

  const allDirect = [...directDeps, ...directDevDeps];
  const deprecatedDirect = [];

  for (const dep of allDirect) {
    const msg = await checkDeprecated(dep);
    if (msg) {
      deprecatedDirect.push({ name: dep, message: msg });
    }
  }

  if (deprecatedDirect.length > 0) {
    console.log('\nDeprecated direct dependencies:');
    for (const d of deprecatedDirect) {
      console.log(`- ${d.name}: ${d.message}`);
    }
  } else {
    console.log('\nNo deprecated direct dependencies detected.');
  }

  // 3) Summary
  console.log('\nAudit complete.');
  console.log('Tip: upgrade direct dependencies that pull old transitives to reduce deprecation noise.');
}

main().catch((err) => {
  console.error('Audit script failed:', err?.message || err);
  process.exit(1);
});