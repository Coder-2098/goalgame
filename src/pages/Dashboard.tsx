import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { GoalList } from "@/components/game/GoalList";
import { CreateGoalDialog } from "@/components/game/CreateGoalDialog";
import { EditGoalDialog } from "@/components/game/EditGoalDialog";
import { VictoryAnimation } from "@/components/game/VictoryAnimation";
import { GameArena } from "@/components/game/GameArena";
import { StreakBadge } from "@/components/game/StreakBadge";
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
  current_streak: number | null;
  longest_streak: number | null;
  sound_enabled: boolean | null;
}

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
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

  // Real-time subscription for goals and profiles
  useEffect(() => {
    if (!user) return;

    const goalsChannel = supabase
      .channel('goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchGoals();
        }
      )
      .subscribe();

    const profileChannel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(goalsChannel);
      supabase.removeChannel(profileChannel);
    };
  }, [user, fetchGoals, fetchProfile]);

  const handleCompleteGoal = async (goal: Goal) => {
    if (!user || !profile) return;

    const now = new Date();
    let userPoints = 0;
    let aiPoints = 0;
    let message = "";

    if (goal.goal_type === "daily") {
      if (goal.due_time) {
        const today = new Date().toISOString().split("T")[0];
        const dueDateTime = new Date(`${today}T${goal.due_time}`);
        if (now < dueDateTime) {
          userPoints = 20;
          aiPoints = -5;
          message = "Early completion! +20 points (AI loses 5)";
        } else {
          userPoints = 5;
          aiPoints = 5;
          message = "Task completed! +5 points (AI also gets +5)";
        }
      } else {
        userPoints = 5;
        aiPoints = 5;
        message = "Task completed! +5 points (AI also gets +5)";
      }
    } else if (goal.due_date && goal.due_time) {
      const dueDateTime = new Date(`${goal.due_date}T${goal.due_time}`);
      if (now < dueDateTime) {
        userPoints = 20;
        aiPoints = -5;
        message = "Early completion! +20 points (AI loses 5)";
      } else {
        userPoints = 10;
        aiPoints = 0;
        message = "On-time completion! +10 points";
      }
    } else if (goal.due_date) {
      const dueDate = new Date(goal.due_date);
      dueDate.setHours(23, 59, 59);
      if (now <= dueDate) {
        userPoints = 10;
        aiPoints = 0;
        message = "Goal achieved! +10 points";
      } else {
        userPoints = 5;
        aiPoints = 5;
        message = "Late completion! +5 points (AI gets +5)";
      }
    } else {
      userPoints = 10;
      message = "Goal completed! +10 points";
    }

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

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
  };

  // Check for missed goals
  const handleMissedGoals = useCallback(async () => {
    if (!user || !profile) return;

    const now = new Date();
    const dayEndTime = profile.day_end_time || "23:59";
    const [eodHours, eodMinutes] = dayEndTime.split(":").map(Number);

    const missedGoals = goals.filter((goal) => {
      if (goal.completed) return false;

      const createdDate = new Date(goal.created_at);
      
      if (goal.goal_type === "daily") {
        const deadline = new Date(createdDate);
        deadline.setHours(eodHours, eodMinutes, 0, 0);
        return now > deadline;
      }

      if (goal.due_date) {
        const dueDate = new Date(goal.due_date);
        if (goal.due_time) {
          const [hours, minutes] = goal.due_time.split(":");
          dueDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
          dueDate.setHours(eodHours, eodMinutes, 0, 0);
        }
        return now > dueDate;
      }
      return false;
    });

    if (missedGoals.length === 0) return;

    for (const goal of missedGoals) {
      await supabase
        .from("goals")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", goal.id);
    }

    toast({
      title: "⏰ Time's Up!",
      description: `AI gained ${missedGoals.length * 15} points from ${missedGoals.length} missed goal(s)!`,
      variant: "destructive",
    });
  }, [goals, user, profile, toast]);

  useEffect(() => {
    const interval = setInterval(handleMissedGoals, 60000);
    handleMissedGoals();
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
      
      const timeDiff = endOfDay.getTime() - now.getTime();
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (timeDiff > 0 && timeDiff <= thirtyMinutes) {
        setIsEndOfDay(true);
      } else if (timeDiff <= 0 && timeDiff > -60000) {
        setIsEndOfDay(true);
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
            <StreakBadge 
              currentStreak={profile?.current_streak || 0}
              longestStreak={profile?.longest_streak || 0}
              compact
            />
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
        <GameArena 
          theme={theme}
          avatarType={avatarType}
          userPoints={profile?.total_points || 0} 
          aiPoints={profile?.ai_points || 0} 
          isActive={activeGoals.length > 0}
          isEndOfDay={isEndOfDay}
          soundEnabled={profile?.sound_enabled !== false}
        />

        <Button
          variant="game"
          size="lg"
          className="w-full"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="w-5 h-5" />
          Create New Goal
        </Button>

        <GoalList
          title="Active Goals"
          goals={activeGoals}
          onComplete={handleCompleteGoal}
          onDelete={handleDeleteGoal}
          onEdit={handleEditGoal}
          emptyMessage="No active goals. Create one to start competing!"
        />

        {completedGoals.length > 0 && (
          <GoalList
            title="Completed"
            goals={completedGoals}
            showCompleted
          />
        )}
      </main>

      <CreateGoalDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onGoalCreated={fetchGoals}
      />

      <EditGoalDialog
        goal={editingGoal}
        open={!!editingGoal}
        onOpenChange={(open) => !open && setEditingGoal(null)}
        onGoalUpdated={fetchGoals}
      />
    </div>
  );
}
