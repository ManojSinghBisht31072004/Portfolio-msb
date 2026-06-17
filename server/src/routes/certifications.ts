import { Router } from "express";
import { db, certificationsTable } from "../db/index.js";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { z } from "zod";

const router = Router();
const CertBody = z.object({
  name: z.string(), issuer: z.string(), date: z.string(),
  credentialUrl: z.string().nullable().optional(), badgeUrl: z.string().nullable().optional(),
  order: z.number().optional(),
});
const map = (r: any) => ({ ...r, createdAt: r.createdAt.toISOString() });

router.get("/certifications", async (_req, res): Promise<void> => {
  const rows = await db.select().from(certificationsTable).orderBy(asc(certificationsTable.order), asc(certificationsTable.createdAt));
  res.json(rows.map(map));
});

router.post("/certifications", requireAuth, async (req, res): Promise<void> => {
  const parsed = CertBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.insert(certificationsTable).values(parsed.data).returning();
  res.status(201).json(map(row));
});

router.get("/certifications/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.select().from(certificationsTable).where(eq(certificationsTable.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(map(row));
});

router.put("/certifications/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = CertBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.update(certificationsTable).set(parsed.data).where(eq(certificationsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(map(row));
});

router.delete("/certifications/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.delete(certificationsTable).where(eq(certificationsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.sendStatus(204);
});

export default router;
