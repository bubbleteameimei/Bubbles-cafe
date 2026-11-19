import fs from "node:fs";
import path from "node:path";
import process from "node:process";

/**
 * Route parity check: client  ->  Express API (server/, deployed on Render).
 *
 * - Scans client/src for static "/api/..." URLs passed to getApiPath / apiRequest / fetch.
 * - Scans server/index.ts for app.<method>("/api/...") and app.use("/api/x", registerXRoutes()),
 *   then scans each server/routes/*.ts file for router.<method>("/...") and joins the prefix.
 * - Matches with Express-style ":param" segments.
 * - Fails if a client-used static path has no matching Express route.
 *
 * Set ROUTE_PARITY_WARN_ONLY=1 to report without failing.
 */

const ROOT = process.cwd();

function collectFiles(dir, exts) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...collectFiles(p, exts));
    else if (exts.has(path.extname(e.name).toLowerCase())) out.push(p);
  }
  return out;
}

function normalize(route) {
  let p = route.split(/[?#]/)[0].trim();
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

/**
 * Turn a template-literal path into a concrete sample path:
 *   `/api/feedback/${id}/status` -> /api/feedback/X/status
 *   `/api/feedback${params}`     -> /api/feedback   (query-string interpolation)
 *   `/api/posts/${id}/${flag ? 'a' : 'b'}` -> /api/posts/X/X
 */
function templateToPath(raw) {
  if (!raw.includes("${")) return raw;
  // An unterminated "${..." means the regex stopped at a nested backtick; drop it.
  const closed = raw.replace(/\$\{[^}]*$/, "");
  const replaced = closed.replace(/\$\{[^}]*\}/g, "\u0000");
  return replaced
    .split("/")
    .map((seg) => (seg === "\u0000" ? "X" : seg.replace(/\u0000.*$/, "")))
    .join("/");
}

function collectClientRoutes() {
  const patterns = [
    /getApiPath\(\s*["'`](\/api\/[^"'`]+)["'`]\s*\)/g,
    /apiRequest(?:<[^>]*>)?\(\s*["'`](\/api\/[^"'`]+)["'`]/g,
    /(?:fetch|getJson)(?:<[^>]*>)?\(\s*["'`](\/api\/[^"'`]+)["'`]/g,
    // apiJson('POST', '/api/...') and apiRequest('PATCH', '/api/...') (method-first helpers)
    /(?:apiJson|apiRequest)(?:<[^>]*>)?\(\s*["'`][A-Z]+["'`]\s*,\s*["'`](\/api\/[^"'`]+)["'`]/g,
  ];
  const routes = new Map(); // normalized -> Set(files)
  for (const file of collectFiles(path.join(ROOT, "client", "src"), new Set([".ts", ".tsx"]))) {
    if (/\.test\.tsx?$/.test(file)) continue;
    const src = fs.readFileSync(file, "utf8");
    for (const re of patterns) {
      for (const m of src.matchAll(re)) {
        const n = normalize(templateToPath(m[1]));
        if (!n) continue;
        if (!routes.has(n)) routes.set(n, new Set());
        routes.get(n).add(path.relative(ROOT, file));
      }
    }
  }
  return routes;
}

function collectServerRoutes() {
  const indexPath = path.join(ROOT, "server", "index.ts");
  const indexSrc = fs.readFileSync(indexPath, "utf8");
  const routes = new Set();

  for (const m of indexSrc.matchAll(/app\.(?:get|post|patch|put|delete|all)\(\s*["'`](\/api\/[^"'`]+)["'`]/g)) {
    routes.add(normalize(m[1]));
  }

  // Map registerXRoutes -> module file via import statements
  const importMap = new Map();
  for (const m of indexSrc.matchAll(/import\s*\{([^}]*)\}\s*from\s*["'](\.\/routes\/[^"']+)["']/g)) {
    for (const name of m[1].split(",").map((n) => n.trim()).filter((n) => n.startsWith("register"))) {
      importMap.set(name, m[2]);
    }
  }

  for (const m of indexSrc.matchAll(/app\.use\(\s*["'`](\/api[^"'`]*)["'`]\s*,\s*(register\w+)\(\)/g)) {
    const prefix = m[1];
    const rel = importMap.get(m[2]);
    if (!rel) continue;
    const file = path.join(ROOT, "server", rel.replace(/^\.\//, "") + (rel.endsWith(".ts") ? "" : ".ts"));
    if (!fs.existsSync(file)) continue;
    const src = fs.readFileSync(file, "utf8");
    for (const r of src.matchAll(/router\.(?:get|post|patch|put|delete|all)\(\s*["'`](\/[^"'`]*)["'`]/g)) {
      routes.add(normalize(prefix + (r[1] === "/" ? "" : r[1])));
    }
  }
  return routes;
}

function toRegex(route) {
  const parts = route.split("/").map((seg) => {
    if (!seg.startsWith(":")) return seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const constrained = seg.match(/^:\w+\((.+)\)$/); // e.g. :action(publish|unpublish)
    // "X" is the placeholder for a client-side ${...} segment, which could be any allowed value.
    return constrained ? `(?:${constrained[1]}|X)` : "[^/]+";
  });
  return new RegExp("^" + parts.join("/") + "$");
}

function main() {
  const client = collectClientRoutes();
  if (client.size === 0) {
    console.log("[route-parity] No client /api routes found; skipping.");
    return;
  }
  const server = [...collectServerRoutes()];
  if (server.length === 0) {
    console.error("[route-parity] No Express routes found in server/; cannot validate.");
    process.exit(1);
  }
  const matchers = server.map(toRegex);

  const missing = [];
  for (const [route, files] of client) {
    if (!matchers.some((re) => re.test(route))) missing.push([route, files]);
  }

  if (missing.length) {
    console.error(`[route-parity] ${missing.length} client API route(s) have no Express handler:`);
    for (const [r, files] of missing.sort()) console.error(`  - ${r}   (${[...files].join(", ")})`);
    if (process.env.ROUTE_PARITY_WARN_ONLY === "1") return;
    process.exit(1);
  }
  console.log(`[route-parity] OK: ${client.size} client routes all match ${server.length} Express routes.`);
}

main();
