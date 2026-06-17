import { useListPosts, getListPostsQueryKey } from "@/api/hooks";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ThemeSwitcherCompact } from "@/components/theme-switcher";

export default function BlogList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleSearch = (value: string) => {
    setSearch(value);
    clearTimeout((handleSearch as any)._t);
    (handleSearch as any)._t = setTimeout(() => setDebouncedSearch(value), 500);
  };

  const { data: response, isLoading } = useListPosts(
    { published: true, search: debouncedSearch, limit: 100 },
    { query: { queryKey: getListPostsQueryKey({ published: true, search: debouncedSearch, limit: 100 }) } }
  );
  const posts = response?.posts || [];

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "var(--t-bg)", color: "var(--t-text-strong)" }}>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card px-6 py-4 flex justify-between items-center" style={{ borderBottom: `1px solid var(--t-border-subtle)` }}>
        <Link href="/">
          <div className="font-display font-bold text-xl tracking-tight flex items-center gap-2 cursor-pointer hover:text-primary transition-colors" style={{ color: "var(--t-text-strong)" }}>
            <span className="text-primary">←</span> Home
          </div>
        </Link>
        <ThemeSwitcherCompact />
      </nav>
      <div className="container px-4 pt-32 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-6" style={{ color: "var(--t-section-heading)" }}>Writing</h1>
        <p className="text-lg mb-12" style={{ color: "var(--t-text-muted)" }}>Thoughts, learnings, and engineering logs.</p>
        <div className="mb-12">
          <Input placeholder="Search posts..." className="max-w-md focus-visible:ring-primary/50"
            style={{ background: "var(--t-input-bg)", borderColor: "var(--t-input-border)", color: "var(--t-text-strong)" }}
            value={search} onChange={e => handleSearch(e.target.value)} />
        </div>
        {isLoading ? (
          <div className="space-y-6">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl bg-primary/10" />)}</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-xl mb-4" style={{ color: "var(--t-text-muted)" }}>No posts yet.</p>
            <p style={{ color: "var(--t-text-muted)", opacity: 0.6 }}>Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post: any, i: number) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/blog/${post.id}`}>
                  <a className="block glass-card p-6 rounded-2xl group" style={{ border: `1px solid var(--t-border-subtle)` }}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.tags.slice(0, 3).map((tag: string, j: number) => (
                            <span key={j} className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: "var(--t-tag-bg)", color: "var(--t-tag-text)" }}>#{tag}</span>
                          ))}
                        </div>
                        <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors" style={{ color: "var(--t-text-strong)" }}>{post.title}</h2>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-mono mb-1" style={{ color: "var(--t-text-muted)" }}>{new Date(post.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs font-mono" style={{ color: "var(--t-text-muted)" }}>{post.readTime} min read</p>
                      </div>
                    </div>
                  </a>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
