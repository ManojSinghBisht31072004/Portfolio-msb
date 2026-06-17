import { Router } from "express";
import { db, mediaTable } from "../db/index.js";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { z } from "zod";

const router = Router();
const MediaBody = z.object({
  type: z.string(), title: z.string(), url: z.string(),
  thumbnailUrl: z.string().nullable().optional(),
});
const map = (r: any) => ({ ...r, createdAt: r.createdAt.toISOString() });

router.get("/media", async (req, res): Promise<void> => {
  const type = req.query.type as string | undefined;
  const rows = type
    ? await db.select().from(mediaTable).where(eq(mediaTable.type, type)).orderBy(asc(mediaTable.createdAt))
    : await db.select().from(mediaTable).orderBy(asc(mediaTable.createdAt));
  res.json(rows.map(map));
});

router.post("/media", requireAuth, async (req, res): Promise<void> => {
  const parsed = MediaBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.insert(mediaTable).values(parsed.data).returning();
  res.status(201).json(map(row));
});

router.delete("/media/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.delete(mediaTable).where(eq(mediaTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.sendStatus(204);
});

export default router;
