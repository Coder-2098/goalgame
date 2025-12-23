import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { GoalList } from "@/components/game/GoalList";
import { CreateGoalDialog } from "@/components/game/CreateGoalDialog";
import { VictoryAnimation } from "@/components/game/VictoryAnimation";
import { GameArena } from "@/components/game/GameArena";
import { ThemeType, AvatarType, DEFAULT_THEME, DEFAULT_AVATAR } from "@/config/game";
import { LogOut, Plus, Settings } from "lucide-react";

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

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  avatar_type: AvatarType | null;
  background_theme: ThemeType | null;
  total_points: number;
  ai_points: number;
  day_end_time: string | null;
}

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showVictory, setShowVictory] = useState<{ show: boolean; points: number; message: string }>({ show: false, points: 0, message: "" });
  const [isEndOfDay, setIsEndOfDay] = useState(false);

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching goals:", error);
      return;
    }

    setGoals(data as Goal[]);
  }, [user]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    setProfile(data as Profile);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      Promise.all([fetchGoals(), fetchProfile()]).finally(() => setLoading(false));
    }
  }, [user, authLoading, navigate, fetchGoals, fetchProfile]);

  const handleCompleteGoal = async (goal: Goal) => {
    if (!user || !profile) return;

    const now = new Date();
    let userPoints = 0;
    let aiPoints = 0;
    let message = "";

    if (goal.goal_type === "daily") {
      // Check if daily goal has a due time
      if (goal.due_time) {
        const today = new Date().toISOString().split("T")[0];
        const dueDateTime = new Date(`${today}T${goal.due_time}`);
        if (now < dueDateTime) {
          // Completed before time
          userPoints = 20;
          aiPoints = -5;
          message = "Early completion! +20 points (AI loses 5)";
        } else {
          // Completed after time but same day
          userPoints = 5;
          aiPoints = 5;
          message = "Task completed! +5 points (AI also gets +5)";
        }
      } else {
        // Daily task completed same day (no specific time)
        userPoints = 5;
        aiPoints = 5;
        message = "Task completed! +5 points (AI also gets +5)";
      }
    } else if (goal.due_date && goal.due_time) {
      const dueDateTime = new Date(`${goal.due_date}T${goal.due_time}`);
      if (now < dueDateTime) {
        // Completed before time
        userPoints = 20;
        aiPoints = -5;
        message = "Early completion! +20 points (AI loses 5)";
      } else {
        // Completed on time
        userPoints = 10;
        aiPoints = 0;
        message = "On-time completion! +10 points";
      }
    } else if (goal.due_date) {
      const dueDate = new Date(goal.due_date);
      dueDate.setHours(23, 59, 59);
      if (now <= dueDate) {
        // Completed on/before due date
        userPoints = 10;
        aiPoints = 0;
        message = "Goal achieved! +10 points";
      } else {
        // Late completion (still counts, but less points)
        userPoints = 5;
        aiPoints = 5;
        message = "Late completion! +5 points (AI gets +5)";
      }
    } else {
      userPoints = 10;
      message = "Goal completed! +10 points";
    }

    // Update the goal
    const { error: goalError } = await supabase
      .from("goals")
      .update({
        completed: true,
        completed_at: now.toISOString(),
        points_earned: userPoints,
        ai_points_earned: aiPoints,
      })
      .eq("id", goal.id);

    if (goalError) {
      toast({ title: "Error", description: "Failed to complete goal", variant: "destructive" });
      return;
    }

    // Update profile points
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        total_points: (profile.total_points || 0) + userPoints,
        ai_points: (profile.ai_points || 0) + aiPoints,
      })
      .eq("user_id", user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
    }

    setShowVictory({ show: true, points: userPoints, message });
    setTimeout(() => setShowVictory({ show: false, points: 0, message: "" }), 2000);

    await Promise.all([fetchGoals(), fetchProfile()]);
  };

  const handleDeleteGoal = async (goalId: string) => {
    const { error } = await supabase.from("goals").delete().eq("id", goalId);

    if (error) {
      toast({ title: "Error", description: "Failed to delete goal", variant: "destructive" });
      return;
    }

    toast({ title: "Goal deleted", description: "The goal has been removed" });
    fetchGoals();
  };

  const handleMissedGoals = useCallback(async () => {
    if (!user || !profile) return;

    const now = new Date();
    const missedGoals = goals.filter((goal) => {
      if (goal.completed) return false;
      if (goal.goal_type === "daily") {
        // Check if it's past the day
        const createdDate = new Date(goal.created_at);
        createdDate.setHours(23, 59, 59);
        return now > createdDate;
      }
      if (goal.due_date) {
        const dueDate = new Date(goal.due_date);
        if (goal.due_time) {
          const [hours, minutes] = goal.due_time.split(":");
          dueDate.setHours(parseInt(hours), parseInt(minutes));
        } else {
          dueDate.setHours(23, 59, 59);
        }
        return now > dueDate;
      }
      return false;
    });

    if (missedGoals.length === 0) return;

    const totalAiPoints = missedGoals.length * 15;

    // Mark goals as missed (completed with 0 user points)
    for (const goal of missedGoals) {
      await supabase
        .from("goals")
        .update({
          completed: true,
          ai_points_earned: 15,
        })
        .eq("id", goal.id);
    }

    // Update AI points
    await supabase
      .from("profiles")
      .update({
        ai_points: (profile.ai_points || 0) + totalAiPoints,
      })
      .eq("user_id", user.id);

    toast({
      title: "Missed Goals!",
      description: `AI gained ${totalAiPoints} points from ${missedGoals.length} missed goal(s)`,
      variant: "destructive",
    });

    await Promise.all([fetchGoals(), fetchProfile()]);
  }, [goals, user, profile, toast, fetchGoals, fetchProfile]);

  useEffect(() => {
    // Check for missed goals periodically
    const interval = setInterval(handleMissedGoals, 60000); // Every minute
    handleMissedGoals(); // Initial check
    return () => clearInterval(interval);
  }, [handleMissedGoals]);

  // Check for end of day
  useEffect(() => {
    if (!profile) return;

    const checkEndOfDay = () => {
      const now = new Date();
      const dayEndTime = profile.day_end_time || "23:00";
      const [hours, minutes] = dayEndTime.split(":").map(Number);
      
      const endOfDay = new Date();
      endOfDay.setHours(hours, minutes, 0, 0);
      
      // Check if we're within 30 minutes of end of day
      const timeDiff = endOfDay.getTime() - now.getTime();
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (timeDiff > 0 && timeDiff <= thirtyMinutes) {
        setIsEndOfDay(true);
      } else if (timeDiff <= 0 && timeDiff > -60000) {
        // Just passed end of day, trigger final state
        setIsEndOfDay(true);
        // Reset after showing victory/defeat for 10 seconds
        setTimeout(() => setIsEndOfDay(false), 10000);
      } else {
        setIsEndOfDay(false);
      }
    };

    checkEndOfDay();
    const interval = setInterval(checkEndOfDay, 60000);
    return () => clearInterval(interval);
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your arena...</p>
        </div>
      </div>
    );
  }

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);
  const theme = (profile?.background_theme as ThemeType) || DEFAULT_THEME;
  const avatarType = (profile?.avatar_type as AvatarType) || DEFAULT_AVATAR;

  return (
    <div className="min-h-screen bg-background">
      {/* Victory Animation */}
      {showVictory.show && <VictoryAnimation points={showVictory.points} message={showVictory.message} />}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-xl">🎮</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">GoalGame</h1>
              <p className="text-xs text-muted-foreground">Welcome, {profile?.username || "Player"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Game Arena - replaces ScoreBoard */}
        <GameArena 
          theme={theme}
          avatarType={avatarType}
          userPoints={profile?.total_points || 0} 
          aiPoints={profile?.ai_points || 0} 
          isActive={activeGoals.length > 0}
          isEndOfDay={isEndOfDay}
        />

        {/* Create Goal Button */}
        <Button
          variant="game"
          size="lg"
          className="w-full"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="w-5 h-5" />
          Create New Goal
        </Button>

        {/* Active Goals */}
        <GoalList
          title="Active Goals"
          goals={activeGoals}
          onComplete={handleCompleteGoal}
          onDelete={handleDeleteGoal}
          emptyMessage="No active goals. Create one to start competing!"
        />

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <GoalList
            title="Completed"
            goals={completedGoals}
            showCompleted
          />
        )}
      </main>

      {/* Create Goal Dialog */}
      <CreateGoalDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onGoalCreated={fetchGoals}
      />
    </div>
  );
}
