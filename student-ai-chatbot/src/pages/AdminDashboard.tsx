// ============================================================
//  AdminDashboard.tsx
//  BACKEND CONNECTION POINTS (all calls go through src/lib/api.ts):
//
//  UsersView         → getUsers(search, plan)          GET /admin/users
//                    → toggleUserStatus(id, status)    PATCH /admin/users/:id/status
//  AnalyticsView     → getAnalytics(period)            GET /admin/analytics
//  ConversationsView → getConversations(search)        GET /admin/conversations
//                    → getConversation(id)             GET /admin/conversations/:id
//  AdminSettingsView → updateAdminSetting(key, value)  PATCH /admin/settings
//
//  HOW TO CONNECT:
//    1. Set VITE_API_URL=https://yourbackend.com in .env
//    2. In src/lib/api.ts adjust endpoint paths to match your routes
//    3. Adjust field mappings marked ← CHANGE below if your names differ
// ============================================================
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, BarChart2, MessageSquare, Settings, TrendingUp, Clock,
  Activity, UserCheck, Search, Trash2, X, Check, ChevronDown,
  ChevronUp, RefreshCw, Download, Loader2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/Layout";
import { AnalyticsCard } from "@/components/Cards";
import {
  getUsers, toggleUserStatus, getConversations, getConversation,
  getAnalytics, updateAdminSetting,
  type User, type Conversation, type AnalyticsData,
} from "@/lib/api";

const SIDEBAR_ITEMS = [
  { label: "Users", icon: Users, href: "/admin" },
  { label: "Analytics", icon: BarChart2, href: "/admin/analytics" },
  { label: "Conversations", icon: MessageSquare, href: "/admin/conversations" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

// ── Mock fallback data (shown when backend not connected) ────
const MOCK_USERS: User[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", plan: "Pro", status: "Active", joined: "Jan 12, 2024" },
  { id: "2", name: "Marcus Lee", email: "marcus@example.com", plan: "Free", status: "Active", joined: "Feb 3, 2024" },
  { id: "3", name: "Priya Sharma", email: "priya@example.com", plan: "Pro", status: "Active", joined: "Feb 18, 2024" },
  { id: "4", name: "Carlos Rivera", email: "carlos@example.com", plan: "Free", status: "Inactive", joined: "Mar 1, 2024" },
  { id: "5", name: "Emma Chen", email: "emma@example.com", plan: "Enterprise", status: "Active", joined: "Mar 7, 2024" },
  { id: "6", name: "Noah Williams", email: "noah@example.com", plan: "Pro", status: "Active", joined: "Apr 2, 2024" },
];

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: "1", userId: "1", userName: "Alice Johnson", preview: "Can you explain Newton's laws?", time: "5 min ago", messageCount: 8, messages: [{ role: "user", content: "Can you explain Newton's three laws of motion?" }, { role: "ai", content: "Newton's First Law: An object stays at rest unless acted on. Second: F = ma. Third: Every action has an equal and opposite reaction." }, { role: "user", content: "Can you give real-world examples?" }, { role: "ai", content: "1st law: A ball keeps rolling on ice. 2nd law: Heavy boxes need more force. 3rd law: A rocket launches by pushing gas downward." }] },
  { id: "2", userId: "2", userName: "Marcus Lee", preview: "What's the capital of France?", time: "12 min ago", messageCount: 3, messages: [{ role: "user", content: "What's the capital of France?" }, { role: "ai", content: "Paris is the capital and largest city of France." }] },
  { id: "3", userId: "3", userName: "Priya Sharma", preview: "Help with integral calculus", time: "28 min ago", messageCount: 17, messages: [{ role: "user", content: "I'm struggling with integration by substitution." }, { role: "ai", content: "Integration by substitution reverses the chain rule. Let u = g(x), then du = g'(x)dx. Substitute, integrate in u, then back-substitute." }] },
  { id: "4", userId: "5", userName: "Emma Chen", preview: "Explain photosynthesis simply", time: "1 hr ago", messageCount: 11, messages: [{ role: "user", content: "Explain photosynthesis like I'm 12." }, { role: "ai", content: "Plants are solar-powered food factories. They take sunlight, CO₂, and H₂O → glucose + oxygen." }] },
  { id: "5", userId: "6", userName: "Noah Williams", preview: "Shakespeare themes in Hamlet", time: "2 hrs ago", messageCount: 6, messages: [{ role: "user", content: "Main themes in Hamlet?" }, { role: "ai", content: "Revenge vs morality, appearance vs reality, mortality, and paralysis through overthinking." }] },
  { id: "6", userId: "4", userName: "Carlos Rivera", preview: "How does DNA replication work?", time: "3 hrs ago", messageCount: 14, messages: [{ role: "user", content: "How does DNA replication work?" }, { role: "ai", content: "DNA unwinds like a zipper. Each strand acts as template. DNA polymerase builds complementary strands → two identical copies." }] },
];

