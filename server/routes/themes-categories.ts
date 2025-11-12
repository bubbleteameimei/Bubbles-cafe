import { Router } from "express";
import { db } from "../db";
import { themeCategories } from "@shared/schema";
import { asc, eq } from "drizzle-orm";

const router = Router();

/**
 * GET /api/themes/categories
 * Returns active theme categories with label and icon, ordered by sortOrder then label.
 */
router.get("/categories", async (_req, res) => {
  try {
    const rows = await db
      .select({
        key: themeCategories.key,
        label: themeCategories.label,
        icon: themeCategories.icon,
        sortOrder: themeCategories.sortOrder,
        isActive: themeCategories.isActive,
      })
      .from(themeCategories)
      .where(eq(themeCategories.isActive, true))
      .orderBy(asc(themeCategories.sortOrder), asc(themeCategories.label));

    return res.json({
      categories: rows.map((r: any) => ({
        key: String(r.key),
        label: String(r.label),
        icon: r.icon ? String(r.icon) : null,
        sortOrder: Number(r.sortOrder ?? 0),
      })),
      total: rows.length,
      source: "db",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: "Failed to load theme categories", detail: msg });
  }
});

export default router;