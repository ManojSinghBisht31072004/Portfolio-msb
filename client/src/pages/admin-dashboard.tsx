import { useState, useRef, useEffect } from "react";
import {
  useGetSettings, getGetSettingsQueryKey, useUpdateSettings,
  useGetStats, getGetStatsQueryKey,
  useGetMe, getGetMeQueryKey, useLogout,
  useListExperiences, getListExperiencesQueryKey, useCreateExperience, useUpdateExperience, useDeleteExperience,
  useListProjects, getListProjectsQueryKey, useCreateProject, useUpdateProject, useDeleteProject,
  useListCertifications, getListCertificationsQueryKey, useCreateCertification, useUpdateCertification, useDeleteCertification,
  useListPosts, getListPostsQueryKey, useCreatePost, useUpdatePost, useDeletePost,
  useListMessages, getListMessagesQueryKey, useMarkMessageRead, useDeleteMessage,
  useChangePassword,
} from "@/api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Section = "overview" | "projects" | "experience" | "certifications" | "posts" | "messages" | "settings" | "password";

const NAV_ITEMS: { id: Section; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "projects", label: "Projects", icon: "🚀" },
  { id: "experience", label: "Experience", icon: "💼" },
  { id: "certifications", label: "Certifications", icon: "🏆" },
  { id: "posts", label: "Blog Posts", icon: "✍️" },
  { id: "messages", label: "Messages", icon: "💬" },
  { id: "settings", label: "Settings", icon: "⚙️" },
  { id: "password", label: "Password", icon: "🔒" },
];

