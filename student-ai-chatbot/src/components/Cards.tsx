import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

// ─── AnalyticsCard (used in AdminDashboard) ─────────────────
interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function AnalyticsCard({ title, value, icon, trend, trendUp }: AnalyticsCardProps) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <span className={trendUp ? "text-green-500" : "text-red-500"}>{trend}</span>
            <span className="text-muted-foreground ml-2">vs last week</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

// ─── FeatureCard (used in LandingPage) ─────────────────────
interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  delay?: number;
}

export function FeatureCard({ title, description, icon, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(100,100,255,0.15)" }}
      className="flex flex-col p-6 rounded-2xl bg-card border border-border backdrop-blur-xl bg-opacity-50"
      data-testid={`feature-card-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}
