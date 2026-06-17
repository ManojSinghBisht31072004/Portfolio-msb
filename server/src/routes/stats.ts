import { Router } from "express";
import { db, projectsTable, certificationsTable, postsTable, messagesTable } from "../db/index.js";
import { eq, count } from "drizzle-orm";

const router = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const [projectsCount, certsCount, postsCount, messagesCount, unreadCount, categoryGroups] = await Promise.all([
    db.select({ count: count() }).from(projectsTable),
    db.select({ count: count() }).from(certificationsTable),
    db.select({ count: count() }).from(postsTable),
    db.select({ count: count() }).from(messagesTable),
    db.select({ count: count() }).from(messagesTable).where(eq(messagesTable.read, false)),
    db.select({ category: projectsTable.category, count: count() }).from(projectsTable).groupBy(projectsTable.category),
  ]);
  res.json({
    totalProjects: Number(projectsCount[0]?.count ?? 0),
    totalCertifications: Number(certsCount[0]?.count ?? 0),
    totalPosts: Number(postsCount[0]?.count ?? 0),
    totalMessages: Number(messagesCount[0]?.count ?? 0),
    unreadMessages: Number(unreadCount[0]?.count ?? 0),
    projectsByCategory: categoryGroups.map(g => ({ category: g.category, count: Number(g.count) })),
  });
});

export default router;
