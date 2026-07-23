-- Run this in your Supabase SQL Editor to add the emp_id column
-- Go to: https://supabase.com/dashboard → your project → SQL Editor → New query

-- Add emp_id column (if it doesn't already exist)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS emp_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS must_change_password boolean DEFAULT true;

-- Create index for fast emp_id lookups
CREATE INDEX IF NOT EXISTS profiles_emp_id_idx ON public.profiles (emp_id);
