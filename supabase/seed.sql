-- ============================================================
-- Seed data for DBT-PTSD Diary Card System
-- ============================================================

-- Note: Supabase Auth users must be created via the API or CLI
-- This seed file assumes users are created separately

-- Therapist profile (create auth user first via Supabase dashboard)
-- Email: therapist@example.com, Password: therapist123
-- Then insert profile manually:
-- INSERT INTO public.profiles (id, role, display_name)
-- VALUES ('<therapist-user-id>', 'therapist', '治療師');

-- Sample client profile (create auth user first)
-- Email: client@example.com, Password: client1234
-- INSERT INTO public.profiles (id, role, display_name)
-- VALUES ('<client-user-id>', 'client', '小明');

-- The handle_new_user trigger will auto-create profile with role='client'
-- when users register via Supabase Auth

-- Sample weekly diary card (replace client_id with actual UUID)
-- INSERT INTO public.diary_cards (client_id, week_start, week_end, medications)
-- VALUES ('<client-user-id>', '2026-03-30', '2026-04-05', 'Sertraline 50mg');

-- Sample emergency plan
-- INSERT INTO public.emergency_plans (client_id, friend_name, friend_phone, therapist_name, therapist_phone)
-- VALUES ('<client-user-id>', '王小華', '0912-345-678', '張治療師', '0987-654-321');
