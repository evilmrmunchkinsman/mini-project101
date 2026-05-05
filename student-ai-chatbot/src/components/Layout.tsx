import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Menu, X, Sparkles, LucideIcon } from "lucide-react";
import { useScrolled } from "@/hooks/useScrolled";
import { useTheme } from "@/hooks/useTheme";

// ─── Navbar ────────────────────────────────────────────────
interface NavbarProps {
  onSignInClick: () => void;
}

export function Navbar({ onSignInClick }: NavbarProps) {
  const scrolled = useScrolled(20);
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/70 backdrop-blur-xl border-b border-border shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <motion.div className="flex items-center gap-2 cursor-pointer" whileHover={{ scale: 1.02 }} data-testid="nav-logo">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                StudyMind
              </span>
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg border border-border bg-card/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <motion.button
              onClick={onSignInClick}
              whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25"
              data-testid="button-sign-in-nav"
            >
              Sign In
            </motion.button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="w-9 h-9 rounded-lg border border-border bg-card/50 flex items-center justify-center text-muted-foreground" data-testid="button-theme-toggle-mobile">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="w-9 h-9 rounded-lg border border-border bg-card/50 flex items-center justify-center text-muted-foreground" data-testid="button-mobile-menu">
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-4 pb-4"
          >
            <button
              onClick={() => { onSignInClick(); setMenuOpen(false); }}
              className="w-full mt-2 py-2 px-4 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium"
              data-testid="button-sign-in-mobile"
            >
              Sign In
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ─── Sidebar ────────────────────────────────────────────────
interface SidebarItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

interface SidebarProps {
  items: SidebarItem[];
  title?: string;
}

export function Sidebar({ items, title = "StudyMind" }: SidebarProps) {
  const [location] = useLocation();

  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="hidden md:flex flex-col w-60 flex-shrink-0 bg-sidebar border-r border-sidebar-border h-screen sticky top-0"
    >
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-bold text-sidebar-foreground">{title}</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1" data-testid="sidebar-nav">
        {items.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-medium ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/20 to-violet-500/10 text-sidebar-foreground border border-primary/20"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
                data-testid={`sidebar-link-${item.label.toLowerCase()}`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
                {item.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">Student</p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
