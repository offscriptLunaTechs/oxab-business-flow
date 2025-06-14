
-- Create a new SQL function to provision profile and role for an existing auth.users ID
CREATE OR REPLACE FUNCTION public.admin_provision_profile_and_role(
  p_auth_user_id uuid,
  p_full_name text,
  p_role text,
  p_department text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Ensure the calling user is an admin (important for security if this function is exposed)
  -- Note: If called ONLY by the service-role Edge Function, this check might be redundant there,
  -- but good practice if the SQL function could be called elsewhere.
  IF NOT public.has_permission('admin') THEN
    RAISE EXCEPTION 'Only admins or authorized services can provision profiles and roles.';
  END IF;

  -- Validate role
  IF p_role NOT IN ('admin', 'manager', 'employee') THEN
    RAISE EXCEPTION 'Invalid role. Must be admin, manager, or employee.';
  END IF;

  -- Create user profile
  INSERT INTO public.user_profiles (user_id, full_name, department)
  VALUES (p_auth_user_id, p_full_name, p_department);

  -- Create user role
  INSERT INTO public.user_roles (user_id, role, created_by)
  VALUES (p_auth_user_id, p_role, auth.uid()); -- `auth.uid()` here will be the admin user if called via RPC by admin, or null/service if by Edge Function

  -- Log the provisioning
  PERFORM public.log_security_event(
    'admin_user_profile_role_provisioned',
    'user_profiles',
    p_auth_user_id,
    NULL,
    jsonb_build_object(
      'auth_user_id', p_auth_user_id,
      'full_name', p_full_name,
      'role', p_role,
      'department', p_department
    ),
    'info'
  );

  result := jsonb_build_object(
    'success', true,
    'user_id', p_auth_user_id,
    'message', 'User profile and role provisioned successfully.'
  );

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Modify the handle_new_user function.
-- Since admin-created users will now have profiles provisioned correctly by the Edge Function,
-- the logic for linking pre-created profiles with random UUIDs is no longer needed.
-- We'll keep the part that creates default profiles for users who might sign up
-- through other means (though project guidelines say "NO Public Signups").
-- For safety, we'll assume this trigger should still create basic entries if a profile/role doesn't exist.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  profile_exists boolean;
  role_exists boolean;
BEGIN
    -- Validate input
    IF NEW.id IS NULL OR NEW.email IS NULL THEN
        RAISE EXCEPTION 'Invalid user data: id and email are required for handle_new_user';
    END IF;

    -- Check if a profile already exists for this user_id (provisioned by admin)
    SELECT EXISTS(SELECT 1 FROM public.user_profiles WHERE user_id = NEW.id) INTO profile_exists;
    SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = NEW.id) INTO role_exists;

    IF NOT profile_exists THEN
      -- No pre-created profile by admin, create a default one.
      -- According to guidelines, this path should ideally not be taken if only admins create users.
      INSERT INTO public.user_profiles (user_id, full_name)
      VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));

      PERFORM public.log_security_event(
        'default_user_profile_created_on_signup',
        'user_profiles',
        NEW.id,
        NULL,
        jsonb_build_object('email', NEW.email, 'full_name', COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)),
        'info'
      );
    END IF;

    IF NOT role_exists THEN
      -- No pre-assigned role by admin, assign default 'employee' role.
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'employee');

      PERFORM public.log_security_event(
        'default_user_role_assigned_on_signup',
        'user_roles',
        NEW.id,
        NULL,
        jsonb_build_object('role', 'employee'),
        'info'
      );
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        -- Attempt to log the error to security_audit_logs as well
        BEGIN
            PERFORM public.log_security_event(
                'handle_new_user_error',
                NULL,
                NEW.id,
                NULL,
                jsonb_build_object('error_message', SQLERRM, 'user_email', NEW.email),
                'error'
            );
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING 'Failed to log handle_new_user_error: %', SQLERRM;
        END;
        RETURN NEW; -- Allow user creation to proceed if possible
END;
$$;

-- The old admin_create_user function is problematic due_to FK violation.
-- We are replacing its functionality with an Edge Function + admin_provision_profile_and_role.
-- You might want to drop it or keep it for reference but ensure it's not used.
-- For now, let's comment out its creation if it's in the same migration script,
-- or ensure it's dropped if it was created by a previous migration.
-- DROP FUNCTION IF EXISTS public.admin_create_user(text, text, text, text);
-- (Assuming it's in supabase/migrations/20250612140758-d5fe9bb7-dac1-47ee-881e-6e57f57920af.sql,
--  Lovable will handle applying changes to that file later if needed, or I'll update it directly)

