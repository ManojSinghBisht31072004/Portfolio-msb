import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  heroName: text("hero_name").notNull().default("Manoj Bisht"),
  heroRoles: text("hero_roles").array().notNull().default([
    "AI Engineer", "Gen AI Developer", "Full Stack Developer", "LLM Builder",
  ]),
  heroSubtext: text("hero_subtext").notNull().default(
    "Building real AI systems — from pipelines to production"
  ),
  resumeUrl: text("resume_url").notNull().default(""),
  linkedinUrl: text("linkedin_url").notNull().default("https://linkedin.com/in/manojbisht-9a26a2254"),
  githubUrl: text("github_url").notNull().default("https://github.com/manojbisht"),
  contactEmail: text("contact_email").notNull().default("manojbisht31072004@gmail.com"),
  aboutBio: text("about_bio").notNull().default(
    "Final year CS student at UPES specialising in AI & ML, running 3 internships simultaneously across Generative AI, cloud infrastructure, and full-stack development."
  ),
  profilePhotoUrl: text("profile_photo_url"),
  availabilityStatus: text("availability_status").notNull().default("Open to full-time from August 2026"),
  skills: text("skills").array().notNull().default([
    "Python", "Google Cloud", "LLMs", "RAG", "FastAPI", "MERN", "n8n",
    "Tailwind CSS", "Gemini API", "MongoDB", "React", "Node.js",
  ]),
  twitterUrl: text("twitter_url").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const experienceTable = pgTable("experience", {
  id: serial("id").primaryKey(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  location: text("location").notNull(),
  points: text("points").array().notNull().default([]),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  techTags: text("tech_tags").array().notNull().default([]),
  thumbnailUrl: text("thumbnail_url"),
  githubUrl: text("github_url"),
  liveUrl: text("live_url"),
  videoUrl: text("video_url"),
  pdfUrl: text("pdf_url"),
  published: boolean("published").notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const certificationsTable = pgTable("certifications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  issuer: text("issuer").notNull(),
  date: text("date").notNull(),
  credentialUrl: text("credential_url"),
  badgeUrl: text("badge_url"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const postsTable = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  coverImageUrl: text("cover_image_url"),
  content: text("content").notNull(),
  tags: text("tags").array().notNull().default([]),
  published: boolean("published").notNull().default(false),
  readTime: integer("read_time").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const mediaTable = pgTable("media", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminTable = pgTable("admin", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
