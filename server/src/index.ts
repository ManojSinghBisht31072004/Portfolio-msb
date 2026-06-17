import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";
import settingsRouter from "./routes/settings.js";
import experienceRouter from "./routes/experience.js";
import projectsRouter from "./routes/projects.js";
import certificationsRouter from "./routes/certifications.js";
import postsRouter from "./routes/posts.js";
import contactRouter from "./routes/contact.js";
import mediaRouter from "./routes/media.js";
import statsRouter from "./routes/stats.js";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

app.use(cors({
  origin: process.env.CLIENT_URL ?? "http://localhost:5173",
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api", authRouter);
app.use("/api", settingsRouter);
app.use("/api", experienceRouter);
app.use("/api", projectsRouter);
app.use("/api", certificationsRouter);
app.use("/api", postsRouter);
app.use("/api", contactRouter);
app.use("/api", mediaRouter);
app.use("/api", statsRouter);

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
