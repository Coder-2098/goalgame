-- Add avatar_type column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_type text DEFAULT 'boy';
