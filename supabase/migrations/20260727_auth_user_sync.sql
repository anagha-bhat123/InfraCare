-- Migration: Sync Supabase Auth users → public.users + public.profiles
-- ─────────────────────────────────────────────────────────────────────
-- PROBLEM: Citizens register via supabase.auth.signUp() which adds them
-- to auth.users (Supabase-managed). But public.profiles has a FK that
-- references public.users (our custom table), so citizen profile upserts
-- silently fail because there's no matching row in public.users.
--
-- SOLUTION:
--   1. Trigger that auto-creates public.users + public.profiles rows
--      whenever auth.users gets a new signup (for future registrations).
--   2. Backfill for existing Supabase Auth users (e.g. Aneesh).
--
-- Run this in Supabase Dashboard → SQL Editor.
-- ─────────────────────────────────────────────────────────────────────

-- ── Step 1: Trigger function ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.user_role := 'citizen';
  v_full_name text;
  v_phone text;
  v_ward_zone text;
BEGIN
  -- Safely parse role from metadata
  BEGIN
    IF NEW.raw_user_meta_data->>'role' IN ('citizen', 'engineer', 'admin') THEN
      v_role := (NEW.raw_user_meta_data->>'role')::public.user_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_role := 'citizen';
  END;

  v_full_name  := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), '');
  v_phone      := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'phone', '')), '');
  v_ward_zone  := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'ward_zone', '')), '');

  -- Create public.users entry (sentinel password for Supabase Auth users)
  INSERT INTO public.users (id, email, password_hash, role)
  VALUES (NEW.id, NEW.email, 'supabase_auth', v_role)
  ON CONFLICT (id) DO NOTHING;

  -- Create public.profiles entry
  INSERT INTO public.profiles (id, full_name, role, phone, ward_zone)
  VALUES (
    NEW.id,
    COALESCE(v_full_name, SPLIT_PART(NEW.email, '@', 1)),
    v_role,
    v_phone,
    v_ward_zone
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- ── Step 2: Attach trigger to auth.users ─────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user();

-- ── Step 3: Backfill existing Supabase Auth users into public.users ──
INSERT INTO public.users (id, email, password_hash, role)
SELECT
  au.id,
  au.email,
  'supabase_auth',
  CASE
    WHEN au.raw_user_meta_data->>'role' IN ('citizen', 'engineer', 'admin')
    THEN (au.raw_user_meta_data->>'role')::public.user_role
    ELSE 'citizen'::public.user_role
  END
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = au.id);

-- ── Step 4: Backfill existing profiles for those Supabase Auth users ─
INSERT INTO public.profiles (id, full_name, role, phone, ward_zone)
SELECT
  au.id,
  COALESCE(
    NULLIF(TRIM(au.raw_user_meta_data->>'full_name'), ''),
    SPLIT_PART(au.email, '@', 1)
  ),
  CASE
    WHEN au.raw_user_meta_data->>'role' IN ('citizen', 'engineer', 'admin')
    THEN (au.raw_user_meta_data->>'role')::public.user_role
    ELSE 'citizen'::public.user_role
  END,
  NULLIF(TRIM(au.raw_user_meta_data->>'phone'), ''),
  NULLIF(TRIM(au.raw_user_meta_data->>'ward_zone'), '')
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id);
