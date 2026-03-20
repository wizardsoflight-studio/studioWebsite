-- ==============================================
-- Wizard Of Light — Fix Legacy Enums Crash
-- ==============================================
-- Fixes fatal enum casting crashes by purging 
-- old string roles like 'owner' and replacing
-- them with authentic 'admin' / 'staff' checks.

-- 1. Replace is_admin() helper
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN exists (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Replace is_manager() helper
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean AS $$
BEGIN
  RETURN exists (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Replace is_content_editor() helper
CREATE OR REPLACE FUNCTION public.is_content_editor()
RETURNS boolean AS $$
BEGIN
  RETURN exists (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Fix staff permissions hardcoded string
DROP POLICY IF EXISTS "Owners can manage staff permissions" ON public.staff_permissions;
CREATE POLICY "Admins can manage staff permissions"
  ON public.staff_permissions FOR ALL
  USING (
    exists (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Recreate storage policies to use secure helper instead of strings
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

CREATE POLICY "Admins can upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'products' AND auth.uid() IS NOT NULL AND public.is_admin()
);

CREATE POLICY "Admins can update product images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'products' AND auth.uid() IS NOT NULL AND public.is_admin()
);

CREATE POLICY "Admins can delete product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'products' AND auth.uid() IS NOT NULL AND public.is_admin()
);
