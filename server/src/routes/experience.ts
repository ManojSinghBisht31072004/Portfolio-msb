import { Router } from "express";
import { db, experienceTable } from "../db/index.js";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { z } from "zod";

const router = Router();
const ExperienceBody = z.object({
  company: z.string(), role: z.string(), startDate: z.string(), endDate: z.string(),
  location: z.string(), points: z.array(z.string()).optional(), order: z.number().optional(),
});

const map = (r: any) => ({ ...r, createdAt: r.createdAt.toISOString() });

router.get("/experience", async (_req, res): Promise<void> => {
  const rows = await db.select().from(experienceTable).orderBy(asc(experienceTable.order), asc(experienceTable.createdAt));
  res.json(rows.map(map));
});

router.post("/experience", requireAuth, async (req, res): Promise<void> => {
  const parsed = ExperienceBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.insert(experienceTable).values(parsed.data).returning();
  res.status(201).json(map(row));
});

router.get("/experience/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.select().from(experienceTable).where(eq(experienceTable.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(map(row));
});

router.put("/experience/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = ExperienceBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.update(experienceTable).set(parsed.data).where(eq(experienceTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(map(row));
});

router.delete("/experience/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.delete(experienceTable).where(eq(experienceTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.sendStatus(204);
});

export default router;
