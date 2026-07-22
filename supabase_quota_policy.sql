-- 🛡️ SERVER-SIDE QUOTA ENFORCEMENT (SUPABASE)
-- Copy dan Paste script ini ke menu "SQL Editor" di Dashboard Supabase lalu klik "Run"

-- 1. Buat fungsi untuk mengecek role user dari tabel profiles
CREATE OR REPLACE FUNCTION get_user_plan(user_uuid uuid) 
RETURNS boolean AS $$
DECLARE
  is_pro_plan boolean;
BEGIN
  SELECT is_pro INTO is_pro_plan FROM public.profiles WHERE id = user_uuid;
  RETURN COALESCE(is_pro_plan, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update (atau Buat) Policy Insert (Upload) di bucket "files"
-- Policy ini MENOLAK file > 500MB untuk PRO, dan > 50MB untuk FREE
DROP POLICY IF EXISTS "Enforce Quota Upload" ON storage.objects;
CREATE POLICY "Enforce Quota Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'files' AND 
  (auth.uid())::text = (string_to_array(name, '/'))[1] AND
  (
    (get_user_plan(auth.uid()) = true AND (COALESCE((metadata->>'size')::bigint, 0) <= 524288000)) -- 500 MB (Pro)
    OR
    (get_user_plan(auth.uid()) = false AND (COALESCE((metadata->>'size')::bigint, 0) <= 52428800)) -- 50 MB (Free)
  )
);
