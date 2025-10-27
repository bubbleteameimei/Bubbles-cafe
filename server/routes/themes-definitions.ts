import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const KEY = "theme_definitions_overrides";
const CATEGORY = "themes";
const DESC = "Global theme definitions overrides (label/icon per theme key)";

const patchSchema = z.record(z.object({
  label: z.string().min(1).max(200).optional(),
  icon: z.string().min(1).max(200).optional(),
}));

const router = Router();

/**
 * GET /api/themes/definitions
 * Returns global theme definition overrides persisted in site_settings.
 */
router.get("/definitions", async (_req, res) => {
  try {
    const list = await storage.getSiteSettings();
    const row = list.find(s => String(s.key) === KEY);
    let overrides: Record<string, { label?: string; icon?: string }> = {};
    if (row && row.value) {
      try {
        const parsed = JSON.parse(String(row.value));
        if (parsed && typeof parsed === "object") {
          overrides = parsed;
        }
      } catch {}
    }
    return res.json({
      overrides,
      updatedAt: row?.updatedAt ?? null,
      source: "db",
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load theme definitions", detail: String((err as Error)?.message || err) });
  }
});

/**
 * PATCH /api/themes/definitions
 * Persist global theme definition overrides. Admin-only.
 */
router.patch("/definitions", requireAuth, requireAdmin, async (req, res) => {
  try {
    const parsed = patchSchema.parse(req.body ?? {});
    // Check if the setting exists
    const list = await storage.getSiteSettings();
    const exists = list.find(s => String(s.key) === KEY);

    if (exists) {
      await storage.updateSiteSetting(KEY, JSON.stringify(parsed));
    } else {
      // Insert new setting via direct db call (storage does not expose insert helper)
      const db = storage.getDb();
      const { siteSettings } = await import("../../shared/schema.js");
      await db.insert(siteSettings).values({
        key: KEY,
        value: JSON.stringify(parsed),
        category: CATEGORY,
        description: DESC,
      });
    }

    return res.json({ ok: true, overrides: parsed });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes("invalid")) {
      return res.status(400).json({ error: "Invalid payload", detail: msg });
    }
    return res.status(500).json({ error: "Failed to save theme definitions", detail: msg });
  }
});

export default router;