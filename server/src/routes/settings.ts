import { Router } from "express";
import { db, settingsTable } from "../db/index.js";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { z } from "zod";

const router = Router();

const UpdateSettingsBody = z.object({
  heroName: z.string().optional(),
  heroRoles: z.array(z.string()).optional(),
  heroSubtext: z.string().optional(),
  resumeUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  contactEmail: z.string().optional(),
  aboutBio: z.string().optional(),
  profilePhotoUrl: z.string().nullable().optional(),
  availabilityStatus: z.string().optional(),
  skills: z.array(z.string()).optional(),
}).partial();

async function getOrCreateSettings() {
  const rows = await db.select().from(settingsTable);
  if (rows.length > 0) return rows[0]!;
  const [created] = await db.insert(settingsTable).values({}).returning();
  return created!;
}

router.get("/settings", async (_req, res): Promise<void> => {
  const settings = await getOrCreateSettings();
  res.json(settings);
});

router.put("/settings", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const settings = await getOrCreateSettings();
  const [updated] = await db.update(settingsTable).set(parsed.data).where(eq(settingsTable.id, settings.id)).returning();
  res.json(updated);
});

export default router;
