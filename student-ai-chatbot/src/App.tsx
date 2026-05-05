import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { LandingPage } from "@/pages/LandingPage";
import { StudentDashboard } from "@/pages/StudentDashboard";
import { AdminDashboard } from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function ThemeInit() {
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(saved);
  }, []);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/dashboard" component={StudentDashboard} />
      <Route path="/dashboard/:rest*" component={StudentDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/:rest*" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeInit />
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
