import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLocation } from "wouter";
import { MessageSquare, Zap, Brain, History, ArrowRight, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/Layout";
import { SignInModal } from "@/components/SignInModal";
import { FeatureCard } from "@/components/Cards";
import { TypingIndicator, MessageBubble } from "@/components/ChatWindow";

const FEATURES = [
  {
    title: "Chat",
    description: "Have natural conversations with a smart tutor that adapts to your learning style and pace.",
    icon: <MessageSquare className="w-6 h-6" />,
  },
  {
    title: "Instant Answers",
    description: "Get clear, accurate answers to complex questions in seconds — no more searching for hours.",
    icon: <Zap className="w-6 h-6" />,
  },
  {
    title: "Smart Learning",
    description: "Smart learning that understands context, remembers what you've learned, and builds on your knowledge.",
    icon: <Brain className="w-6 h-6" />,
  },
  {
    title: "Chat History",
    description: "All your study sessions saved. Revisit past conversations and track your learning progress.",
    icon: <History className="w-6 h-6" />,
  },
];

const PREVIEW_MESSAGES = [
  { role: "user" as const, content: "Explain quantum entanglement simply." },
  { role: "ai" as const, content: "Imagine two particles born together — when you measure one, the other instantly 'knows' regardless of distance. Einstein called it 'spooky action at a distance.'" },
  { role: "user" as const, content: "How is this used in quantum computers?" },
];

function FloatingChatPreview() {
  const [showTyping, setShowTyping] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState(1);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setVisibleMessages(2), 1000));
    timers.push(setTimeout(() => setVisibleMessages(3), 2200));
    timers.push(setTimeout(() => setShowTyping(true), 3000));
    timers.push(setTimeout(() => {
      setShowTyping(false);
      setVisibleMessages(4);
    }, 4500));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateY: -5 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
      className="relative"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="bg-card/70 backdrop-blur-2xl border border-border rounded-2xl p-5 shadow-2xl shadow-black/40 w-full max-w-sm mx-auto"
        data-testid="hero-chat-preview"
      >
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-muted-foreground">StudyMind</span>
          <span className="ml-auto text-xs text-emerald-400 font-medium">Online</span>
        </div>
        <div className="space-y-3">
          {PREVIEW_MESSAGES.slice(0, visibleMessages).map((msg, i) => (
            <MessageBubble key={i} role={msg.role} content={msg.content} index={i} />
          ))}
          {showTyping && (
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs flex-shrink-0">SM</div>
              <TypingIndicator />
            </div>
          )}
          {visibleMessages >= 4 && (
            <MessageBubble
              role="ai"
              content="Quantum computers use entanglement to process multiple states simultaneously, giving them exponential speedups for certain problems."
              index={3}
            />
          )}
        </div>
      </motion.div>

      <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-violet-500/20 rounded-full blur-2xl pointer-events-none" />
    </motion.div>
  );
}

export function LandingPage() {
  const [signInOpen, setSignInOpen] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar onSignInClick={() => setSignInOpen(true)} />
      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />

      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center py-20">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-8"
                data-testid="badge-hero"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Powered by Advanced Technology
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight"
                data-testid="heading-hero"
              >
                Your{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                  Smart
                </span>{" "}
                Study Companion
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg"
              >
                Learn faster, understand deeper. StudyMind gives you an always-on tutor that explains anything, remembers your progress, and adapts to how you think.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-10 flex flex-col sm:flex-row gap-4"
              >
                <motion.button
                  onClick={() => setLocation("/dashboard")}
                  whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(99, 102, 241, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-xl shadow-indigo-500/30 transition-all"
                  data-testid="button-get-started"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={() => setSignInOpen(true)}
                  whileHover={{ scale: 1.02, borderColor: "rgba(99,102,241,0.6)" }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl border border-border bg-card/40 backdrop-blur-sm text-foreground font-semibold transition-all hover:bg-card/60"
                  data-testid="button-sign-in-hero"
                >
                  Sign In
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-12 flex items-center gap-6"
              >
                {[["10K+", "Students"], ["98%", "Accuracy"], ["24/7", "Available"]].map(([val, label]) => (
                  <div key={label} className="text-center">
                    <div className="text-2xl font-bold text-foreground">{val}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <FloatingChatPreview />
            </div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8" data-testid="section-features">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Everything you need to excel</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Purpose-built tools that make studying feel less like work and more like discovery.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} title={f.title} description={f.description} icon={f.icon} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Chat Preview Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" data-testid="section-chat-preview">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">See it in action</h2>
            <p className="text-muted-foreground text-lg">Real-time explanations that match your level.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl shadow-black/30"
          >
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold">Live Session</span>
              <span className="ml-auto text-xs text-muted-foreground">Today, 2:41 PM</span>
            </div>
            <div className="space-y-4">
              {[
                { role: "user" as const, content: "What's the difference between mitosis and meiosis?" },
                { role: "ai" as const, content: "Mitosis produces two identical daughter cells for growth and repair — same chromosome count as the parent. Meiosis produces four genetically unique cells with half the chromosomes, specifically for sexual reproduction. Think of mitosis as copying, meiosis as remixing." },
                { role: "user" as const, content: "Give me a memory trick to remember which is which." },
                { role: "ai" as const, content: "Easy: Mitosis = \"My-tosis\" — makes Me (identical copies). Meiosis = \"May-osis\" — MAYbe different (genetic variation). Or: Mitosis has one 'i', gives two identical cells. Meiosis has two 'i's, gives four different cells." },
              ].map((msg, i) => (
                <MessageBubble key={i} role={msg.role} content={msg.content} index={i} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative" data-testid="section-cta">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-600/5 to-transparent" />
        </div>
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight"
          >
            Start learning{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              smarter
            </span>{" "}
            today
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-muted-foreground text-xl mb-12 max-w-xl mx-auto"
          >
            Join thousands of students who've transformed their study habits with StudyMind.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onClick={() => setLocation("/dashboard")}
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(99, 102, 241, 0.6)" }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-lg font-bold shadow-2xl shadow-indigo-500/40 transition-all"
            data-testid="button-cta-start"
          >
            Start for Free
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">2024 StudyMind. All rights reserved.</div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <button className="hover:text-foreground transition-colors">Privacy</button>
            <button className="hover:text-foreground transition-colors">Terms</button>
            <button className="hover:text-foreground transition-colors">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
