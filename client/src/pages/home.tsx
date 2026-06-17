import {
  useGetSettings, getGetSettingsQueryKey,
  useListExperiences, getListExperiencesQueryKey,
  useListProjects, getListProjectsQueryKey,
  useListPosts, getListPostsQueryKey,
  useSubmitContact,
} from "@/api/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useTheme, THEMES, type ThemeId } from "@/lib/theme";
import { toImageUrl } from "@/lib/image-url";

export default function Home() {
  const { data: settings, isLoading } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--t-bg)" }}>
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-48 bg-primary/20" />
          <Skeleton className="h-4 w-32 bg-primary/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "var(--t-bg)", color: "var(--t-text-strong)" }}>
      <Navbar settings={settings} />
      <main>
        <HeroSection settings={settings} />
        <AboutSection settings={settings} />
        <ExperienceSection />
        <ProjectsSection />
        <BlogPreviewSection />
        <ContactSection settings={settings} />
      </main>
      <Footer settings={settings} />
    </div>
  );
}

function getAccentRgb(id: ThemeId) {
  if (id === "dark") return "0, 212, 255";
  if (id === "sage") return "74, 124, 89";
  return "27, 58, 107";
}

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const current = THEMES.find(t => t.id === theme)!;
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
        style={{ background: "var(--t-surface)", border: `1px solid var(--t-border-medium)`, color: "var(--t-text-strong)" }}>
        <span>{current.emoji}</span>
        <span className="hidden sm:inline">{current.name}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.5 }}><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 rounded-2xl shadow-2xl overflow-hidden z-50"
            style={{ background: "var(--t-bg)", border: `1px solid var(--t-border-medium)`, minWidth: "220px" }}>
            <div className="p-2">
              <p className="text-xs font-medium px-3 pt-2 pb-1" style={{ color: "var(--t-text-muted)" }}>Choose theme</p>
              {THEMES.map(t => (
                <button key={t.id} onClick={() => { setTheme(t.id as ThemeId); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left"
                  style={{ background: theme === t.id ? `rgba(${getAccentRgb(t.id)}, 0.12)` : "transparent", color: "var(--t-text-strong)" }}>
                  <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm"
                    style={{ background: t.preview.bg, borderColor: theme === t.id ? t.preview.accent : "transparent" }}>{t.emoji}</span>
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs" style={{ color: "var(--t-text-muted)" }}>{t.description}</p>
                  </div>
                  {theme === t.id && <span className="ml-auto text-xs font-bold" style={{ color: t.preview.accent }}>✓</span>}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Navbar({ settings }: { settings: any }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card px-4 sm:px-6 py-4 flex justify-between items-center" style={{ borderBottom: `1px solid var(--t-border-subtle)` }}>
      <div className="font-display font-bold text-xl tracking-tight flex items-center gap-2" style={{ color: "var(--t-text-strong)" }}>
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        {settings.heroName.split(' ')[0]}<span className="text-primary">.</span>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden md:flex items-center gap-5 text-sm font-medium" style={{ color: "var(--t-text-muted)" }}>
          {["about", "experience", "projects", "blog", "contact"].map(s => (
            <a key={s} href={`#${s}`} className="hover:text-primary transition-colors capitalize">{s}</a>
          ))}
          <Link href="/admin"><span className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer">Admin</span></Link>
        </div>
        <ThemeSwitcher />
      </div>
    </nav>
  );
}

function HeroSection({ settings }: { settings: any }) {
  const { theme } = useTheme();
  const [roleIndex, setRoleIndex] = useState(0);
  useEffect(() => {
    if (!settings.heroRoles?.length) return;
    const interval = setInterval(() => setRoleIndex(p => (p + 1) % settings.heroRoles.length), 3000);
    return () => clearInterval(interval);
  }, [settings.heroRoles]);

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        opacity: theme === "dark" ? 0.2 : 0.06,
        backgroundImage: `linear-gradient(rgba(var(--t-accent-rgb), 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--t-accent-rgb), 0.15) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
        transformOrigin: 'top center',
      }} />
      <div className="absolute inset-0 z-10" style={{ background: `linear-gradient(to top, var(--t-bg) 0%, color-mix(in srgb, var(--t-bg) 80%, transparent) 50%, transparent 100%)` }} />
      <div className="container relative z-20 px-4 flex flex-col items-center text-center max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Badge variant="outline" className="mb-6 glass-card px-4 py-1.5"
            style={{ borderColor: `rgba(var(--t-accent-rgb), 0.3)`, color: "var(--t-accent-hex)", background: `rgba(var(--t-accent-rgb), 0.08)` }}>
            {settings.availabilityStatus || 'Available for opportunities'}
          </Badge>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tighter mb-4" style={{ color: "var(--t-hero-heading)" }}>
            {settings.heroName}
          </h1>
          <div className="h-[40px] md:h-[60px] mb-6 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p key={roleIndex} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }}
                className="text-2xl md:text-4xl font-light accent-text-glow" style={{ color: "var(--t-accent-hex)" }}>
                {settings.heroRoles?.[roleIndex] || "Software Engineer"}
              </motion.p>
            </AnimatePresence>
          </div>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--t-text-muted)" }}>{settings.heroSubtext}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto accent-border font-semibold"
              style={{ background: `rgba(var(--t-accent-rgb), 0.10)`, color: "var(--t-accent-hex)", border: `1px solid rgba(var(--t-accent-rgb), 0.3)` }} asChild>
              <a href="#projects">View My Work</a>
            </Button>
            {settings.resumeUrl && (
              <Button size="lg" variant="outline" className="w-full sm:w-auto glass-card"
                style={{ borderColor: "var(--t-border-medium)", color: "var(--t-text-strong)" }} asChild>
                <a href={settings.resumeUrl} target="_blank" rel="noreferrer">Download Resume</a>
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function AboutSection({ settings }: { settings: any }) {
  return (
    <section id="about" className="py-24 relative">
      <div className="container px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
            <div className="aspect-square max-w-md mx-auto relative rounded-2xl overflow-hidden glass-card accent-border p-2">
              {settings.profilePhotoUrl ? (
                <img src={toImageUrl(settings.profilePhotoUrl)} alt={settings.heroName} className="w-full h-full object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-500" />
              ) : (
                <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ background: "var(--t-surface)" }}>
                  <span className="text-4xl font-display" style={{ color: "var(--t-text-muted)" }}>{settings.heroName.charAt(0)}</span>
                </div>
              )}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6" style={{ color: "var(--t-section-heading)" }}>About Me</h2>
            <p className="mb-8 whitespace-pre-wrap leading-relaxed" style={{ color: "var(--t-text-muted)" }}>{settings.aboutBio}</p>
            <h3 className="text-xl font-display font-semibold mb-4" style={{ color: "var(--t-text-strong)" }}>Technical Arsenal</h3>
            <div className="flex flex-wrap gap-2">
              {settings.skills?.map((skill: string, i: number) => (
                <Badge key={i} variant="secondary" className="theme-tag border" style={{ background: "var(--t-tag-bg)", color: "var(--t-tag-text)", borderColor: "var(--t-border-medium)" }}>{skill}</Badge>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ExperienceSection() {
  const { data: experiences } = useListExperiences({ query: { queryKey: getListExperiencesQueryKey() } });
  if (!experiences?.length) return null;
  return (
    <section id="experience" className="py-24 relative section-alt">
      <div className="container px-4 max-w-4xl">
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-12 text-center" style={{ color: "var(--t-section-heading)" }}>Experience</h2>
        <div className="space-y-8">
          {experiences.map((exp: any, i: number) => (
            <motion.div key={exp.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-card p-6 md:p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: `linear-gradient(to bottom, rgba(var(--t-accent-rgb), 0.5), transparent)` }} />
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-2">
                <div>
                  <h3 className="text-xl font-bold" style={{ color: "var(--t-text-strong)" }}>{exp.role}</h3>
                  <p className="font-medium text-primary">{exp.company}</p>
                </div>
                <div className="text-sm px-3 py-1 rounded-full w-fit" style={{ color: "var(--t-text-muted)", background: "var(--t-surface)", border: `1px solid var(--t-border-subtle)` }}>
                  {exp.startDate} - {exp.endDate}
                </div>
              </div>
              <ul className="list-none space-y-2 mt-4">
                {exp.points.map((point: string, j: number) => (
                  <li key={j} className="flex gap-3" style={{ color: "var(--t-text-muted)" }}>
                    <span className="mt-1.5 opacity-60 text-primary">▹</span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectsSection() {
  const { data: response } = useListProjects({ published: true }, { query: { queryKey: getListProjectsQueryKey({ published: true }) } });
  const projects = Array.isArray(response) ? response : (response?.projects || []);
  if (!projects.length) return null;
  return (
    <section id="projects" className="py-24 relative">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4" style={{ color: "var(--t-section-heading)" }}>Selected Work</h2>
            <p style={{ color: "var(--t-text-muted)" }}>Systems built for scale and impact.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any, i: number) => (
            <motion.div key={project.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-card h-full flex flex-col group" style={{ borderColor: "var(--t-border-subtle)" }}>
                {project.thumbnailUrl && (
                  <div className="aspect-video w-full overflow-hidden" style={{ borderBottom: `1px solid var(--t-border-subtle)` }}>
                    <img src={toImageUrl(project.thumbnailUrl)} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-xs font-mono" style={{ background: "var(--t-badge-bg)", color: "var(--t-accent-hex)", borderColor: `rgba(var(--t-accent-rgb), 0.25)` }}>{project.category}</Badge>
                  </div>
                  <CardTitle className="text-xl font-display group-hover:text-primary transition-colors" style={{ color: "var(--t-text-strong)" }}>{project.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm flex-1 mb-6" style={{ color: "var(--t-text-muted)" }}>{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.techTags.slice(0, 4).map((tag: string, j: number) => (
                      <span key={j} className="text-xs font-mono px-2 py-1 rounded theme-tag" style={{ background: "var(--t-tag-bg)", color: "var(--t-tag-text)" }}>{tag}</span>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {project.githubUrl && (
                      <Button size="sm" variant="outline" className="flex-1 glass-card" style={{ borderColor: "var(--t-border-medium)", color: "var(--t-text-strong)" }} asChild>
                        <a href={project.githubUrl} target="_blank" rel="noreferrer">Code</a>
                      </Button>
                    )}
                    {project.liveUrl && (
                      <Button size="sm" className="flex-1 border font-medium" style={{ background: `rgba(var(--t-accent-rgb), 0.12)`, color: "var(--t-accent-hex)", borderColor: `rgba(var(--t-accent-rgb), 0.3)` }} asChild>
                        <a href={project.liveUrl} target="_blank" rel="noreferrer">Live</a>
                      </Button>
                    )}
                    {project.videoUrl && (
                      <Button size="sm" className="flex-1 border font-medium" style={{ background: "rgba(239,68,68,0.10)", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }} asChild>
                        <a href={project.videoUrl} target="_blank" rel="noreferrer">▶ Demo</a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlogPreviewSection() {
  const { data: response } = useListPosts({ published: true, limit: 3 }, { query: { queryKey: getListPostsQueryKey({ published: true, limit: 3 }) } });
  const posts = response?.posts || [];
  if (!posts.length) return null;
  return (
    <section id="blog" className="py-24 relative section-alt" style={{ borderTop: `1px solid var(--t-border-subtle)`, borderBottom: `1px solid var(--t-border-subtle)` }}>
      <div className="container px-4">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl md:text-5xl font-display font-bold" style={{ color: "var(--t-section-heading)" }}>Writing</h2>
          <Button variant="link" className="text-primary hover:text-primary/80" asChild><Link href="/blog">View all posts →</Link></Button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post: any, i: number) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Link href={`/blog/${post.id}`}>
                <a className="block glass-card p-6 rounded-2xl group h-full" style={{ border: `1px solid var(--t-border-subtle)` }}>
                  <div className="text-xs mb-3 font-mono" style={{ color: "var(--t-text-muted)" }}>{new Date(post.createdAt).toLocaleDateString()} • {post.readTime} min read</div>
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors mb-4" style={{ color: "var(--t-text-strong)" }}>{post.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {post.tags.slice(0, 3).map((tag: string, j: number) => (
                      <span key={j} className="text-xs px-2 py-0.5 rounded theme-tag" style={{ background: "var(--t-tag-bg)", color: "var(--t-tag-text)" }}>#{tag}</span>
                    ))}
                  </div>
                </a>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection({ settings }: { settings: any }) {
  const { toast } = useToast();
  const submitContact = useSubmitContact();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitContact.mutate({ data: formData }, {
      onSuccess: () => { toast({ title: "Message sent", description: "I'll get back to you soon." }); setFormData({ name: '', email: '', message: '' }); },
      onError: () => toast({ title: "Error", description: "Failed to send message.", variant: "destructive" }),
    });
  };

  return (
    <section id="contact" className="py-24 relative">
      <div className="container px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4" style={{ color: "var(--t-section-heading)" }}>Get In Touch</h2>
          <p style={{ color: "var(--t-text-muted)" }}>Looking to build something extraordinary? Let's talk.</p>
        </div>
        <div className="grid md:grid-cols-5 gap-12">
          <div className="md:col-span-2 space-y-6">
            <div className="glass-card p-6 rounded-xl" style={{ border: `1px solid var(--t-border-subtle)` }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--t-text-strong)" }}>Direct Line</h3>
              <p className="font-mono text-primary">{settings.contactEmail}</p>
            </div>
            <div className="flex gap-4">
              {settings.githubUrl && (
                <Button variant="outline" className="flex-1 glass-card" style={{ borderColor: "var(--t-border-medium)", color: "var(--t-text-strong)" }} asChild>
                  <a href={settings.githubUrl} target="_blank" rel="noreferrer">GitHub</a>
                </Button>
              )}
              {settings.linkedinUrl && (
                <Button variant="outline" className="flex-1 glass-card" style={{ borderColor: "var(--t-border-medium)", color: "var(--t-text-strong)" }} asChild>
                  <a href={settings.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>
                </Button>
              )}
            </div>
          </div>
          <div className="md:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-4 glass-card p-6 md:p-8 rounded-2xl relative" style={{ border: `1px solid var(--t-border-subtle)` }}>
              {submitContact.isPending && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl backdrop-blur-sm" style={{ background: "color-mix(in srgb, var(--t-bg) 50%, transparent)" }}>
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: "var(--t-text-muted)" }}>Name</label>
                  <Input required className="focus-visible:ring-primary/50" style={{ background: "var(--t-input-bg)", borderColor: "var(--t-input-border)", color: "var(--t-text-strong)" }} value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: "var(--t-text-muted)" }}>Email</label>
                  <Input required type="email" className="focus-visible:ring-primary/50" style={{ background: "var(--t-input-bg)", borderColor: "var(--t-input-border)", color: "var(--t-text-strong)" }} value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: "var(--t-text-muted)" }}>Message</label>
                <Textarea required className="min-h-[150px] resize-none focus-visible:ring-primary/50" style={{ background: "var(--t-input-bg)", borderColor: "var(--t-input-border)", color: "var(--t-text-strong)" }} value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} />
              </div>
              <Button type="submit" className="w-full font-semibold accent-border" style={{ background: `rgba(var(--t-accent-rgb), 0.10)`, color: "var(--t-accent-hex)", border: `1px solid rgba(var(--t-accent-rgb), 0.3)` }}>
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ settings }: { settings: any }) {
  return (
    <footer className="py-8 text-center" style={{ borderTop: `1px solid var(--t-footer-border)`, backgroundColor: "var(--t-footer-bg)" }}>
      <div className="container px-4">
        <p className="text-sm font-mono mb-2" style={{ color: "var(--t-text-muted)" }}>Built with purpose. Deployed with proof.</p>
        <p className="text-xs" style={{ color: "var(--t-text-muted)", opacity: 0.6 }}>© {new Date().getFullYear()} {settings.heroName}. All rights reserved.</p>
      </div>
    </footer>
  );
}
