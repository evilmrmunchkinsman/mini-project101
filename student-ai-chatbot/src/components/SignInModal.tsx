import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useLocation } from "wouter";
import { loginUser, setToken } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Demo quick-fill (remove once your backend is connected) ──
const DEMO_ACCOUNTS = [
  { email: "admin@studymind.com", password: "admin123", label: "Admin" },
  { email: "student@studymind.com", password: "student123", label: "Student" },
];

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { saveUser } = useAuth();

  const handleSubmit = async () => {
    setError("");
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      // ── Calls POST /auth/login from src/lib/api.ts ──────────
      // Your backend must return: { token: string, user: { role: "admin"|"student", ... } }
      // Change the endpoint path inside src/lib/api.ts → loginUser()
      const data = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      // Store token + user
      setToken(data.token);
      saveUser(data.user);

      onClose();
      setEmail("");
      setPassword("");

      // Route based on role your backend returns
      setLocation(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const fillDemo = (a: (typeof DEMO_ACCOUNTS)[0]) => {
    setEmail(a.email);
    setPassword(a.password);
    setError("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            data-testid="modal-backdrop"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="pointer-events-auto w-full max-w-md rounded-2xl border border-border bg-card/95 backdrop-blur-2xl shadow-2xl shadow-black/50 p-8 relative"
              data-testid="sign-in-modal"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-close-modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Welcome back</h2>
                  <p className="text-xs text-muted-foreground">
                    Sign in to StudyMind
                  </p>
                </div>
              </div>

              {/* Demo quick-fill — remove this block once your backend is live */}
              <div className="mb-5 p-3 rounded-xl bg-primary/8 border border-primary/20">
                <p className="text-xs font-semibold text-primary mb-2">
                  Demo accounts — click to fill
                </p>
                <div className="flex gap-2">
                  {DEMO_ACCOUNTS.map((a) => (
                    <button
                      key={a.label}
                      onClick={() => fillDemo(a)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-primary/15 hover:bg-primary/25 border border-primary/20 text-xs font-medium text-primary transition-colors"
                      data-testid={`button-demo-${a.label.toLowerCase()}`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    onClose();
                    setLocation("/dashboard");
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-border bg-secondary/50 flex items-center justify-center gap-3 text-sm font-medium hover:bg-secondary transition-colors"
                  data-testid="button-google-signin"
                >
                  <SiGoogle className="w-4 h-4" />
                  Continue with Google
                </motion.button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">
                    or continue with email
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                      data-testid="input-email"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="••••••••"
                        className="w-full px-3 py-2.5 pr-10 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                        data-testid="input-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        data-testid="button-toggle-password"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-destructive/10 border border-destructive/30"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                      <span className="text-xs text-destructive">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  onClick={handleSubmit}
                  disabled={loading}
                  whileHover={
                    !loading
                      ? {
                          scale: 1.01,
                          boxShadow: "0 0 20px rgba(99,102,241,0.4)",
                        }
                      : {}
                  }
                  whileTap={!loading ? { scale: 0.99 } : {}}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  data-testid="button-login-submit"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Sign In"
                  )}
                </motion.button>
              </div>

              <p className="mt-5 text-center text-xs text-muted-foreground">
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    onClose();
                    setLocation("/dashboard");
                  }}
                  className="text-primary hover:underline font-medium"
                  data-testid="link-sign-up"
                >
                  Get started free
                </button>
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
