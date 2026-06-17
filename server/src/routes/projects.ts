import { Router } from "express";
import { db, projectsTable } from "../db/index.js";
import { eq, and, asc, count, SQL } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { z } from "zod";

const router = Router();
const ProjectBody = z.object({
  title: z.string(), description: z.string(), category: z.string(),
  techTags: z.array(z.string()).optional(), thumbnailUrl: z.string().nullable().optional(),
  githubUrl: z.string().nullable().optional(), liveUrl: z.string().nullable().optional(),
  videoUrl: z.string().nullable().optional(), pdfUrl: z.string().nullable().optional(),
  published: z.boolean().optional(), order: z.number().optional(),
});

const map = (r: any) => ({ ...r, createdAt: r.createdAt.toISOString() });

router.get("/projects", async (req, res): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 6;
  const category = req.query.category as string | undefined;
  const published = req.query.published !== undefined ? req.query.published === "true" : undefined;
  const offset = (page - 1) * limit;
  const conditions: SQL[] = [];
  if (category) conditions.push(eq(projectsTable.category, category));
  if (published !== undefined) conditions.push(eq(projectsTable.published, published));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [rows, totalResult] = await Promise.all([
    db.select().from(projectsTable).where(where).orderBy(asc(projectsTable.order), asc(projectsTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(projectsTable).where(where),
  ]);
  const total = Number(totalResult[0]?.count ?? 0);
  res.json({ projects: rows.map(map), total, page, totalPages: Math.ceil(total / limit) });
});

router.post("/projects", requireAuth, async (req, res): Promise<void> => {
  const parsed = ProjectBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.insert(projectsTable).values(parsed.data).returning();
  res.status(201).json(map(row));
});

router.get("/projects/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(map(row));
});

router.put("/projects/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = ProjectBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.update(projectsTable).set(parsed.data).where(eq(projectsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(map(row));
});

router.delete("/projects/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.delete(projectsTable).where(eq(projectsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.sendStatus(204);
});

export default router;
