import { useQuery, useMutation, type UseQueryOptions } from "@tanstack/react-query";

const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

/* ─── Query Keys ─── */
export const getGetSettingsQueryKey = () => ["settings"] as const;
export const getGetMeQueryKey = () => ["auth", "me"] as const;
export const getGetStatsQueryKey = () => ["stats"] as const;
export const getListExperiencesQueryKey = () => ["experience"] as const;
export const getListProjectsQueryKey = (params?: object) => ["projects", params] as const;
export const getListCertificationsQueryKey = () => ["certifications"] as const;
export const getListPostsQueryKey = (params?: object) => ["posts", params] as const;
export const getGetPostQueryKey = (id: number) => ["posts", id] as const;
export const getListMessagesQueryKey = () => ["messages"] as const;

/* ─── Settings ─── */
export function useGetSettings(opts?: { query?: UseQueryOptions<any> }) {
  return useQuery({ ...opts?.query, queryKey: getGetSettingsQueryKey(), queryFn: () => apiFetch("/settings") });
}
export function useUpdateSettings() {
  return useMutation({ mutationFn: ({ data }: { data: any }) => apiFetch("/settings", { method: "PUT", body: JSON.stringify(data) }) });
}

/* ─── Auth ─── */
export function useGetMe(opts?: { query?: UseQueryOptions<any> }) {
  return useQuery({ ...opts?.query, queryKey: getGetMeQueryKey(), queryFn: () => apiFetch("/auth/me") });
}
export function useLogin() {
  return useMutation({ mutationFn: ({ data }: { data: { email: string; password: string } }) => apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) }) });
}
export function useLogout() {
  return useMutation({ mutationFn: () => apiFetch("/auth/logout", { method: "POST" }) });
}
export function useChangePassword() {
  return useMutation({ mutationFn: ({ data }: { data: { currentPassword: string; newPassword: string } }) => apiFetch("/auth/password", { method: "PUT", body: JSON.stringify(data) }) });
}

/* ─── Stats ─── */
export function useGetStats(opts?: { query?: UseQueryOptions<any> }) {
  return useQuery({ ...opts?.query, queryKey: getGetStatsQueryKey(), queryFn: () => apiFetch("/stats") });
}

/* ─── Experience ─── */
export function useListExperiences(opts?: { query?: UseQueryOptions<any> }) {
  return useQuery({ ...opts?.query, queryKey: getListExperiencesQueryKey(), queryFn: () => apiFetch("/experience") });
}
export function useCreateExperience() {
  return useMutation({ mutationFn: ({ data }: { data: any }) => apiFetch("/experience", { method: "POST", body: JSON.stringify(data) }) });
}
export function useUpdateExperience() {
  return useMutation({ mutationFn: ({ id, data }: { id: number; data: any }) => apiFetch(`/experience/${id}`, { method: "PUT", body: JSON.stringify(data) }) });
}
export function useDeleteExperience() {
  return useMutation({ mutationFn: ({ id }: { id: number }) => apiFetch(`/experience/${id}`, { method: "DELETE" }) });
}

/* ─── Projects ─── */
export function useListProjects(params?: any, opts?: { query?: UseQueryOptions<any> }) {
  const qp = params ? new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString() : "";
  return useQuery({ ...opts?.query, queryKey: getListProjectsQueryKey(params), queryFn: () => apiFetch(`/projects${qp ? "?" + qp : ""}`) });
}
export function useCreateProject() {
  return useMutation({ mutationFn: ({ data }: { data: any }) => apiFetch("/projects", { method: "POST", body: JSON.stringify(data) }) });
}
export function useUpdateProject() {
  return useMutation({ mutationFn: ({ id, data }: { id: number; data: any }) => apiFetch(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }) });
}
export function useDeleteProject() {
  return useMutation({ mutationFn: ({ id }: { id: number }) => apiFetch(`/projects/${id}`, { method: "DELETE" }) });
}

/* ─── Certifications ─── */
export function useListCertifications(opts?: { query?: UseQueryOptions<any> }) {
  return useQuery({ ...opts?.query, queryKey: getListCertificationsQueryKey(), queryFn: () => apiFetch("/certifications") });
}
export function useCreateCertification() {
  return useMutation({ mutationFn: ({ data }: { data: any }) => apiFetch("/certifications", { method: "POST", body: JSON.stringify(data) }) });
}
export function useUpdateCertification() {
  return useMutation({ mutationFn: ({ id, data }: { id: number; data: any }) => apiFetch(`/certifications/${id}`, { method: "PUT", body: JSON.stringify(data) }) });
}
export function useDeleteCertification() {
  return useMutation({ mutationFn: ({ id }: { id: number }) => apiFetch(`/certifications/${id}`, { method: "DELETE" }) });
}

/* ─── Posts ─── */
export function useListPosts(params?: any, opts?: { query?: UseQueryOptions<any> }) {
  const qp = params ? new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)])).toString() : "";
  return useQuery({ ...opts?.query, queryKey: getListPostsQueryKey(params), queryFn: () => apiFetch(`/posts${qp ? "?" + qp : ""}`) });
}
export function useGetPost(id: number, opts?: { query?: UseQueryOptions<any> }) {
  return useQuery({ ...opts?.query, queryKey: getGetPostQueryKey(id), queryFn: () => apiFetch(`/posts/${id}`) });
}
export function useCreatePost() {
  return useMutation({ mutationFn: ({ data }: { data: any }) => apiFetch("/posts", { method: "POST", body: JSON.stringify(data) }) });
}
export function useUpdatePost() {
  return useMutation({ mutationFn: ({ id, data }: { id: number; data: any }) => apiFetch(`/posts/${id}`, { method: "PUT", body: JSON.stringify(data) }) });
}
export function useDeletePost() {
  return useMutation({ mutationFn: ({ id }: { id: number }) => apiFetch(`/posts/${id}`, { method: "DELETE" }) });
}

/* ─── Contact / Messages ─── */
export function useSubmitContact() {
  return useMutation({ mutationFn: ({ data }: { data: any }) => apiFetch("/contact", { method: "POST", body: JSON.stringify(data) }) });
}
export function useListMessages(opts?: { query?: UseQueryOptions<any> }) {
  return useQuery({ ...opts?.query, queryKey: getListMessagesQueryKey(), queryFn: () => apiFetch("/messages") });
}
export function useMarkMessageRead() {
  return useMutation({ mutationFn: ({ id }: { id: number }) => apiFetch(`/messages/${id}/read`, { method: "PATCH" }) });
}
export function useDeleteMessage() {
  return useMutation({ mutationFn: ({ id }: { id: number }) => apiFetch(`/messages/${id}`, { method: "DELETE" }) });
}
