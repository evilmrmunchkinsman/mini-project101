// ============================================================
//  StudentDashboard.tsx
//  BACKEND CONNECTION POINTS (all calls go through src/lib/api.ts):
//
//  HistoryView  → getChatSessions()       GET /student/sessions
//               → getChatSession(id)      GET /student/sessions/:id
//  ProfileView  → getProfile()            GET /student/profile
//               → updateProfile(data)     PATCH /student/profile
//  SettingsView → (no API — prefs stored locally; add your endpoint if needed)
//
//  HOW TO CONNECT:
//    1. Set VITE_API_URL=https://yourbackend.com in .env
//    2. In src/lib/api.ts adjust the endpoint paths to match yours
//    3. Adjust the type mappings below if your field names differ
// ============================================================
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, History, User, Settings, Clock, Search,
  Trash2, Check, X, ChevronRight, ArrowLeft, Loader2,
} from "lucide-react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/Layout";
import { ChatWindow, MessageBubble } from "@/components/ChatWindow";
import {
  getChatSessions, getChatSession, getProfile, updateProfile,
  type ChatSession, type AuthResponse,
} from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const SIDEBAR_ITEMS = [
  { label: "Chat", icon: MessageSquare, href: "/dashboard" },
  { label: "History", icon: History, href: "/dashboard/history" },
  { label: "Profile", icon: User, href: "/dashboard/profile" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

// ── Mock fallback data (shown when backend not connected) ────
const MOCK_SESSIONS: ChatSession[] = [
  {
    id: "1", title: "Quantum Physics Basics", date: "Today, 2:30 PM", messageCount: 14, subject: "Physics",
    messages: [
      { role: "user", content: "Can you explain quantum superposition?" },
      { role: "ai", content: "Quantum superposition means a particle exists in multiple states simultaneously until measured. Think of Schrödinger's cat — both alive and dead until observed." },
      { role: "user", content: "How does this apply to quantum computers?" },
      { role: "ai", content: "Qubits exploit superposition to be both 0 and 1 at the same time, letting quantum computers process many possibilities in parallel." },
    ],
  },
  {
    id: "2", title: "Calculus — Integration by Parts", date: "Yesterday, 4:15 PM", messageCount: 22, subject: "Mathematics",
    messages: [
      { role: "user", content: "How do I integrate x·eˣ?" },
      { role: "ai", content: "Use integration by parts: ∫u dv = uv − ∫v du. Set u = x and dv = eˣ dx. Result: eˣ(x−1) + C." },
    ],
  },
  {
    id: "3", title: "French Revolution Timeline", date: "May 3, 2024", messageCount: 8, subject: "History",
    messages: [
      { role: "user", content: "What started the French Revolution?" },
      { role: "ai", content: "Financial crisis, social inequality, and Enlightenment ideas. The storming of the Bastille on July 14, 1789 became the iconic starting point." },
    ],
  },
  {
    id: "4", title: "DNA Replication Process", date: "May 2, 2024", messageCount: 18, subject: "Biology",
    messages: [
      { role: "user", content: "Explain DNA replication simply." },
      { role: "ai", content: "DNA unwinds like a zipper, each strand acts as a template, and DNA polymerase builds complementary strands. Result: two identical copies." },
    ],
  },
  {
    id: "5", title: "Shakespeare — Hamlet Analysis", date: "May 1, 2024", messageCount: 11, subject: "Literature",
    messages: [
      { role: "user", content: "What is Hamlet's fatal flaw?" },
      { role: "ai", content: "Hamlet's fatal flaw is paralysis through overthinking — he demands absolute certainty before acting." },
    ],
  },
  {
    id: "6", title: "Photosynthesis Explained", date: "Apr 30, 2024", messageCount: 9, subject: "Biology",
    messages: [
      { role: "user", content: "How does photosynthesis work?" },
      { role: "ai", content: "Plants capture light via chlorophyll, convert CO₂ + H₂O → glucose + O₂ in two stages: light reactions and the Calvin cycle." },
    ],
  },
];

const MOCK_PROFILE: AuthResponse["user"] = {
  id: "mock", name: "John Doe", email: "john.doe@university.edu",
  role: "student", university: "State University", year: "3rd Year", major: "Computer Science",
};

const SUBJECT_COLORS: Record<string, string> = {
  Physics: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Mathematics: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  History: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Biology: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Literature: "bg-pink-500/15 text-pink-400 border-pink-500/20",
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
      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
        <Check className="w-3 h-3 text-emerald-400" />
      </div>
      {message}
    </motion.div>
  );
}

function ChatView() {
  return (
    <motion.div key="chat" {...fadeUp} className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold">Chat</h1>
          <p className="text-xs text-muted-foreground">Your personal study session</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-muted-foreground font-medium">StudyMind Online</span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatWindow />
      </div>
    </motion.div>
  );
}

function HistoryView() {
  const [query, setQuery] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>(MOCK_SESSIONS);
  const [selected, setSelected] = useState<ChatSession | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [fetching, setFetching] = useState(true);

  // ── Fetch session list on mount ──────────────────────────────
  // Calls GET /student/sessions
  // Your backend must return: ChatSession[] (see src/lib/api.ts for shape)
  // ── CHANGE: adjust getChatSessions() path in src/lib/api.ts ──
  useEffect(() => {
    getChatSessions()
      .then(setSessions)
      .catch(() => setSessions(MOCK_SESSIONS)) // fallback to mock
      .finally(() => setFetching(false));
  }, []);

  const openSession = async (s: ChatSession) => {
    if (s.messages && s.messages.length > 0) { setSelected(s); return; }

    setLoadingDetail(true);
    try {
      // ── Fetch full conversation for this session ─────────────
      // Calls GET /student/sessions/:id
      // Your backend must return: ChatSession with messages[]
      // ── CHANGE: adjust getChatSession() path in src/lib/api.ts ──
      const full = await getChatSession(s.id);
      setSelected(full);
    } catch {
      setSelected(s); // show what we have
    } finally {
      setLoadingDetail(false);
    }
  };

  const filtered = sessions.filter(
    (s) =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      (s.subject ?? "").toLowerCase().includes(query.toLowerCase())
  );

  if (loadingDetail) {
    return (
      <motion.div key="loading" {...fadeUp} className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </motion.div>
    );
  }

  if (selected) {
    return (
      <motion.div key="session-detail" {...fadeUp} className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
          <button
            onClick={() => setSelected(null)}
            className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            data-testid="button-back-history"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold">{selected.title}</h1>
            {/* ← CHANGE: your backend may use "messageCount" or "messages.length" */}
            <p className="text-xs text-muted-foreground">
              {selected.date} · {selected.messageCount ?? selected.messages?.length ?? 0} messages
            </p>
          </div>
          {selected.subject && (
            <span className={`ml-auto text-xs px-2.5 py-1 rounded-full border font-medium ${SUBJECT_COLORS[selected.subject] ?? "bg-secondary text-muted-foreground border-border"}`}>
              {selected.subject}
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {(selected.messages ?? []).map((msg, i) => (
            <MessageBubble key={i} role={msg.role} content={msg.content} index={i} />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div key="history" {...fadeUp} className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold">Chat History</h1>
          <p className="text-xs text-muted-foreground">
            {fetching ? "Loading…" : `${filtered.length} sessions`}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card/50 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sessions…"
            className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none w-36"
            data-testid="input-search-history"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
        {fetching ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Search className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">No sessions match "{query}"</p>
          </div>
        ) : filtered.map((session, i) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ x: 3 }}
            onClick={() => openSession(session)}
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/40 cursor-pointer hover:bg-card/70 hover:border-primary/30 transition-all group"
            data-testid={`history-session-${session.id}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold group-hover:text-primary transition-colors">{session.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{session.date}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  {/* ← CHANGE: use messageCount or messages.length depending on your API */}
                  <span className="text-xs text-muted-foreground">{session.messageCount ?? session.messages?.length ?? 0} messages</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {session.subject && (
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${SUBJECT_COLORS[session.subject] ?? "bg-secondary text-muted-foreground border-border"}`}>
                  {session.subject}
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

type ProfileData = { name: string; email: string; university: string; year: string; major: string };

function ProfileView() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [profile, setProfile] = useState<ProfileData>({
    name: user?.name ?? MOCK_PROFILE.name ?? "",
    email: user?.email ?? MOCK_PROFILE.email ?? "",
    university: user?.university ?? MOCK_PROFILE.university ?? "",
    year: user?.year ?? MOCK_PROFILE.year ?? "",
    major: user?.major ?? MOCK_PROFILE.major ?? "",
  });
  const [draft, setDraft] = useState<ProfileData>(profile);

  // ── Load profile from backend on mount ─────────────────────
  // Calls GET /student/profile
  // ── CHANGE: adjust getProfile() path in src/lib/api.ts ──────
  useEffect(() => {
    getProfile()
      .then((data) => {
        const loaded: ProfileData = {
          // ← CHANGE field names if your backend uses different keys
          name: data.name ?? profile.name,
          email: data.email ?? profile.email,
          university: data.university ?? profile.university,
          year: data.year ?? profile.year,
          major: data.major ?? profile.major,
        };
        setProfile(loaded);
        setDraft(loaded);
      })
      .catch(() => {}); // stay with localStorage/mock if fetch fails
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // ── Save profile to backend ───────────────────────────────
      // Calls PATCH /student/profile  →  sends { name, email, university, year, major }
      // ── CHANGE: adjust updateProfile() path in src/lib/api.ts ─
      await updateProfile(draft);
      setProfile(draft);
      setToast("Profile saved successfully");
    } catch {
      // save locally even if API fails
      setProfile(draft);
      setToast("Saved locally (backend unavailable)");
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  const handleCancel = () => { setDraft(profile); setEditing(false); };

  const FIELDS: { label: string; key: keyof ProfileData }[] = [
    { label: "Full Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "University", key: "university" },
    { label: "Year", key: "year" },
    { label: "Major", key: "major" },
  ];

  return (
    <motion.div key="profile" {...fadeUp} className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
        <h1 className="text-lg font-bold">Profile</h1>
        <p className="text-xs text-muted-foreground">Your account details</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-2xl space-y-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-5 p-5 rounded-2xl border border-border bg-card/50"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
            {profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="text-lg font-bold">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <span className="mt-1.5 inline-block text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 font-medium">
              Student
            </span>
          </div>
          {!editing ? (
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setEditing(true)}
              className="ml-auto text-xs px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 font-medium hover:bg-primary/20 transition-colors"
              data-testid="button-edit-profile"
            >
              Edit Profile
            </motion.button>
          ) : (
            <div className="ml-auto flex gap-2">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving}
                className="text-xs px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium shadow-md shadow-indigo-500/20 disabled:opacity-60 flex items-center gap-1.5"
                data-testid="button-save-profile"
              >
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                Save
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleCancel}
                className="text-xs px-4 py-2 rounded-lg bg-secondary text-muted-foreground font-medium hover:bg-secondary/80 transition-colors"
                data-testid="button-cancel-profile"
              >
                Cancel
              </motion.button>
            </div>
          )}
        </motion.div>

        <div className="rounded-2xl border border-border bg-card/30 overflow-hidden">
          {FIELDS.map((field, i) => (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 + 0.1 }}
              className="flex items-center justify-between px-5 py-4 border-b border-border/60 last:border-0"
              data-testid={`profile-field-${field.key}`}
            >
              <span className="text-sm text-muted-foreground w-28 flex-shrink-0">{field.label}</span>
              {editing ? (
                <input
                  value={draft[field.key]}
                  onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                  className="flex-1 ml-4 px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  data-testid={`input-profile-${field.key}`}
                />
              ) : (
                <span className="text-sm font-medium text-right">{profile[field.key]}</span>
              )}
            </motion.div>
          ))}
        </div>

        <div className="pt-2">
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/15 transition-colors"
            data-testid="button-sign-out"
          >
            Sign Out
          </motion.button>
        </div>
      </div>
      <AnimatePresence>{toast && <Toast message={toast} onDone={() => setToast("")} />}</AnimatePresence>
    </motion.div>
  );
}

type ToggleKey = "notifications" | "darkMode" | "privacy";

function SettingsView() {
  const [toast, setToast] = useState("");
  // ── Preferences stored locally ───────────────────────────────
  // If you want these synced to your backend, add a PATCH /student/settings call here
  // similar to updateAdminSetting() in AdminDashboard
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>(() => {
    try {
      const saved = localStorage.getItem("student_settings");
      return saved ? JSON.parse(saved) : { notifications: true, darkMode: true, privacy: false };
    } catch { return { notifications: true, darkMode: true, privacy: false }; }
  });

  const toggle = (key: ToggleKey) => {
    const next = { ...toggles, [key]: !toggles[key] };
    setToggles(next);
    localStorage.setItem("student_settings", JSON.stringify(next));
    setToast(`${key.charAt(0).toUpperCase() + key.slice(1)} ${!toggles[key] ? "enabled" : "disabled"}`);
  };

  const SETTINGS: { key: ToggleKey; label: string; description: string }[] = [
    { key: "notifications", label: "Notifications", description: "Receive session reminders and updates" },
    { key: "darkMode", label: "Dark Mode", description: "Use dark theme across the app" },
    { key: "privacy", label: "Privacy Mode", description: "Hide chat history from other devices" },
  ];

  return (
    <motion.div key="settings" {...fadeUp} className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
        <h1 className="text-lg font-bold">Settings</h1>
        <p className="text-xs text-muted-foreground">Manage your preferences</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-2xl space-y-3">
        {SETTINGS.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/40 hover:bg-card/60 transition-colors"
            data-testid={`setting-${s.key}`}
          >
            <div>
              <p className="text-sm font-medium">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.description}</p>
            </div>
            <button
              onClick={() => toggle(s.key)}
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

        <div className="pt-4 border-t border-border">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            onClick={() => setToast("Account deletion request submitted")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors"
            data-testid="button-delete-account"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </motion.button>
        </div>
      </div>
      <AnimatePresence>{toast && <Toast message={toast} onDone={() => setToast("")} />}</AnimatePresence>
    </motion.div>
  );
}

export function StudentDashboard() {
  const [location] = useLocation();

  const activeView = location.startsWith("/dashboard/history")
    ? "history"
    : location.startsWith("/dashboard/profile")
    ? "profile"
    : location.startsWith("/dashboard/settings")
    ? "settings"
    : "chat";

  return (
    <div className="flex h-screen bg-background" data-testid="student-dashboard">
      <Sidebar items={SIDEBAR_ITEMS} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {activeView === "chat" && <ChatView key="chat" />}
          {activeView === "history" && <HistoryView key="history" />}
          {activeView === "profile" && <ProfileView key="profile" />}
          {activeView === "settings" && <SettingsView key="settings" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
