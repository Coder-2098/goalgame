import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, Zap, Target, ArrowRight } from "lucide-react";

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-lg w-full text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/60 mb-8 shadow-2xl shadow-primary/30 animate-float">
            <Gamepad2 className="w-12 h-12 text-primary-foreground" />
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
            <span className="gradient-text">GoalGame</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Turn your goals into a game. Compete against AI. Win every day.
          </p>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="p-4 rounded-xl bg-card/50 border border-border/50">
              <Trophy className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="text-sm font-medium">Earn Points</p>
            </div>
            <div className="p-4 rounded-xl bg-card/50 border border-border/50">
              <Zap className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-sm font-medium">Beat AI</p>
            </div>
            <div className="p-4 rounded-xl bg-card/50 border border-border/50">
              <Target className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-sm font-medium">Stay Focused</p>
            </div>
          </div>

          {/* CTA */}
          <Button variant="game" size="xl" onClick={() => navigate("/auth")} className="w-full max-w-xs mx-auto">
            Start Playing
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </main>
    </div>
  );
}
