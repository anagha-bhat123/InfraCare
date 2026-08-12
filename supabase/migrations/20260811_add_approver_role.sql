-- Migration: Add 'approver' to public.user_role enum
alter type public.user_role add value if not exists 'approver';
