import { Router } from "express";
import { db, postsTable } from "../db/index.js";
import { eq, and, ilike, desc, count, SQL } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { z } from "zod";

const router = Router();
const PostBody = z.object({
  title: z.string(), slug: z.string(), content: z.string(),
  tags: z.array(z.string()).optional(), published: z.boolean().optional(),
  coverImageUrl: z.string().nullable().optional(),
});

function estimateReadTime(content: string): number {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}
const map = (r: any) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() });
const mapList = (r: any) => { const { content: _c, ...rest } = map(r); return rest; };

router.get("/posts", async (req, res): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 6;
  const search = req.query.search as string | undefined;
  const published = req.query.published !== undefined ? req.query.published === "true" : undefined;
  const offset = (page - 1) * limit;
  const conditions: SQL[] = [];
  if (published !== undefined) conditions.push(eq(postsTable.published, published));
  if (search) conditions.push(ilike(postsTable.title, `%${search}%`));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [rows, totalResult] = await Promise.all([
    db.select().from(postsTable).where(where).orderBy(desc(postsTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(postsTable).where(where),
  ]);
  const total = Number(totalResult[0]?.count ?? 0);
  res.json({ posts: rows.map(mapList), total, page, totalPages: Math.ceil(total / limit) });
});

router.post("/posts", requireAuth, async (req, res): Promise<void> => {
  const parsed = PostBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const readTime = estimateReadTime(parsed.data.content);
  const [row] = await db.insert(postsTable).values({ ...parsed.data, readTime }).returning();
  res.status(201).json(map(row));
});

router.get("/posts/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.select().from(postsTable).where(eq(postsTable.id, id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(map(row));
});

router.put("/posts/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = PostBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.content) updates.readTime = estimateReadTime(parsed.data.content);
  const [row] = await db.update(postsTable).set(updates).where(eq(postsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(map(row));
});

router.delete("/posts/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.delete(postsTable).where(eq(postsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.sendStatus(204);
});

export default router;
