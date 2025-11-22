import fs from "node:fs";
import path from "node:path";
import process from "node:process";

/**
 * Simple route parity check:
 * - Scans client source for hard-coded API URLs (e.g. "/api/user/privacy-settings").
 * - Scans Worker (src/index.ts) for router.* definitions.
 * - Fails if any client-used static "/api/..." path has no corresponding Worker route.
 *
 * This is intentionally conservative:
 * - Only checks static string paths, not template strings or dynamically built URLs.
 * - Designed to catch obvious mismatches where a new client API endpoint
 *   has no Worker implementation.
 */

function collectFiles(dir, exts) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, exts));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (exts.has(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function extractClientRoutesFromSource(source) {
  const routes = new Set();

  // getApiPath("/api/...")
  {
    const re = /getApiPath\(\s*["'`](\/api\/[^"'`]+)["'`]\s*\)/g;
    let match;
    while ((match = re.exec(source)) !== null) {
      routes.add(match[1]);
    }
  }

  // apiRequest("/api/...") and apiRequest<...>("/api/...")
  {
    const re = /apiRequest(?:<[^>]*>)?\(\s*["'`](\/api\/[^"'`]+)["'`]/g;
    let match;
    while ((match = re.exec(source)) !== null) {
      routes.add(match[1]);
    }
  }

  // fetch("/api/...") – only direct literal URLs
  {
    const re = /fetch\(\s*["'`](\/api\/[^"'`]+)["'`]/g;
    let match;
    while ((match = re.exec(source)) !== null) {
      routes.add(match[1]);
    }
  }

  return routes;
}

function collectClientRoutes(rootDir) {
  const clientSrcDir = path.join(rootDir, "client", "src");
  const exts = new Set([".ts", ".tsx"]);
  const files = collectFiles(clientSrcDir, exts);
  const routes = new Set();

  for (const file of files) {
    let src;
    try {
      src = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const fileRoutes = extractClientRoutesFromSource(src);
    for (const r of fileRoutes) {
      routes.add(r);
    }
  }

  return routes;
}

function collectWorkerRoutes(rootDir) {
  const workerFile = path.join(rootDir, "src", "index.ts");
  if (!fs.existsSync(workerFile)) {
    return new Set();
  }

  let src;
  try {
    src = fs.readFileSync(workerFile, "utf8");
  } catch {
    return new Set();
  }

  const routes = new Set();
  const re = /router\.(get|post|patch|delete|all)\(\s*["'`](\/[^"'`]+)["'`]/g;
  let match;
  while ((match = re.exec(src)) !== null) {
    routes.add(match[2]);
  }

  return routes;
}

function main() {
  const rootDir = process.cwd();

  const clientRoutes = collectClientRoutes(rootDir);
  if (clientRoutes.size === 0) {
    console.log("[route-parity] No client /api routes found; skipping check.");
    return;
  }

  const workerRoutes = collectWorkerRoutes(rootDir);
  if (workerRoutes.size === 0) {
    console.error(
      "[route-parity] No Worker routes found in src/index.ts; cannot validate parity."
    );
    process.exit(1);
  }

  const missing = [];

  for (const route of clientRoutes) {
    // Only check obvious static routes; skip if they look parameterised or dynamic
    if (route.includes("${")) continue;

    const exact = workerRoutes.has(route);
    const withoutTrailingSlash =
      route.endsWith("/") && workerRoutes.has(route.slice(0, -1));
    const withTrailingSlash =
      !route.endsWith("/") && workerRoutes.has(`${route}/`);

    if (!exact && !withoutTrailingSlash && !withTrailingSlash) {
      missing.push(route);
    }
  }

  if (missing.length > 0) {
    console.error(
      "[route-parity] The following client-used API routes have no matching Worker route in src/index.ts:"
    );
    for (const r of missing) {
      console.error(`  - ${r}`);
    }
    console.error(
      "[route-parity] Please add matching router.get/router.post/router.patch/router.delete handlers in the Worker."
    );
    process.exit(1);
  }

  console.log(
    `[route-parity] OK: all static client /api routes (${clientRoutes.size}) have matching Worker routes (${workerRoutes.size}).`
  );
}

main();