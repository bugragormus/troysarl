-- Run this in your Supabase SQL Editor to sync missing profiles
INSERT INTO public.profiles (id, full_name, username, marketing_consent)
SELECT 
    au.id, 
    au.raw_user_meta_data->>'full_name',
    SPLIT_PART(au.email, '@', 1) || floor(random() * 1000)::text,
    COALESCE((au.raw_user_meta_data->>'marketing_consent')::boolean, false)
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
