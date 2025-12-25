import { useState, useEffect } from "react";
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
import { Calendar, Clock } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  goal_type: "daily" | "long_term";
  due_date: string | null;
  due_time: string | null;
  completed: boolean;
}

interface EditGoalDialogProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalUpdated: () => void;
}

export function EditGoalDialog({ goal, open, onOpenChange, onGoalUpdated }: EditGoalDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");

  // Populate form when goal changes
  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description || "");
      setDueDate(goal.due_date || "");
      setDueTime(goal.due_time || "");
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;

    if (!title.trim()) {
      toast({ title: "Error", description: "Please enter a goal title", variant: "destructive" });
      return;
    }

    setLoading(true);

    const updateData: {
      title: string;
      description: string | null;
      due_date: string | null;
      due_time: string | null;
      updated_at: string;
    } = {
      title: title.trim(),
      description: description.trim() || null,
      due_date: goal.goal_type === "long_term" && dueDate ? dueDate : null,
      due_time: dueTime || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("goals")
      .update(updateData)
      .eq("id", goal.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update goal", variant: "destructive" });
      setLoading(false);
      return;
    }

    toast({
      title: "Goal Updated!",
      description: "Your changes have been saved.",
    });

    setLoading(false);
    onOpenChange(false);
    onGoalUpdated();
  };

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Edit Goal</DialogTitle>
          <DialogDescription>Update your goal details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Goal Type Display */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              goal.goal_type === "daily" 
                ? "bg-accent/20 text-accent" 
                : "bg-secondary/20 text-secondary"
            }`}>
              {goal.goal_type === "daily" ? "Daily Task" : "Long-term Goal"}
            </span>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Goal Title</Label>
            <Input
              id="edit-title"
              placeholder="What do you want to achieve?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (Optional)</Label>
            <Textarea
              id="edit-description"
              placeholder="Add more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Due Time for Daily Goals */}
          {goal.goal_type === "daily" && (
            <div className="space-y-2">
              <Label htmlFor="edit-dailyDueTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Complete By (Optional)
              </Label>
              <Input
                id="edit-dailyDueTime"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Set a specific time to complete this task today</p>
            </div>
          )}

          {/* Due Date & Time (Long-term only) */}
          {goal.goal_type === "long_term" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-dueDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dueTime" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Due Time
                </Label>
                <Input
                  id="edit-dueTime"
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
