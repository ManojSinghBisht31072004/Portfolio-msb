import { useState, useEffect } from "react";
import { useLogin, useGetMe, getGetMeQueryKey } from "@/api/hooks";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: auth, isLoading } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const login = useLogin();

  useEffect(() => {
    if (!isLoading && auth?.authenticated) setLocation("/admin/dashboard");
  }, [isLoading, auth?.authenticated]);

  if (isLoading || auth?.authenticated) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ data: { email, password } }, {
      onSuccess: () => {
        toast({ title: "Authenticated", description: "Welcome back, Commander." });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/admin/dashboard");
      },
      onError: () => toast({ title: "Access Denied", description: "Invalid credentials.", variant: "destructive" }),
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <a href="/" className="absolute top-5 left-5 text-sm text-white/40 hover:text-white transition-colors font-mono z-20">← Back to site</a>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 50% 50%, rgba(123, 47, 255, 0.1) 0%, transparent 50%)` }} />
      <Card className="w-full max-w-md glass-card border-white/10 z-10 relative">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-display font-bold text-white tracking-tight">System Login</CardTitle>
          <CardDescription className="font-mono text-muted-foreground">Authorized personnel only</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground uppercase">Identity (Email)</label>
              <Input type="email" required className="bg-black/50 border-white/10 text-white font-mono" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground uppercase">Passkey</label>
              <Input type="password" required className="bg-black/50 border-white/10 text-white font-mono" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full mt-6 font-bold tracking-widest uppercase" disabled={login.isPending}>
              {login.isPending ? "Authenticating..." : "Initialize Session"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
