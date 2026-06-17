import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--t-bg)" }}>
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl mb-8" style={{ color: "var(--t-text-muted)" }}>Page not found</p>
        <Link href="/">
          <a className="text-primary hover:underline">← Back to home</a>
        </Link>
      </div>
    </div>
  );
}