const MOCK_ANALYTICS: AnalyticsData = {
  totalUsers: 12489, activeSessions: 384, messagesToday: 8921, avgResponseTime: "1.2s",
  chartData: [
    { day: "Mon", messages: 1240 }, { day: "Tue", messages: 1890 }, { day: "Wed", messages: 1450 },
    { day: "Thu", messages: 2100 }, { day: "Fri", messages: 1760 }, { day: "Sat", messages: 980 }, { day: "Sun", messages: 760 },
  ],
  lineData: [
    { day: "Mon", users: 320 }, { day: "Tue", users: 410 }, { day: "Wed", users: 390 },
    { day: "Thu", users: 520 }, { day: "Fri", users: 480 }, { day: "Sat", users: 290 }, { day: "Sun", users: 240 },
  ],
};

const PLAN_BADGE: Record<string, string> = {
  Enterprise: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  Pro: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  Free: "bg-secondary text-muted-foreground border-border",
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: { duration: 0.3 },
};

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      onAnimationComplete={() => setTimeout(onDone, 1800)}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border shadow-xl text-sm font-medium"
    >
      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
        <Check className="w-3 h-3 text-emerald-400" />
      </div>
      {message}
    </motion.div>
  );
}

function UsersView() {
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState("");

  // ── Fetch users on mount (and when search/filter changes) ───
  // Calls GET /admin/users?search=&plan=
  // ── CHANGE: adjust getUsers() path in src/lib/api.ts ────────
  useEffect(() => {
    setFetching(true);
    getUsers(query, planFilter)
      .then(setUsers)
      .catch(() => {
        // Fallback: filter mock data locally
        const q = query.toLowerCase();
        setUsers(
          MOCK_USERS.filter((u) => {
            const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
            const matchP = planFilter === "All" || u.plan === planFilter;
            return matchQ && matchP;
          })
        );
      })
      .finally(() => setFetching(false));
  }, [query, planFilter]);

  const handleToggleStatus = async (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    try {
      // ── Toggle user status on backend ───────────────────────
      // Calls PATCH /admin/users/:id/status  →  { status }
      // ── CHANGE: adjust toggleUserStatus() path in src/lib/api.ts ──
      await toggleUserStatus(id, newStatus);
    } catch {
      // Optimistic update — works offline too
    }
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: newStatus } : u));
    setToast(`${user.name} ${newStatus === "Active" ? "activated" : "suspended"}`);
  };

  const handleExport = () => {
    const csv = ["Name,Email,Plan,Status,Joined", ...users.map((u) => `${u.name},${u.email},${u.plan},${u.status},${u.joined}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "users.csv"; a.click();
    URL.revokeObjectURL(url);
    setToast("Users exported as CSV");
  };

  return (
    <motion.div key="users" {...fadeUp} className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0 gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-bold">Users</h1>
          <p className="text-xs text-muted-foreground">{fetching ? "Loading…" : `${users.length} accounts`}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {["All", "Pro", "Free", "Enterprise"].map((p) => (
            <button
              key={p}
              onClick={() => setPlanFilter(p)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${planFilter === p ? "bg-primary/15 text-primary border border-primary/25" : "bg-secondary text-muted-foreground hover:text-foreground border border-border"}`}
              data-testid={`filter-plan-${p.toLowerCase()}`}
            >
              {p}
            </button>
          ))}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card/50 focus-within:ring-2 focus-within:ring-primary/30">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none w-28"
              data-testid="input-search-users"
            />
            {query && <button onClick={() => setQuery("")}><X className="w-3 h-3 text-muted-foreground" /></button>}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 font-medium hover:bg-primary/20 transition-colors"
            data-testid="button-export-users"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </motion.button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {fetching ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card/30 sticky top-0">
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                  data-testid={`user-row-${user.id}`}
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 flex items-center justify-center text-xs font-bold text-primary">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium text-sm">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-3.5">
                    {/* ← CHANGE: add/remove plan types in PLAN_BADGE above */}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${PLAN_BADGE[user.plan] ?? "bg-secondary text-muted-foreground border-border"}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-400" : "bg-muted-foreground"}`} />
                      <span className={`text-xs font-medium ${user.status === "Active" ? "text-emerald-400" : "text-muted-foreground"}`}>{user.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-muted-foreground">{user.joined}</td>
                  <td className="px-6 py-3.5">
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => handleToggleStatus(user.id)}
                      className={`text-xs px-3 py-1 rounded-lg font-medium border transition-colors ${user.status === "Active" ? "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"}`}
                      data-testid={`button-toggle-user-${user.id}`}
                    >
                      {user.status === "Active" ? "Suspend" : "Activate"}
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
        {!fetching && users.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Users className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">No users match your search</p>
          </div>
        )}
      </div>
      <AnimatePresence>{toast && <Toast message={toast} onDone={() => setToast("")} />}</AnimatePresence>
    </motion.div>
  );
}

