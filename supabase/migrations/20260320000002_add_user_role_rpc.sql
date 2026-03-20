-- Restore the ability for admins to promote other users via Supabase RPC
CREATE OR REPLACE FUNCTION public.assign_user_role(target_user_id UUID, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Strict security: verify the caller is truly an admin using our fixed is_admin method
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can assign roles';
  END IF;

  -- Upgrade the profile safely
  UPDATE public.profiles
  SET role = new_role::public.user_role,
      updated_at = NOW()
  WHERE id = target_user_id;
END;
$$;

-- Restore the ability for admins to revoke access entirely via Supabase RPC
CREATE OR REPLACE FUNCTION public.remove_user_role(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Strict security
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can remove roles';
  END IF;

  -- Prevent admin from locking themselves out of the system
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot demote your own admin account';
  END IF;

  -- Reset to customer
  UPDATE public.profiles
  SET role = 'customer'::public.user_role,
      updated_at = NOW()
  WHERE id = target_user_id;
END;
$$;

-- Expose to the authenticated Next.js API layer
GRANT EXECUTE ON FUNCTION public.assign_user_role(UUID, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_user_role(UUID) TO authenticated;
