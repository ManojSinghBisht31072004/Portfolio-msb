import { useGetPost, getGetPostQueryKey } from "@/api/hooks";
import { useParams, Link } from "wouter";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ThemeSwitcherCompact } from "@/components/theme-switcher";
import { useTheme } from "@/lib/theme";

export default function BlogPost() {
  const params = useParams();
  const id = parseInt(params.id as string) || 1;
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: post, isLoading } = useGetPost(id, { query: { queryKey: getGetPostQueryKey(id), enabled: !!id } });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-4 max-w-3xl mx-auto space-y-6" style={{ backgroundColor: "var(--t-bg)" }}>
        <Skeleton className="h-8 w-32 bg-primary/10" />
        <Skeleton className="h-16 w-3/4 bg-primary/10" />
        <div className="space-y-4 pt-8">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-4 w-full bg-primary/5" />)}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--t-bg)" }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--t-text-strong)" }}>Post not found</h2>
          <Link href="/blog"><a className="text-primary hover:underline">← Back to blog</a></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "var(--t-bg)", color: "var(--t-text-strong)" }}>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card px-6 py-4 flex justify-between items-center" style={{ borderBottom: `1px solid var(--t-border-subtle)` }}>
        <Link href="/blog">
          <div className="font-display font-bold text-xl tracking-tight flex items-center gap-2 cursor-pointer hover:text-primary transition-colors" style={{ color: "var(--t-text-strong)" }}>
            <span className="text-primary">←</span> Blog
          </div>
        </Link>
        <ThemeSwitcherCompact />
      </nav>
      <article className="container px-4 pt-32 max-w-3xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map((tag: string, i: number) => (
            <Badge key={i} variant="outline" className="font-mono text-xs" style={{ background: "var(--t-badge-bg)", color: "var(--t-accent-hex)", borderColor: `rgba(var(--t-accent-rgb), 0.25)` }}>#{tag}</Badge>
          ))}
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-bold mb-6 leading-tight" style={{ color: "var(--t-hero-heading)" }}>{post.title}</h1>
        <div className="flex items-center gap-4 mb-12 pb-8" style={{ borderBottom: `1px solid var(--t-border-subtle)` }}>
          <p className="text-sm font-mono" style={{ color: "var(--t-text-muted)" }}>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <span style={{ color: "var(--t-border-medium)" }}>•</span>
          <p className="text-sm font-mono" style={{ color: "var(--t-text-muted)" }}>{post.readTime} min read</p>
        </div>
        <div className="prose max-w-none">
          <ReactMarkdown
            components={{
              code({ className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const isBlock = !props.inline;
                return isBlock && match ? (
                  <SyntaxHighlighter style={isDark ? atomDark : oneLight} language={match[1]} PreTag="div" className="rounded-xl overflow-hidden text-sm">
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ background: "var(--t-tag-bg)", color: "var(--t-accent-hex)" }} {...props}>{children}</code>
                );
              },
              h1: ({ children }) => <h1 style={{ color: "var(--t-text-strong)" }}>{children}</h1>,
              h2: ({ children }) => <h2 style={{ color: "var(--t-text-strong)" }}>{children}</h2>,
              h3: ({ children }) => <h3 style={{ color: "var(--t-text-strong)" }}>{children}</h3>,
              p: ({ children }) => <p style={{ color: "var(--t-text-muted)" }}>{children}</p>,
              a: ({ children, href }) => <a href={href} style={{ color: "var(--t-accent-hex)" }} className="hover:underline">{children}</a>,
              blockquote: ({ children }) => <blockquote className="rounded-r-lg py-1 pr-4" style={{ borderLeft: `4px solid var(--t-accent-hex)`, background: "var(--t-surface)", color: "var(--t-text-muted)" }}>{children}</blockquote>,
            }}
          >{post.content}</ReactMarkdown>
        </div>
        <div className="mt-16 pt-8" style={{ borderTop: `1px solid var(--t-border-subtle)` }}>
          <Link href="/blog"><a className="text-primary hover:underline font-medium">← Back to all posts</a></Link>
        </div>
      </article>
    </div>
  );
}
