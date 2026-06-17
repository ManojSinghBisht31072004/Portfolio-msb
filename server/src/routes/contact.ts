import { Router } from "express";
import { db, messagesTable } from "../db/index.js";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { z } from "zod";

const router = Router();
const ContactBody = z.object({ name: z.string(), email: z.string().email(), message: z.string() });

const rateLimitMap = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 3;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) ?? []).filter(t => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS) return false;
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

const map = (r: any) => ({ ...r, createdAt: r.createdAt.toISOString() });

router.post("/contact", async (req, res): Promise<void> => {
  const ip = (req.headers["x-forwarded-for"] as string) ?? req.socket.remoteAddress ?? "unknown";
  if (!checkRateLimit(ip)) { res.status(429).json({ error: "Too many requests. Try again later." }); return; }
  const parsed = ContactBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.insert(messagesTable).values(parsed.data).returning();
  res.status(201).json(map(row));
});

router.get("/messages", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db.select().from(messagesTable).orderBy(desc(messagesTable.createdAt));
  res.json(rows.map(map));
});

router.patch("/messages/:id/read", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [existing] = await db.select().from(messagesTable).where(eq(messagesTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  const [row] = await db.update(messagesTable).set({ read: !existing.read }).where(eq(messagesTable.id, id)).returning();
  res.json(map(row));
});

router.delete("/messages/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.delete(messagesTable).where(eq(messagesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.sendStatus(204);
});

export default router;