export default function AdminDashboard() {
  const [section, setSection] = useState<Section>("overview");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: auth, isLoading: authLoading } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const logout = useLogout();
  const { data: stats } = useGetStats({ query: { queryKey: getGetStatsQueryKey() } });

  useEffect(() => { if (!authLoading && !auth?.authenticated) setLocation("/admin"); }, [authLoading, auth?.authenticated]);

  if (authLoading || !auth?.authenticated) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-sm">Verifying access...</div>
  );

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() }); setLocation("/admin"); }
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <aside className="w-56 flex-shrink-0 border-r border-white/5 flex flex-col sticky top-0 h-screen bg-black/60">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2 font-display font-bold text-base tracking-tight">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ boxShadow: "0 0 8px #00d4ff" }} />
            Command Center
          </div>
          <p className="text-xs text-white/40 mt-1 font-mono truncate">{auth.user?.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setSection(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left"
              style={{ background: section === item.id ? "rgba(0,212,255,0.1)" : "transparent", color: section === item.id ? "#00d4ff" : "rgba(255,255,255,0.6)", fontWeight: section === item.id ? 600 : 400 }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.id === "messages" && (stats?.unreadMessages ?? 0) > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats!.unreadMessages}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5 space-y-1">
          <a href="/" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all w-full">🌐 View Site</a>
          <Button variant="ghost" className="w-full text-red-400 hover:text-red-400 hover:bg-red-500/10 justify-start text-sm" onClick={handleLogout}>🚪 Sign Out</Button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          {section === "overview" && <OverviewSection stats={stats} />}
          {section === "projects" && <ProjectsSection />}
          {section === "experience" && <ExperienceSection />}
          {section === "certifications" && <CertificationsSection />}
          {section === "posts" && <PostsSection />}
          {section === "messages" && <MessagesSection />}
          {section === "settings" && <SettingsSection />}
          {section === "password" && <PasswordSection />}
        </div>
      </main>
    </div>
  );
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return <div className="flex justify-between items-center mb-8"><h1 className="text-2xl font-display font-bold text-white">{title}</h1>{action}</div>;
}
function AdminCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white/[0.03] border border-white/8 rounded-2xl p-6 ${className}`}>{children}</div>;
}
function AdminInput({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-mono text-white/50 uppercase tracking-wider">{label}</label>
      <Input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="bg-black/50 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/50" />
    </div>
  );
}
function AdminTextarea({ label, value, onChange, rows = 4, placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-mono text-white/50 uppercase tracking-wider">{label}</label>
      <Textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="bg-black/50 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/50 resize-none" />
    </div>
  );
}

function OverviewSection({ stats }: { stats: any }) {
  if (!stats) return <p className="text-white/40">Loading...</p>;
  const cards = [
    { label: "Projects", value: stats.totalProjects, color: "#00d4ff" },
    { label: "Blog Posts", value: stats.totalPosts, color: "#7b2fff" },
    { label: "Certifications", value: stats.totalCertifications, color: "#00ff88" },
    { label: "Unread Messages", value: stats.unreadMessages, color: stats.unreadMessages > 0 ? "#ef4444" : "#fff" },
  ];
  return (
    <div>
      <SectionHeader title="Overview" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <AdminCard key={c.label}><p className="text-xs font-mono text-white/40 mb-2">{c.label}</p><p className="text-4xl font-bold" style={{ color: c.color }}>{c.value}</p></AdminCard>
        ))}
      </div>
    </div>
  );
}

function ProjectsSection() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: response } = useListProjects({}, { query: { queryKey: getListProjectsQueryKey({}) } });
  const projects = Array.isArray(response) ? response : (response?.projects || []);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const blank = { title: "", description: "", category: "", techTags: "", githubUrl: "", liveUrl: "", videoUrl: "", thumbnailUrl: "", published: true };
  const [form, setForm] = useState<any>(blank);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const f = (k: string) => (v: string) => setForm((p: any) => ({ ...p, [k]: v }));
  const handleSave = () => {
    const data = { ...form, techTags: typeof form.techTags === "string" ? form.techTags.split(",").map((s: string) => s.trim()).filter(Boolean) : form.techTags };
    const onSuccess = () => { toast({ title: editId ? "Project updated" : "Project created" }); qc.invalidateQueries({ queryKey: getListProjectsQueryKey({}) }); setForm(blank); setEditId(null); setShowForm(false); };
    const onError = () => toast({ title: "Error", variant: "destructive" });
    if (editId) updateProject.mutate({ id: editId, data }, { onSuccess, onError });
    else createProject.mutate({ data }, { onSuccess, onError });
  };
  const handleEdit = (p: any) => { setForm({ ...p, techTags: Array.isArray(p.techTags) ? p.techTags.join(", ") : p.techTags }); setEditId(p.id); setShowForm(true); };
  const handleDelete = (id: number) => {
    if (!confirm("Delete this project?")) return;
    deleteProject.mutate({ id }, { onSuccess: () => { toast({ title: "Deleted" }); qc.invalidateQueries({ queryKey: getListProjectsQueryKey({}) }); } });
  };
  return (
    <div>
      <SectionHeader title="Projects" action={<Button onClick={() => { setForm(blank); setEditId(null); setShowForm(s => !s); }} className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-black">{showForm ? "Cancel" : "+ New Project"}</Button>} />
      {showForm && (
        <AdminCard className="mb-6">
          <h3 className="text-lg font-bold text-white mb-4">{editId ? "Edit Project" : "New Project"}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <AdminInput label="Title" value={form.title} onChange={f("title")} />
            <AdminInput label="Category" value={form.category} onChange={f("category")} placeholder="e.g. AI/ML, Full Stack" />
            <div className="md:col-span-2"><AdminTextarea label="Description" value={form.description} onChange={f("description")} rows={3} /></div>
            <AdminInput label="Tech Tags (comma separated)" value={typeof form.techTags === "string" ? form.techTags : (form.techTags || []).join(", ")} onChange={f("techTags")} placeholder="Python, FastAPI, Docker" />
            <AdminInput label="GitHub URL" value={form.githubUrl || ""} onChange={f("githubUrl")} />
            <AdminInput label="Live URL" value={form.liveUrl || ""} onChange={f("liveUrl")} />
            <AdminInput label="Demo Video URL (YouTube or Drive)" value={form.videoUrl || ""} onChange={f("videoUrl")} placeholder="https://youtube.com/... or drive.google.com/..." />
            <AdminInput label="Thumbnail URL" value={form.thumbnailUrl || ""} onChange={f("thumbnailUrl")} />
            <div className="flex items-center gap-3">
              <input type="checkbox" id="pub" checked={!!form.published} onChange={e => setForm((p: any) => ({ ...p, published: e.target.checked }))} className="w-4 h-4 accent-primary" />
              <label htmlFor="pub" className="text-sm text-white/70">Published</label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={handleSave} disabled={createProject.isPending || updateProject.isPending} className="bg-primary text-black hover:bg-primary/90">{editId ? "Save Changes" : "Create Project"}</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditId(null); }} className="border-white/10 text-white/60">Cancel</Button>
          </div>
        </AdminCard>
      )}
      <div className="space-y-3">
        {projects.map((p: any) => (
          <AdminCard key={p.id} className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-white truncate">{p.title}</p>
                <Badge variant="outline" className="text-xs border-primary/20 text-primary/70 bg-primary/5 flex-shrink-0">{p.category}</Badge>
                {!p.published && <Badge variant="outline" className="text-xs border-white/20 text-white/30">Draft</Badge>}
              </div>
              <p className="text-sm text-white/40 line-clamp-1">{p.description}</p>
              <div className="flex gap-1 mt-2 flex-wrap">
                {(p.techTags || []).slice(0, 5).map((t: string) => <span key={t} className="text-[10px] font-mono bg-white/5 text-white/40 px-1.5 py-0.5 rounded">{t}</span>)}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" variant="outline" onClick={() => handleEdit(p)} className="border-white/10 text-white/60 hover:text-white text-xs">Edit</Button>
              <Button size="sm" variant="outline" onClick={() => handleDelete(p.id)} className="border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs">Delete</Button>
            </div>
          </AdminCard>
        ))}
        {projects.length === 0 && <p className="text-white/30 text-sm text-center py-12">No projects yet.</p>}
      </div>
    </div>
  );
}

function ExperienceSection() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: experiences } = useListExperiences({ query: { queryKey: getListExperiencesQueryKey() } });
  const create = useCreateExperience();
  const update = useUpdateExperience();
  const del = useDeleteExperience();
  const blank = { company: "", role: "", startDate: "", endDate: "", location: "", points: "" };
  const [form, setForm] = useState<any>(blank);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const f = (k: string) => (v: string) => setForm((p: any) => ({ ...p, [k]: v }));
  const handleSave = () => {
    const data = { ...form, points: typeof form.points === "string" ? form.points.split("\n").map((s: string) => s.trim()).filter(Boolean) : form.points };
    const onSuccess = () => { toast({ title: editId ? "Updated" : "Created" }); qc.invalidateQueries({ queryKey: getListExperiencesQueryKey() }); setForm(blank); setEditId(null); setShowForm(false); };
    const onError = () => toast({ title: "Error", variant: "destructive" });
    if (editId) update.mutate({ id: editId, data }, { onSuccess, onError });
    else create.mutate({ data }, { onSuccess, onError });
  };
  const handleEdit = (e: any) => { setForm({ ...e, points: Array.isArray(e.points) ? e.points.join("\n") : e.points }); setEditId(e.id); setShowForm(true); };
  const handleDelete = (id: number) => {
    if (!confirm("Delete?")) return;
    del.mutate({ id }, { onSuccess: () => { toast({ title: "Deleted" }); qc.invalidateQueries({ queryKey: getListExperiencesQueryKey() }); } });
  };
  return (
    <div>
      <SectionHeader title="Experience" action={<Button onClick={() => { setForm(blank); setEditId(null); setShowForm(s => !s); }} className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-black">{showForm ? "Cancel" : "+ New"}</Button>} />
      {showForm && (
        <AdminCard className="mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <AdminInput label="Company" value={form.company} onChange={f("company")} />
            <AdminInput label="Role" value={form.role} onChange={f("role")} />
            <AdminInput label="Start Date" value={form.startDate} onChange={f("startDate")} placeholder="Jan 2024" />
            <AdminInput label="End Date" value={form.endDate} onChange={f("endDate")} placeholder="Present" />
            <AdminInput label="Location" value={form.location} onChange={f("location")} />
            <div className="md:col-span-2"><AdminTextarea label="Points (one per line)" value={typeof form.points === "string" ? form.points : (form.points || []).join("\n")} onChange={f("points")} rows={5} /></div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={handleSave} disabled={create.isPending || update.isPending} className="bg-primary text-black hover:bg-primary/90">{editId ? "Save" : "Create"}</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditId(null); }} className="border-white/10 text-white/60">Cancel</Button>
          </div>
        </AdminCard>
      )}
      <div className="space-y-3">
        {(experiences || []).map((e: any) => (
          <AdminCard key={e.id} className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <p className="font-semibold text-white">{e.role}</p>
              <p className="text-primary text-sm">{e.company}</p>
              <p className="text-white/40 text-xs mt-1">{e.startDate} - {e.endDate} · {e.location}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" variant="outline" onClick={() => handleEdit(e)} className="border-white/10 text-white/60 text-xs">Edit</Button>
              <Button size="sm" variant="outline" onClick={() => handleDelete(e.id)} className="border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs">Delete</Button>
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}

function CertificationsSection() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: certs } = useListCertifications({ query: { queryKey: getListCertificationsQueryKey() } });
  const create = useCreateCertification();
  const update = useUpdateCertification();
  const del = useDeleteCertification();
  const blank = { name: "", issuer: "", date: "", credentialUrl: "", badgeUrl: "" };
  const [form, setForm] = useState<any>(blank);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const f = (k: string) => (v: string) => setForm((p: any) => ({ ...p, [k]: v }));
  const handleSave = () => {
    const onSuccess = () => { toast({ title: editId ? "Updated" : "Created" }); qc.invalidateQueries({ queryKey: getListCertificationsQueryKey() }); setForm(blank); setEditId(null); setShowForm(false); };
    const onError = () => toast({ title: "Error", variant: "destructive" });
    if (editId) update.mutate({ id: editId, data: form }, { onSuccess, onError });
    else create.mutate({ data: form }, { onSuccess, onError });
  };
  const handleDelete = (id: number) => {
    if (!confirm("Delete?")) return;
    del.mutate({ id }, { onSuccess: () => { toast({ title: "Deleted" }); qc.invalidateQueries({ queryKey: getListCertificationsQueryKey() }); } });
  };
  return (
    <div>
      <SectionHeader title="Certifications" action={<Button onClick={() => { setForm(blank); setEditId(null); setShowForm(s => !s); }} className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-black">{showForm ? "Cancel" : "+ New"}</Button>} />
      {showForm && (
        <AdminCard className="mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <AdminInput label="Name" value={form.name} onChange={f("name")} />
            <AdminInput label="Issuer" value={form.issuer} onChange={f("issuer")} />
            <AdminInput label="Date" value={form.date} onChange={f("date")} placeholder="Jan 2024" />
            <AdminInput label="Credential URL" value={form.credentialUrl || ""} onChange={f("credentialUrl")} />
            <AdminInput label="Badge URL" value={form.badgeUrl || ""} onChange={f("badgeUrl")} />
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={handleSave} className="bg-primary text-black hover:bg-primary/90">{editId ? "Save" : "Create"}</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditId(null); }} className="border-white/10 text-white/60">Cancel</Button>
          </div>
        </AdminCard>
      )}
      <div className="space-y-3">
        {(certs || []).map((c: any) => (
          <AdminCard key={c.id} className="flex justify-between items-start gap-4">
            <div>
              <p className="font-semibold text-white">{c.name}</p>
              <p className="text-primary text-sm">{c.issuer} · {c.date}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" variant="outline" onClick={() => { setForm({ ...c }); setEditId(c.id); setShowForm(true); }} className="border-white/10 text-white/60 text-xs">Edit</Button>
              <Button size="sm" variant="outline" onClick={() => handleDelete(c.id)} className="border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs">Delete</Button>
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}

function PostsSection() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: response } = useListPosts({}, { query: { queryKey: getListPostsQueryKey({}) } });
  const posts = response?.posts || [];
  const create = useCreatePost();
  const update = useUpdatePost();
  const del = useDeletePost();
  const blank = { title: "", slug: "", content: "", tags: "", published: false, coverImageUrl: "" };
  const [form, setForm] = useState<any>(blank);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const f = (k: string) => (v: string) => setForm((p: any) => ({ ...p, [k]: v }));
  const handleSave = () => {
    const data = { ...form, tags: typeof form.tags === "string" ? form.tags.split(",").map((s: string) => s.trim()).filter(Boolean) : form.tags };
    const onSuccess = () => { toast({ title: editId ? "Updated" : "Created" }); qc.invalidateQueries({ queryKey: getListPostsQueryKey({}) }); setForm(blank); setEditId(null); setShowForm(false); };
    const onError = () => toast({ title: "Error", variant: "destructive" });
    if (editId) update.mutate({ id: editId, data }, { onSuccess, onError });
    else create.mutate({ data }, { onSuccess, onError });
  };
  const handleEdit = (p: any) => { setForm({ ...p, tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags }); setEditId(p.id); setShowForm(true); };
  const handleDelete = (id: number) => {
    if (!confirm("Delete?")) return;
    del.mutate({ id }, { onSuccess: () => { toast({ title: "Deleted" }); qc.invalidateQueries({ queryKey: getListPostsQueryKey({}) }); } });
  };
  return (
    <div>
      <SectionHeader title="Blog Posts" action={<Button onClick={() => { setForm(blank); setEditId(null); setShowForm(s => !s); }} className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-black">{showForm ? "Cancel" : "+ New Post"}</Button>} />
      {showForm && (
        <AdminCard className="mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <AdminInput label="Title" value={form.title} onChange={f("title")} />
            <AdminInput label="Slug (URL)" value={form.slug} onChange={f("slug")} placeholder="my-post-title" />
            <div className="md:col-span-2"><AdminTextarea label="Content (Markdown)" value={form.content} onChange={f("content")} rows={10} /></div>
            <AdminInput label="Tags (comma separated)" value={typeof form.tags === "string" ? form.tags : (form.tags || []).join(", ")} onChange={f("tags")} placeholder="ai, ml, react" />
            <AdminInput label="Cover Image URL" value={form.coverImageUrl || ""} onChange={f("coverImageUrl")} />
            <div className="flex items-center gap-3">
              <input type="checkbox" id="postPub" checked={!!form.published} onChange={e => setForm((p: any) => ({ ...p, published: e.target.checked }))} className="w-4 h-4 accent-primary" />
              <label htmlFor="postPub" className="text-sm text-white/70">Published</label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={handleSave} className="bg-primary text-black hover:bg-primary/90">{editId ? "Save" : "Create Post"}</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditId(null); }} className="border-white/10 text-white/60">Cancel</Button>
          </div>
        </AdminCard>
      )}
      <div className="space-y-3">
        {posts.map((p: any) => (
          <AdminCard key={p.id} className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-white">{p.title}</p>
                {p.published ? <Badge variant="outline" className="text-xs border-green-500/30 text-green-400 bg-green-500/5">Live</Badge> : <Badge variant="outline" className="text-xs border-white/20 text-white/30">Draft</Badge>}
              </div>
              <p className="text-white/40 text-xs font-mono">/{p.slug} · {p.readTime} min read</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" variant="outline" onClick={() => handleEdit(p)} className="border-white/10 text-white/60 text-xs">Edit</Button>
              <Button size="sm" variant="outline" onClick={() => handleDelete(p.id)} className="border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs">Delete</Button>
            </div>
          </AdminCard>
        ))}
        {!posts.length && <p className="text-white/30 text-sm text-center py-12">No blog posts yet.</p>}
      </div>
    </div>
  );
}

function MessagesSection() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: messages } = useListMessages({ query: { queryKey: getListMessagesQueryKey() } });
  const markRead = useMarkMessageRead();
  const del = useDeleteMessage();
  return (
    <div>
      <SectionHeader title="Messages" />
      <div className="space-y-3">
        {(messages || []).map((m: any) => (
          <AdminCard key={m.id} className={m.read ? "opacity-60" : ""}>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-white">{m.name}</p>
                  {!m.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                </div>
                <p className="text-primary text-sm font-mono">{m.email}</p>
                <p className="text-white/70 text-sm mt-3 leading-relaxed">{m.message}</p>
                <p className="text-white/30 text-xs mt-2">{new Date(m.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                {!m.read && <Button size="sm" variant="outline" onClick={() => markRead.mutate({ id: m.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListMessagesQueryKey() }) })} className="border-white/10 text-white/60 text-xs">Mark Read</Button>}
                <Button size="sm" variant="outline" onClick={() => { if (!confirm("Delete?")) return; del.mutate({ id: m.id }, { onSuccess: () => { toast({ title: "Deleted" }); qc.invalidateQueries({ queryKey: getListMessagesQueryKey() }); } }); }} className="border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs">Delete</Button>
              </div>
            </div>
          </AdminCard>
        ))}
        {!(messages as any[])?.length && <p className="text-white/30 text-sm text-center py-12">No messages yet.</p>}
      </div>
    </div>
  );
}

function SettingsSection() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const updateSettings = useUpdateSettings();
  const [form, setForm] = useState<any>({});
  const initialized = useRef(false);
  useEffect(() => {
    if (settings && !initialized.current) {
      setForm({ ...settings, heroRoles: Array.isArray(settings.heroRoles) ? settings.heroRoles.join(", ") : settings.heroRoles, skills: Array.isArray(settings.skills) ? settings.skills.join(", ") : settings.skills });
      initialized.current = true;
    }
  }, [settings]);
  const f = (k: string) => (v: string) => setForm((p: any) => ({ ...p, [k]: v }));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, heroRoles: typeof form.heroRoles === "string" ? form.heroRoles.split(",").map((s: string) => s.trim()).filter(Boolean) : form.heroRoles, skills: typeof form.skills === "string" ? form.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : form.skills };
    updateSettings.mutate({ data }, { onSuccess: () => { toast({ title: "Settings saved" }); qc.invalidateQueries({ queryKey: getGetSettingsQueryKey() }); }, onError: () => toast({ title: "Failed to save", variant: "destructive" }) });
  };
  if (!settings) return null;
  return (
    <form onSubmit={handleSubmit}>
      <SectionHeader title="Site Settings" action={<Button type="submit" disabled={updateSettings.isPending} className="bg-primary text-black hover:bg-primary/90">{updateSettings.isPending ? "Saving..." : "Save Changes"}</Button>} />
      <div className="space-y-6">
        <AdminCard>
          <h3 className="text-sm font-mono text-white/40 uppercase tracking-wider mb-4">Hero Section</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <AdminInput label="Your Name" value={form.heroName || ""} onChange={f("heroName")} />
            <AdminInput label="Contact Email" value={form.contactEmail || ""} onChange={f("contactEmail")} />
            <div className="md:col-span-2"><AdminTextarea label="Hero Subtext" value={form.heroSubtext || ""} onChange={f("heroSubtext")} rows={2} /></div>
            <div className="md:col-span-2"><AdminInput label="Roles (comma separated)" value={typeof form.heroRoles === "string" ? form.heroRoles : (form.heroRoles || []).join(", ")} onChange={f("heroRoles")} placeholder="AI Engineer, ML Researcher" /></div>
            <AdminInput label="Availability Status" value={form.availabilityStatus || ""} onChange={f("availabilityStatus")} />
            <AdminInput label="Resume URL" value={form.resumeUrl || ""} onChange={f("resumeUrl")} />
          </div>
        </AdminCard>
        <AdminCard>
          <h3 className="text-sm font-mono text-white/40 uppercase tracking-wider mb-4">About Section</h3>
          <div className="space-y-4">
            <AdminTextarea label="Bio" value={form.aboutBio || ""} onChange={f("aboutBio")} rows={5} />
            <AdminInput label="Profile Photo URL" value={form.profilePhotoUrl || ""} onChange={f("profilePhotoUrl")} />
            <AdminInput label="Skills (comma separated)" value={typeof form.skills === "string" ? form.skills : (form.skills || []).join(", ")} onChange={f("skills")} />
          </div>
        </AdminCard>
        <AdminCard>
          <h3 className="text-sm font-mono text-white/40 uppercase tracking-wider mb-4">Social Links</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <AdminInput label="GitHub URL" value={form.githubUrl || ""} onChange={f("githubUrl")} />
            <AdminInput label="LinkedIn URL" value={form.linkedinUrl || ""} onChange={f("linkedinUrl")} />
            <AdminInput label="Twitter / X URL" value={form.twitterUrl || ""} onChange={f("twitterUrl")} />
          </div>
        </AdminCard>
      </div>
    </form>
  );
}

function PasswordSection() {
  const { toast } = useToast();
  const changePassword = useChangePassword();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const f = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    if (form.newPassword.length < 6) { toast({ title: "Password must be at least 6 characters", variant: "destructive" }); return; }
    changePassword.mutate({ data: { currentPassword: form.currentPassword, newPassword: form.newPassword } }, {
      onSuccess: () => { toast({ title: "Password changed successfully" }); setForm({ currentPassword: "", newPassword: "", confirm: "" }); },
      onError: () => toast({ title: "Incorrect current password", variant: "destructive" }),
    });
  };
  return (
    <div>
      <SectionHeader title="Change Password" />
      <AdminCard className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <AdminInput label="Current Password" value={form.currentPassword} onChange={f("currentPassword")} type="password" />
          <AdminInput label="New Password" value={form.newPassword} onChange={f("newPassword")} type="password" />
          <AdminInput label="Confirm New Password" value={form.confirm} onChange={f("confirm")} type="password" />
          <Button type="submit" disabled={changePassword.isPending} className="w-full bg-primary text-black hover:bg-primary/90 mt-2">{changePassword.isPending ? "Changing..." : "Change Password"}</Button>
        </form>
      </AdminCard>
    </div>
  );
}
