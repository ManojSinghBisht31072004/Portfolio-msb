import { Router } from "express";
import { db, adminTable } from "../db/index.js";
import { eq } from "drizzle-orm";
import { signToken, hashPassword, comparePassword, requireAuth, verifyToken } from "../lib/auth.js";
import { z } from "zod";

const router = Router();

const LoginBody = z.object({ email: z.string().email(), password: z.string() });
const ChangePasswordBody = z.object({ currentPassword: z.string(), newPassword: z.string().min(6) });

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request" }); return; }
  const { email, password } = parsed.data;
  const [admin] = await db.select().from(adminTable).where(eq(adminTable.email, email));
  if (!admin) { res.status(401).json({ error: "Invalid credentials" }); return; }
  const valid = await comparePassword(password, admin.passwordHash);
  if (!valid) { res.status(401).json({ error: "Invalid credentials" }); return; }
  const token = signToken({ adminId: admin.id, email: admin.email });
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ authenticated: true, user: { id: admin.id, email: admin.email } });
});

router.post("/auth/logout", (_req, res): void => {
  res.clearCookie("auth_token");
  res.json({ authenticated: false });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  try {
    const token = req.cookies?.["auth_token"] as string | undefined;
    if (!token) { res.json({ authenticated: false }); return; }
    const payload = verifyToken(token);
    const [admin] = await db.select().from(adminTable).where(eq(adminTable.id, payload.adminId));
    if (!admin) { res.json({ authenticated: false }); return; }
    res.json({ authenticated: true, user: { id: admin.id, email: admin.email } });
  } catch {
    res.json({ authenticated: false });
  }
});

router.put("/auth/password", requireAuth, async (req, res): Promise<void> => {
  const parsed = ChangePasswordBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request" }); return; }
  const { currentPassword, newPassword } = parsed.data;
  const admin = (req as any).admin;
  const [adminRecord] = await db.select().from(adminTable).where(eq(adminTable.id, admin.adminId));
  if (!adminRecord) { res.status(404).json({ error: "Admin not found" }); return; }
  const valid = await comparePassword(currentPassword, adminRecord.passwordHash);
  if (!valid) { res.status(401).json({ error: "Current password is incorrect" }); return; }
  const newHash = await hashPassword(newPassword);
  await db.update(adminTable).set({ passwordHash: newHash }).where(eq(adminTable.id, admin.adminId));
  res.json({ authenticated: true, user: { id: adminRecord.id, email: adminRecord.email } });
});

export default router;
