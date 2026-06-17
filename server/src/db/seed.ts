import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import bcrypt from "bcryptjs";
import * as schema from "./schema.js";

const { Pool } = pg;

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("Seeding admin user...");
  const hash = await bcrypt.hash("admin123", 12);
  await db
    .insert(schema.adminTable)
    .values({ email: "admin@manoj.dev", passwordHash: hash })
    .onConflictDoNothing();

  console.log("Seeding default settings...");
  const existing = await db.select().from(schema.settingsTable);
  if (existing.length === 0) {
    await db.insert(schema.settingsTable).values({});
    console.log("Settings created.");
  } else {
    console.log("Settings already exist, skipping.");
  }

  console.log("Seed complete!");
  console.log("Admin login: admin@manoj.dev / admin123");
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
