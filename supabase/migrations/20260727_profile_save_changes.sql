-- Migration: Add user_preferences table, extend profiles, and fix RLS policies
-- Run this in your Supabase SQL editor if your database is already set up

-- 1. Add zone and updated_at columns to profiles (safe: does nothing if they exist)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS zone text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. Create user_preferences table for notification toggle settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id text PRIMARY KEY,
  email_alerts boolean NOT NULL DEFAULT true,
  sms_notifs boolean NOT NULL DEFAULT false,
  hazard_alerts boolean NOT NULL DEFAULT true,
  repair_completion boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Enable Row Level Security on user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for user_preferences (skip if already exist)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_preferences' AND policyname = 'users read own preferences'
  ) THEN
    CREATE POLICY "users read own preferences"
      ON public.user_preferences FOR SELECT
      USING (user_id = auth.uid()::text);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_preferences' AND policyname = 'users upsert own preferences'
  ) THEN
    CREATE POLICY "users upsert own preferences"
      ON public.user_preferences FOR ALL
      USING (user_id = auth.uid()::text);
  END IF;
END $$;

-- 5. Add UPDATE and INSERT RLS policies for profiles so citizens can save their own profile
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'citizens update own profile'
  ) THEN
    CREATE POLICY "citizens update own profile"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'citizens insert own profile'
  ) THEN
    CREATE POLICY "citizens insert own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;
