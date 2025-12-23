import { Trophy, Sparkles } from "lucide-react";

interface VictoryAnimationProps {
  points: number;
  message: string;
}

export function VictoryAnimation({ points, message }: VictoryAnimationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" />

      {/* Victory content */}
      <div className="relative z-10 text-center animate-victory">
        {/* Sparkles */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
          <Sparkles className="w-8 h-8 text-accent animate-bounce" />
        </div>

        {/* Trophy */}
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-success to-success/60 flex items-center justify-center shadow-2xl shadow-success/50">
          <Trophy className="w-12 h-12 text-success-foreground" />
        </div>

        {/* Points */}
        <div className="relative">
          <p className="text-6xl font-display font-bold text-success animate-score-pop">
            +{points}
          </p>
          <p className="text-lg text-foreground mt-2">{message}</p>
        </div>

        {/* Side sparkles */}
        <Sparkles className="absolute -left-12 top-1/2 w-6 h-6 text-accent animate-pulse" />
        <Sparkles className="absolute -right-12 top-1/2 w-6 h-6 text-accent animate-pulse" style={{ animationDelay: "0.3s" }} />
      </div>
    </div>
  );
}
