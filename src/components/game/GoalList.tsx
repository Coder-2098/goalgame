import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Trash2, Clock, Calendar, Target, CheckCircle2, Pencil } from "lucide-react";
import { format } from "date-fns";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  goal_type: "daily" | "long_term";
  due_date: string | null;
  due_time: string | null;
  completed: boolean;
  completed_at: string | null;
  points_earned: number;
  ai_points_earned: number;
  created_at: string;
}

interface GoalListProps {
  title: string;
  goals: Goal[];
  onComplete?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
  onEdit?: (goal: Goal) => void;
  emptyMessage?: string;
  showCompleted?: boolean;
}

export function GoalList({ title, goals, onComplete, onDelete, onEdit, emptyMessage, showCompleted }: GoalListProps) {
  if (goals.length === 0 && !showCompleted) {
    return (
      <Card className="bg-card/50">
        <CardContent className="p-8 text-center">
          <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">{emptyMessage || "No goals yet"}</p>
        </CardContent>
      </Card>
    );
  }

  if (goals.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-display font-semibold text-lg flex items-center gap-2">
        {showCompleted ? <CheckCircle2 className="w-5 h-5 text-success" /> : <Target className="w-5 h-5 text-primary" />}
        {title}
        <span className="text-sm font-normal text-muted-foreground">({goals.length})</span>
      </h3>

      <div className="space-y-3">
        {goals.map((goal, index) => (
          <Card
            key={goal.id}
            className={`transition-all duration-300 animate-fade-in ${
              goal.completed 
                ? "bg-muted/30 border-muted" 
                : "bg-card hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30"
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Complete Button or Checkmark */}
                <div className="flex-shrink-0">
                  {goal.completed ? (
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-success" />
                    </div>
                  ) : onComplete ? (
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-10 h-10 rounded-full border-2 border-primary/50 hover:border-primary hover:bg-primary/10 transition-all"
                      onClick={() => onComplete(goal)}
                    >
                      <Check className="w-5 h-5" />
                    </Button>
                  ) : null}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className={`font-medium ${goal.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {goal.title}
                      </h4>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>
                      )}
                    </div>

                    {/* Type Badge */}
                    <span className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
                      goal.goal_type === "daily" 
                        ? "bg-accent/20 text-accent" 
                        : "bg-secondary/20 text-secondary"
                    }`}>
                      {goal.goal_type === "daily" ? "Daily" : "Long-term"}
                    </span>
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    {goal.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(goal.due_date), "MMM d, yyyy")}
                      </span>
                    )}
                    {goal.due_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {goal.due_time}
                      </span>
                    )}
                    {goal.completed && goal.points_earned > 0 && (
                      <span className="text-success font-medium">+{goal.points_earned} pts</span>
                    )}
                    {goal.completed && goal.ai_points_earned > 0 && (
                      <span className="text-destructive font-medium">AI +{goal.ai_points_earned}</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {!goal.completed && (
                  <div className="flex items-center gap-1">
                    {/* Edit Button */}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 text-muted-foreground hover:text-primary"
                        onClick={() => onEdit(goal)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    {/* Delete Button */}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => onDelete(goal.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
