// ============================================================
//  API SERVICE LAYER — StudyMind
//  Change BASE_URL and endpoint paths to match your backend.
//  Every function maps to one HTTP call.
// ============================================================

// ── 1. Base URL ──────────────────────────────────────────────
//  Set VITE_API_URL in your .env file, e.g.:
//    VITE_API_URL=https://api.yourdomain.com
//  Falls back to /api (same-origin proxy) if not set.
export const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

// ── 2. Token helpers ─────────────────────────────────────────
//  Change "studymind_token" to whatever key your backend uses.
const TOKEN_KEY = "studymind_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("studymind_user");
}

// ── 3. Base fetch wrapper ─────────────────────────────────────
//  Adds Authorization header to every request automatically.
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

// ============================================================
//  TYPES — Adjust field names to match your backend responses
// ============================================================

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;        // ← your backend JWT / session token
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "student"; // ← used for routing: admin → /admin, else → /dashboard
    plan?: string;
    university?: string;
    year?: string;
    major?: string;
  };
}

export interface Message {
  id?: string;
  role: "user" | "ai";
  content: string;
  createdAt?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  subject: string;
  date: string;
  messageCount: number;
  messages?: Message[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: "Active" | "Inactive";
  joined: string;
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  preview: string;
  time: string;
  messageCount: number;
  messages?: Message[];
}

export interface AnalyticsData {
  totalUsers: number;
  activeSessions: number;
  messagesToday: number;
  avgResponseTime: string;
  chartData: { day: string; messages: number }[];
  lineData: { day: string; users: number }[];
}

// ============================================================
//  AUTH ENDPOINTS
// ============================================================

// POST /auth/login  →  { email, password }  →  AuthResponse
export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// POST /auth/logout
export async function logoutUser(): Promise<void> {
  await request<void>("/auth/logout", { method: "POST" }).catch(() => {});
  clearToken();
}

// GET /auth/me  →  AuthResponse["user"]
export async function getMe(): Promise<AuthResponse["user"]> {
  return request<AuthResponse["user"]>("/auth/me");
}

// ============================================================
//  STUDENT ENDPOINTS
// ============================================================

// GET /student/sessions  →  ChatSession[]
export async function getChatSessions(): Promise<ChatSession[]> {
  return request<ChatSession[]>("/student/sessions");
}

// GET /student/sessions/:id  →  ChatSession (with messages)
export async function getChatSession(id: string): Promise<ChatSession> {
  return request<ChatSession>(`/student/sessions/${id}`);
}

// POST /student/chat  →  { sessionId?, message }  →  Message
export async function sendMessage(message: string, sessionId?: string): Promise<Message> {
  return request<Message>("/student/chat", {
    method: "POST",
    body: JSON.stringify({ message, sessionId }),
  });
}

// GET /student/profile  →  AuthResponse["user"]
export async function getProfile(): Promise<AuthResponse["user"]> {
  return request<AuthResponse["user"]>("/student/profile");
}

// PATCH /student/profile  →  Partial<AuthResponse["user"]>  →  AuthResponse["user"]
export async function updateProfile(data: Partial<AuthResponse["user"]>): Promise<AuthResponse["user"]> {
  return request<AuthResponse["user"]>("/student/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ============================================================
//  ADMIN ENDPOINTS
// ============================================================

// GET /admin/users?search=&plan=  →  User[]
export async function getUsers(search = "", plan = "All"): Promise<User[]> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (plan !== "All") params.set("plan", plan);
  return request<User[]>(`/admin/users?${params}`);
}

// PATCH /admin/users/:id/status  →  { status: "Active"|"Inactive" }  →  User
export async function toggleUserStatus(id: string, status: "Active" | "Inactive"): Promise<User> {
  return request<User>(`/admin/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// GET /admin/conversations?search=  →  Conversation[]
export async function getConversations(search = ""): Promise<Conversation[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  return request<Conversation[]>(`/admin/conversations${params}`);
}

// GET /admin/conversations/:id  →  Conversation (with messages)
export async function getConversation(id: string): Promise<Conversation> {
  return request<Conversation>(`/admin/conversations/${id}`);
}

// GET /admin/analytics?period=7d  →  AnalyticsData
export async function getAnalytics(period = "7d"): Promise<AnalyticsData> {
  return request<AnalyticsData>(`/admin/analytics?period=${period}`);
}

// PATCH /admin/settings  →  { key: string; value: boolean }  →  void
export async function updateAdminSetting(key: string, value: boolean): Promise<void> {
  return request<void>("/admin/settings", {
    method: "PATCH",
    body: JSON.stringify({ key, value }),
  });
}
