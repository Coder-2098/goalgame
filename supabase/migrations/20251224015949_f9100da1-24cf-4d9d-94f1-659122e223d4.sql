-- Add streak tracking columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS current_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_goal_date date,
ADD COLUMN IF NOT EXISTS sound_enabled boolean DEFAULT true;

-- Create function to update streak when goal is completed
CREATE OR REPLACE FUNCTION public.update_streak_on_goal_complete()
RETURNS TRIGGER AS $$
DECLARE
  profile_record RECORD;
  today_date DATE;
  yesterday_date DATE;
BEGIN
  -- Only process when goal is marked as completed
  IF NEW.completed = true AND (OLD.completed = false OR OLD.completed IS NULL) THEN
    today_date := CURRENT_DATE;
    yesterday_date := today_date - INTERVAL '1 day';
    
    -- Get current profile
    SELECT * INTO profile_record FROM public.profiles WHERE user_id = NEW.user_id;
    
    IF FOUND THEN
      -- Check streak logic
      IF profile_record.last_goal_date = yesterday_date THEN
        -- Consecutive day - increment streak
        UPDATE public.profiles
        SET 
          current_streak = COALESCE(current_streak, 0) + 1,
          longest_streak = GREATEST(COALESCE(longest_streak, 0), COALESCE(current_streak, 0) + 1),
          last_goal_date = today_date,
          updated_at = now()
        WHERE user_id = NEW.user_id;
      ELSIF profile_record.last_goal_date = today_date THEN
        -- Same day - no change to streak count
        NULL;
      ELSE
        -- Streak broken or first goal - reset to 1
        UPDATE public.profiles
        SET 
          current_streak = 1,
          longest_streak = GREATEST(COALESCE(longest_streak, 0), 1),
          last_goal_date = today_date,
          updated_at = now()
        WHERE user_id = NEW.user_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for streak updates
DROP TRIGGER IF EXISTS update_streak_trigger ON public.goals;
CREATE TRIGGER update_streak_trigger
  AFTER UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_streak_on_goal_complete();