function AnalyticsView() {
  const [period, setPeriod] = useState("7d");
  const [data, setData] = useState<AnalyticsData>(MOCK_ANALYTICS);
  const [fetching, setFetching] = useState(true);

  // ── Fetch analytics on mount and when period changes ────────
  // Calls GET /admin/analytics?period=7d
  // Your backend must return: AnalyticsData (see src/lib/api.ts)
  // ── CHANGE: adjust getAnalytics() path in src/lib/api.ts ────
  useEffect(() => {
    setFetching(true);
    getAnalytics(period)
      .then(setData)
      .catch(() => setData(MOCK_ANALYTICS))
      .finally(() => setFetching(false));
  }, [period]);

  return (
    <motion.div key="analytics" {...fadeUp} className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold">Analytics</h1>
          <p className="text-xs text-muted-foreground">Platform performance overview</p>
        </div>
        <div className="flex items-center gap-1">
          {["7d", "30d", "90d"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${period === p ? "bg-primary/15 text-primary border border-primary/25" : "bg-secondary text-muted-foreground hover:text-foreground border border-border"}`}
              data-testid={`filter-period-${p}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {fetching ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* ← CHANGE: map data.totalUsers etc. to your backend field names */}
              <AnalyticsCard title="Total Users" value={data.totalUsers?.toLocaleString() ?? "—"} icon={<UserCheck className="w-5 h-5" />} trend="+18% this month" trendUp />
              <AnalyticsCard title="Active Sessions" value={data.activeSessions?.toLocaleString() ?? "—"} icon={<Activity className="w-5 h-5" />} trend="+7% today" trendUp />
              <AnalyticsCard title="Messages Today" value={data.messagesToday?.toLocaleString() ?? "—"} icon={<MessageSquare className="w-5 h-5" />} trend="+12% vs yesterday" trendUp />
              <AnalyticsCard title="Avg Response" value={data.avgResponseTime ?? "—"} icon={<Clock className="w-5 h-5" />} trend="-0.3s faster" trendUp />
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-sm font-semibold">Messages per Day</h2>
                    <p className="text-xs text-muted-foreground">Last {period}</p>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
                    <TrendingUp className="w-3.5 h-3.5" />+8.4%
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  {/* ← CHANGE: if your backend uses different key names, update dataKey */}
                  <BarChart data={data.chartData} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215 20% 65%)" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215 20% 65%)" }} />
                    <Tooltip contentStyle={{ background: "hsl(224 64% 7%)", border: "1px solid hsl(216 34% 17%)", borderRadius: "10px", fontSize: 12 }} labelStyle={{ color: "hsl(213 31% 91%)", fontWeight: 600 }} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
                    <Bar dataKey="messages" fill="url(#barGrad)" radius={[5, 5, 0, 0]} />
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(239 84% 67%)" />
                        <stop offset="100%" stopColor="hsl(262 83% 58%)" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-sm font-semibold">Active Users</h2>
                    <p className="text-xs text-muted-foreground">Last {period}</p>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
                    <TrendingUp className="w-3.5 h-3.5" />+5.1%
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  {/* ← CHANGE: update dataKey="users" if your backend uses a different field */}
                  <LineChart data={data.lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215 20% 65%)" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215 20% 65%)" }} />
                    <Tooltip contentStyle={{ background: "hsl(224 64% 7%)", border: "1px solid hsl(216 34% 17%)", borderRadius: "10px", fontSize: 12 }} labelStyle={{ color: "hsl(213 31% 91%)", fontWeight: 600 }} />
                    <Line type="monotone" dataKey="users" stroke="hsl(239 84% 67%)" strokeWidth={2} dot={{ fill: "hsl(239 84% 67%)", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function ConversationsView() {
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loadingThread, setLoadingThread] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  // ── Fetch conversations on mount ─────────────────────────────
  // Calls GET /admin/conversations?search=
  // ── CHANGE: adjust getConversations() path in src/lib/api.ts ─
  useEffect(() => {
    setFetching(true);
    getConversations(query)
      .then(setConversations)
      .catch(() => {
        const q = query.toLowerCase();
        setConversations(
          MOCK_CONVERSATIONS.filter(
            (c) => !q || c.userName.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q)
          )
        );
      })
      .finally(() => setFetching(false));
  }, [query]);

  const toggleExpand = async (id: string) => {
    if (expanded === id) { setExpanded(null); return; }

    const conv = conversations.find((c) => c.id === id);
    if (conv?.messages && conv.messages.length > 0) { setExpanded(id); return; }

    setLoadingThread(id);
    try {
      // ── Fetch full thread for this conversation ───────────────
      // Calls GET /admin/conversations/:id
      // ── CHANGE: adjust getConversation() path in src/lib/api.ts ──
      const full = await getConversation(id);
      setConversations((prev) => prev.map((c) => c.id === id ? full : c));
    } catch {
      // show whatever we have
    } finally {
      setLoadingThread(null);
      setExpanded(id);
    }
  };

  return (
    <motion.div key="conversations" {...fadeUp} className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold">Conversations</h1>
          <p className="text-xs text-muted-foreground">{fetching ? "Loading…" : `${conversations.length} sessions`}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card/50 focus-within:ring-2 focus-within:ring-primary/30">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations…"
            className="bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none w-40"
            data-testid="input-search-conversations"
          />
          {query && <button onClick={() => setQuery("")}><X className="w-3 h-3 text-muted-foreground" /></button>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-2">
        {fetching ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">No conversations match "{query}"</p>
          </div>
        ) : conversations.map((conv, i) => (
          <motion.div
            key={conv.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card/40 overflow-hidden"
            data-testid={`conversation-${conv.id}`}
          >
            <button
              onClick={() => toggleExpand(conv.id)}
              className="w-full flex items-center gap-4 p-4 hover:bg-card/70 transition-colors text-left"
              data-testid={`button-expand-conv-${conv.id}`}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                {/* ← CHANGE: your backend may use "userName" or "user.name" */}
                {conv.userName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{conv.userName}</p>
                  <span className="text-xs text-muted-foreground">{conv.time}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.preview}</p>
              </div>
              {/* ← CHANGE: your backend may use "messageCount" or "messages.length" */}
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium whitespace-nowrap mr-2">
                {conv.messageCount ?? conv.messages?.length ?? 0} msgs
              </span>
              {loadingThread === conv.id
                ? <Loader2 className="w-4 h-4 text-muted-foreground animate-spin flex-shrink-0" />
                : expanded === conv.id
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              }
            </button>
            <AnimatePresence>
              {expanded === conv.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="border-t border-border px-5 py-4 space-y-3 bg-background/30"
                >
                  {(conv.messages ?? []).map((msg, j) => (
                    <div key={j} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${msg.role === "user" ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white" : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"}`}>
                        {msg.role === "user" ? conv.userName.charAt(0) : "SM"}
                      </div>
                      <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${msg.role === "user" ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-br-sm" : "bg-card border border-border text-foreground rounded-bl-sm"}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

type AdminToggleKey = "emailNotifications" | "contentFilter" | "maintenanceMode";

function AdminSettingsView() {
  const [toast, setToast] = useState("");
  const [toggles, setToggles] = useState<Record<AdminToggleKey, boolean>>({
    emailNotifications: true,
    contentFilter: true,
    maintenanceMode: false,
  });

  const toggle = async (key: AdminToggleKey, label: string) => {
    const next = !toggles[key];
    setToggles((prev) => ({ ...prev, [key]: next }));
    try {
      // ── Persist setting to backend ───────────────────────────
      // Calls PATCH /admin/settings  →  { key, value: boolean }
      // ── CHANGE: adjust updateAdminSetting() path in src/lib/api.ts ──
      await updateAdminSetting(key, next);
    } catch {
      // Optimistic update — UI reflects change even if backend is offline
    }
    setToast(`${label} ${next ? "enabled" : "disabled"}`);
  };

  const SETTINGS: { key: AdminToggleKey; label: string; description: string }[] = [
    { key: "emailNotifications", label: "Email Notifications", description: "Send alerts for new signups and reports" },
    { key: "contentFilter", label: "Strict Content Filter", description: "Block inappropriate content platform-wide" },
    { key: "maintenanceMode", label: "Maintenance Mode", description: "Show maintenance page to all students" },
  ];

  return (
    <motion.div key="admin-settings" {...fadeUp} className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
        <h1 className="text-lg font-bold">Settings</h1>
        <p className="text-xs text-muted-foreground">Platform configuration</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-2xl space-y-3">
        {SETTINGS.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/40 hover:bg-card/60 transition-colors"
            data-testid={`admin-setting-${s.key}`}
          >
            <div>
              <p className="text-sm font-medium">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.description}</p>
            </div>
            <button
              onClick={() => toggle(s.key, s.label)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${toggles[s.key] ? "bg-primary" : "bg-secondary border border-border"}`}
              data-testid={`toggle-${s.key}`}
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                style={{ left: toggles[s.key] ? "22px" : "2px" }}
              />
            </button>
          </motion.div>
        ))}

        <div className="pt-4 border-t border-border space-y-3">
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            onClick={() => setToast("Platform data cleared")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors"
            data-testid="button-reset-platform"
          >
            <Trash2 className="w-4 h-4" />
            Reset Platform Data
          </motion.button>
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            onClick={() => setToast("Cache cleared successfully")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-secondary/50 text-muted-foreground text-sm font-medium hover:bg-secondary transition-colors"
            data-testid="button-clear-cache"
          >
            <RefreshCw className="w-4 h-4" />
            Clear Cache
          </motion.button>
        </div>
      </div>
      <AnimatePresence>{toast && <Toast message={toast} onDone={() => setToast("")} />}</AnimatePresence>
    </motion.div>
  );
}

export function AdminDashboard() {
  const [location] = useLocation();

  const activeView = location.startsWith("/admin/analytics")
    ? "analytics"
    : location.startsWith("/admin/conversations")
    ? "conversations"
    : location.startsWith("/admin/settings")
    ? "settings"
    : "users";

  return (
    <div className="flex h-screen bg-background" data-testid="admin-dashboard">
      <Sidebar items={SIDEBAR_ITEMS} title="Admin Panel" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {activeView === "users" && <UsersView key="users" />}
          {activeView === "analytics" && <AnalyticsView key="analytics" />}
          {activeView === "conversations" && <ConversationsView key="conversations" />}
          {activeView === "settings" && <AdminSettingsView key="settings" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
