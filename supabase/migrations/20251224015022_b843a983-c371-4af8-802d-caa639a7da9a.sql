-- Function to check and process missed goals at EOD
-- This runs when a goal is checked and awards AI points for overdue incomplete goals
CREATE OR REPLACE FUNCTION public.process_missed_goal()
RETURNS TRIGGER AS $$
DECLARE
  user_day_end_time TIME;
  goal_deadline TIMESTAMP WITH TIME ZONE;
  current_time_local TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Only process if goal is not completed
  IF NEW.completed = true THEN
    RETURN NEW;
  END IF;

  -- Get user's day end time from profile
  SELECT COALESCE(day_end_time, '23:59:00'::TIME) INTO user_day_end_time
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  -- Calculate the deadline based on goal type
  IF NEW.goal_type = 'daily' THEN
    -- For daily goals, deadline is the day_end_time on creation date
    goal_deadline := (DATE(NEW.created_at AT TIME ZONE 'UTC') + user_day_end_time)::TIMESTAMP WITH TIME ZONE;
  ELSIF NEW.due_date IS NOT NULL THEN
    -- For goals with due date
    IF NEW.due_time IS NOT NULL THEN
      goal_deadline := (NEW.due_date + NEW.due_time)::TIMESTAMP WITH TIME ZONE;
    ELSE
      goal_deadline := (NEW.due_date + user_day_end_time)::TIMESTAMP WITH TIME ZONE;
    END IF;
  ELSE
    -- No deadline set
    RETURN NEW;
  END IF;

  -- Check if deadline has passed
  IF NOW() > goal_deadline AND NEW.completed = false THEN
    -- Mark as completed (missed) and award AI points
    NEW.completed := true;
    NEW.completed_at := NOW();
    NEW.ai_points_earned := 15;
    NEW.points_earned := 0;

    -- Update AI points in profile
    UPDATE public.profiles
    SET ai_points = COALESCE(ai_points, 0) + 15
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger that runs on every update to check for missed goals
DROP TRIGGER IF EXISTS check_missed_goal_trigger ON public.goals;
CREATE TRIGGER check_missed_goal_trigger
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.process_missed_goal();

-- Function to be called periodically to check all overdue goals
CREATE OR REPLACE FUNCTION public.check_all_overdue_goals()
RETURNS void AS $$
DECLARE
  goal_record RECORD;
  user_day_end_time TIME;
  goal_deadline TIMESTAMP WITH TIME ZONE;
BEGIN
  FOR goal_record IN 
    SELECT g.*, p.day_end_time as profile_day_end_time
    FROM public.goals g
    JOIN public.profiles p ON g.user_id = p.user_id
    WHERE g.completed = false
  LOOP
    user_day_end_time := COALESCE(goal_record.profile_day_end_time, '23:59:00'::TIME);
    
    -- Calculate deadline
    IF goal_record.goal_type = 'daily' THEN
      goal_deadline := (DATE(goal_record.created_at AT TIME ZONE 'UTC') + user_day_end_time)::TIMESTAMP WITH TIME ZONE;
    ELSIF goal_record.due_date IS NOT NULL THEN
      IF goal_record.due_time IS NOT NULL THEN
        goal_deadline := (goal_record.due_date + goal_record.due_time)::TIMESTAMP WITH TIME ZONE;
      ELSE
        goal_deadline := (goal_record.due_date + user_day_end_time)::TIMESTAMP WITH TIME ZONE;
      END IF;
    ELSE
      CONTINUE;
    END IF;

    -- If deadline passed, mark as missed
    IF NOW() > goal_deadline THEN
      UPDATE public.goals
      SET completed = true,
          completed_at = NOW(),
          ai_points_earned = 15,
          points_earned = 0
      WHERE id = goal_record.id;

      UPDATE public.profiles
      SET ai_points = COALESCE(ai_points, 0) + 15
      WHERE user_id = goal_record.user_id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable realtime for goals and profiles
ALTER PUBLICATION supabase_realtime ADD TABLE public.goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;