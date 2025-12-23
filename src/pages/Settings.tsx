import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Bell, Clock, Save, Palette, UserCircle } from "lucide-react";
import { AvatarSelector } from "@/components/game/AvatarSelector";
import { ThemeSelector } from "@/components/game/ThemeSelector";
import type { ThemeType, AvatarType } from "@/components/game/GameArena";

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  avatar_type: AvatarType | null;
  background_theme: ThemeType | null;
  notification_time: string | null;
  day_end_time: string | null;
}

export default function Settings() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarType, setAvatarType] = useState<AvatarType>("boy");
  const [backgroundTheme, setBackgroundTheme] = useState<ThemeType>("forest");
  const [notificationTime, setNotificationTime] = useState("19:00");
  const [dayEndTime, setDayEndTime] = useState("23:59");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      setLoading(false);
      return;
    }

    if (data) {
      setProfile(data as Profile);
      setUsername(data.username || "");
      setAvatarType((data.avatar_type as AvatarType) || "boy");
      setBackgroundTheme((data.background_theme as ThemeType) || "forest");
      setNotificationTime(data.notification_time?.slice(0, 5) || "19:00");
      setDayEndTime(data.day_end_time?.slice(0, 5) || "23:59");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        username: username.trim() || null,
        avatar_type: avatarType,
        background_theme: backgroundTheme,
        notification_time: notificationTime + ":00",
        day_end_time: dayEndTime + ":00",
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
      setSaving(false);
      return;
    }

    toast({ title: "Settings Saved", description: "Your preferences have been updated" });
    setSaving(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display font-bold text-lg">Settings</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-lg">
        {/* Profile Settings */}
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile
            </CardTitle>
            <CardDescription>Update your player information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Your player name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="opacity-60"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
          </CardContent>
        </Card>

        {/* Avatar Selection */}
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-secondary" />
              Avatar
            </CardTitle>
            <CardDescription>Choose your game character</CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarSelector selected={avatarType} onChange={setAvatarType} />
          </CardContent>
        </Card>

        {/* Theme Selection */}
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Game Theme
            </CardTitle>
            <CardDescription>Choose your arena background</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeSelector selected={backgroundTheme} onChange={setBackgroundTheme} />
          </CardContent>
        </Card>

        {/* Time Settings */}
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-secondary" />
              Time Preferences
            </CardTitle>
            <CardDescription>Customize when your day ends and when to receive reminders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notificationTime" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Daily Reminder Time
              </Label>
              <Input
                id="notificationTime"
                type="time"
                value={notificationTime}
                onChange={(e) => setNotificationTime(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">When to remind you about pending goals</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dayEndTime">Day End Time</Label>
              <Input
                id="dayEndTime"
                type="time"
                value={dayEndTime}
                onChange={(e) => setDayEndTime(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">When daily tasks are marked as missed</p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button variant="game" size="lg" className="w-full" onClick={handleSave} disabled={saving}>
          <Save className="w-5 h-5" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </main>
    </div>
  );
}
