-- =====================================================
-- Role-Based Access Control (RBAC) System
-- Wizard Of Light - Admin, Staff, Customer Roles
-- =====================================================

-- 1. Create enum for user roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'staff', 'customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add role column to profiles table if not exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'customer';

-- 3. Add index on role for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 4. Create admin_users table for additional admin metadata
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create function to check if user has role
CREATE OR REPLACE FUNCTION has_role(required_role user_role)
RETURNS BOOLEAN AS $$
DECLARE
    user_role_value user_role;
BEGIN
    SELECT role INTO user_role_value
    FROM profiles
    WHERE id = auth.uid();
    
    CASE required_role
        WHEN 'admin' THEN
            RETURN user_role_value = 'admin';
        WHEN 'staff' THEN
            RETURN user_role_value IN ('admin', 'staff');
        WHEN 'customer' THEN
            RETURN user_role_value IS NOT NULL;
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
DECLARE
    current_role user_role;
BEGIN
    SELECT role INTO current_role
    FROM profiles
    WHERE id = auth.uid();
    
    RETURN current_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Update RLS policies for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Allow users to update their own profile (except role)
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND 
        role = (SELECT role FROM profiles WHERE id = auth.uid())
    );

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT
    USING (has_role('admin'));

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE
    USING (has_role('admin'));

-- 8. RLS policies for admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admins can manage admin_users" ON admin_users;

CREATE POLICY "Admins can view admin_users" ON admin_users
    FOR SELECT
    USING (has_role('admin'));

CREATE POLICY "Admins can manage admin_users" ON admin_users
    FOR ALL
    USING (has_role('admin'))
    WITH CHECK (has_role('admin'));

-- 9. Create function to assign role to user
CREATE OR REPLACE FUNCTION assign_user_role(
    target_user_id UUID,
    new_role user_role
)
RETURNS BOOLEAN AS $$
DECLARE
    caller_role user_role;
BEGIN
    -- Get caller's role
    SELECT role INTO caller_role
    FROM profiles
    WHERE id = auth.uid();
    
    -- Only admins can assign roles
    IF caller_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can assign user roles';
        RETURN FALSE;
    END IF;
    
    -- Update the user's role
    UPDATE profiles
    SET role = new_role
    WHERE id = target_user_id;
    
    -- If assigning admin or staff role, create admin_users entry
    IF new_role IN ('admin', 'staff') THEN
        INSERT INTO admin_users (profile_id, granted_by)
        SELECT target_user_id, auth.uid()
        WHERE NOT EXISTS (
            SELECT 1 FROM admin_users WHERE profile_id = target_user_id
        )
        ON CONFLICT (profile_id) DO UPDATE
        SET 
            granted_by = auth.uid(),
            granted_at = NOW(),
            updated_at = NOW();
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create function to remove admin/staff role
CREATE OR REPLACE FUNCTION remove_user_role(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    caller_role user_role;
BEGIN
    -- Get caller's role
    SELECT role INTO caller_role
    FROM profiles
    WHERE id = auth.uid();
    
    -- Only admins can remove roles
    IF caller_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can remove user roles';
        RETURN FALSE;
    END IF;
    
    -- Prevent admin from removing their own role
    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Cannot remove your own admin role';
        RETURN FALSE;
    END IF;
    
    -- Reset to customer role
    UPDATE profiles
    SET role = 'customer'
    WHERE id = target_user_id;
    
    -- Remove from admin_users
    DELETE FROM admin_users
    WHERE profile_id = target_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create trigger to auto-create profile with customer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        'customer'  -- Default role for new users
    )
    ON CONFLICT (id) DO UPDATE
    SET email = NEW.email;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 12. Create view for admin dashboard
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as total_admins,
    (SELECT COUNT(*) FROM profiles WHERE role = 'staff') as total_staff,
    (SELECT COUNT(*) FROM profiles WHERE role = 'customer') as total_customers,
    (SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at > NOW() - INTERVAL '7 days') as active_users_7d,
    (SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at > NOW() - INTERVAL '30 days') as active_users_30d;

-- 13. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON admin_users TO authenticated;
GRANT EXECUTE ON FUNCTION has_role TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION assign_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION remove_user_role TO authenticated;
GRANT SELECT ON admin_dashboard_stats TO authenticated;

-- =====================================================
-- SETUP INSTRUCTIONS:
-- 
-- After running this migration, to create your first admin:
-- 
-- 1. Sign up as a normal user first (via website signup)
-- 2. In Supabase Dashboard > SQL Editor, run:
--
--    -- Replace with your user's email
--    UPDATE profiles 
--    SET role = 'admin' 
--    WHERE email = 'your-email@example.com';
--
--    INSERT INTO admin_users (profile_id, granted_by)
--    SELECT id, id FROM profiles WHERE email = 'your-email@example.com';
--
-- 3. Or use the assign_user_role function:
--
--    SELECT assign_user_role(
--        (SELECT id FROM profiles WHERE email = 'your-email@example.com'),
--        'admin'
--    );
-- =====================================================
