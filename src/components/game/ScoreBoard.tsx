import { Trophy, Bot, Swords } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ScoreBoardProps {
  userPoints: number;
  aiPoints: number;
  username: string;
}

export function ScoreBoard({ userPoints, aiPoints, username }: ScoreBoardProps) {
  const userWinning = userPoints > aiPoints;
  const tied = userPoints === aiPoints;

  return (
    <Card className="p-6 bg-gradient-to-br from-card via-card to-card/50 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Swords className="w-5 h-5 text-accent" />
          <h2 className="font-display font-bold text-lg text-foreground">Battle Score</h2>
        </div>

        {/* Scores */}
        <div className="flex items-center justify-between gap-4">
          {/* User Score */}
          <div className={`flex-1 text-center p-4 rounded-xl transition-all duration-500 ${userWinning ? "bg-success/20 shadow-lg shadow-success/20" : "bg-muted/50"}`}>
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30">
              <Trophy className={`w-8 h-8 ${userWinning ? "text-primary-foreground animate-bounce" : "text-primary-foreground"}`} />
            </div>
            <p className="text-sm text-muted-foreground mb-1">{username}</p>
            <p className={`text-4xl font-display font-bold ${userWinning ? "text-success" : "text-foreground"}`}>
              {userPoints}
            </p>
            {userWinning && <p className="text-xs text-success mt-1">Leading!</p>}
          </div>

          {/* VS */}
          <div className="flex flex-col items-center px-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tied ? "bg-accent/20" : userWinning ? "bg-success/20" : "bg-destructive/20"}`}>
              <span className="font-display font-bold text-lg text-muted-foreground">VS</span>
            </div>
            {tied && <p className="text-xs text-accent mt-2">Tied!</p>}
          </div>

          {/* AI Score */}
          <div className={`flex-1 text-center p-4 rounded-xl transition-all duration-500 ${!userWinning && !tied ? "bg-destructive/20 shadow-lg shadow-destructive/20" : "bg-muted/50"}`}>
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center shadow-lg shadow-secondary/30">
              <Bot className={`w-8 h-8 ${!userWinning && !tied ? "text-secondary-foreground animate-pulse" : "text-secondary-foreground"}`} />
            </div>
            <p className="text-sm text-muted-foreground mb-1">AI Rival</p>
            <p className={`text-4xl font-display font-bold ${!userWinning && !tied ? "text-destructive" : "text-foreground"}`}>
              {aiPoints}
            </p>
            {!userWinning && !tied && <p className="text-xs text-destructive mt-1">Ahead!</p>}
          </div>
        </div>

        {/* Point Rules */}
        <div className="mt-6 p-4 rounded-lg bg-muted/30 text-xs text-muted-foreground">
          <p className="font-medium mb-2 text-foreground">Point System:</p>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-success">+20 pts</span><span>Complete early</span>
            <span className="text-success">+10 pts</span><span>Complete on time</span>
            <span className="text-accent">+5 pts</span><span>Daily task done</span>
            <span className="text-destructive">AI +15</span><span>Missed goal</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
