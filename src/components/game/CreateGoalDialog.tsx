import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, Target, ListTodo } from "lucide-react";

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalCreated: () => void;
}

export function CreateGoalDialog({ open, onOpenChange, onGoalCreated }: CreateGoalDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [goalType, setGoalType] = useState<"daily" | "long_term">("daily");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim()) {
      toast({ title: "Error", description: "Please enter a goal title", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("goals").insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      goal_type: goalType,
      due_date: goalType === "long_term" && dueDate ? dueDate : null,
      due_time: dueTime || null, // Now saved for both daily and long-term goals
    });

    if (error) {
      toast({ title: "Error", description: "Failed to create goal", variant: "destructive" });
      setLoading(false);
      return;
    }

    toast({
      title: "Goal Created!",
      description: goalType === "daily" ? "Complete it today to earn points!" : "Beat the deadline to maximize points!",
    });

    // Reset form
    setTitle("");
    setDescription("");
    setDueDate("");
    setDueTime("");
    setGoalType("daily");
    setLoading(false);
    onOpenChange(false);
    onGoalCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Create New Goal</DialogTitle>
          <DialogDescription>Set a goal and compete against the AI to complete it!</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Goal Type Selection */}
          <div className="space-y-3">
            <Label>Goal Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGoalType("daily")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  goalType === "daily"
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <ListTodo className={`w-6 h-6 mx-auto mb-2 ${goalType === "daily" ? "text-primary" : "text-muted-foreground"}`} />
                <p className={`font-medium text-sm ${goalType === "daily" ? "text-primary" : "text-foreground"}`}>Daily Task</p>
                <p className="text-xs text-muted-foreground mt-1">Complete today</p>
              </button>
              <button
                type="button"
                onClick={() => setGoalType("long_term")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  goalType === "long_term"
                    ? "border-secondary bg-secondary/10 shadow-lg shadow-secondary/20"
                    : "border-border hover:border-secondary/50"
                }`}
              >
                <Target className={`w-6 h-6 mx-auto mb-2 ${goalType === "long_term" ? "text-secondary" : "text-muted-foreground"}`} />
                <p className={`font-medium text-sm ${goalType === "long_term" ? "text-secondary" : "text-foreground"}`}>Long-term</p>
                <p className="text-xs text-muted-foreground mt-1">Set a deadline</p>
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              placeholder="What do you want to achieve?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Due Time for Daily Goals */}
          {goalType === "daily" && (
            <div className="space-y-2">
              <Label htmlFor="dailyDueTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Complete By (Optional)
              </Label>
              <Input
                id="dailyDueTime"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Set a specific time to complete this task today</p>
            </div>
          )}

          {/* Due Date & Time (Long-term only) */}
          {goalType === "long_term" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueTime" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Due Time
                </Label>
                <Input
                  id="dueTime"
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="game" className="flex-1" disabled={loading}>
              {loading ? "Creating..." : "Create Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
