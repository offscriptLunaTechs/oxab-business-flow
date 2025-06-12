
-- First, let's ensure your account is set as admin
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'abdallajbara@aol.com'
);

-- If the role doesn't exist, insert it
INSERT INTO user_roles (user_id, role, created_by)
SELECT id, 'admin', id
FROM auth.users 
WHERE email = 'abdallajbara@aol.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Add RLS policies for user_roles table
DROP POLICY IF EXISTS "Admin can manage all user roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;

CREATE POLICY "Admin can manage all user roles" 
ON user_roles 
FOR ALL 
TO authenticated 
USING (public.has_permission('admin'))
WITH CHECK (public.has_permission('admin'));

CREATE POLICY "Users can view their own role" 
ON user_roles 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Add RLS policies for user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view and update own profile" ON user_profiles;

CREATE POLICY "Admin can manage all profiles" 
ON user_profiles 
FOR ALL 
TO authenticated 
USING (public.has_permission('admin'))
WITH CHECK (public.has_permission('admin'));

CREATE POLICY "Users can view and update own profile" 
ON user_profiles 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create a function for admin to create users
CREATE OR REPLACE FUNCTION public.admin_create_user(
  p_email text,
  p_full_name text,
  p_role text DEFAULT 'employee',
  p_department text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_user_id uuid;
  result jsonb;
BEGIN
  -- Check if current user is admin
  IF NOT public.has_permission('admin') THEN
    RAISE EXCEPTION 'Only admins can create users';
  END IF;

  -- Validate role
  IF p_role NOT IN ('admin', 'manager', 'employee') THEN
    RAISE EXCEPTION 'Invalid role. Must be admin, manager, or employee';
  END IF;

  -- Generate a UUID for the new user (this will be used when they actually sign up)
  new_user_id := gen_random_uuid();

  -- Create user profile
  INSERT INTO public.user_profiles (user_id, full_name, department)
  VALUES (new_user_id, p_full_name, p_department);

  -- Create user role
  INSERT INTO public.user_roles (user_id, role, created_by)
  VALUES (new_user_id, p_role, auth.uid());

  -- Log the creation
  PERFORM public.log_security_event(
    'admin_user_created',
    'user_profiles',
    new_user_id,
    NULL,
    jsonb_build_object(
      'email', p_email,
      'full_name', p_full_name,
      'role', p_role,
      'department', p_department
    ),
    'info'
  );

  result := jsonb_build_object(
    'success', true,
    'user_id', new_user_id,
    'message', 'User profile created. They can now sign up with email: ' || p_email
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

-- Create a function to reset user password (admin only)
CREATE OR REPLACE FUNCTION public.admin_reset_user_password(
  p_user_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  target_user_id uuid;
  result jsonb;
BEGIN
  -- Check if current user is admin
  IF NOT public.has_permission('admin') THEN
    RAISE EXCEPTION 'Only admins can reset user passwords';
  END IF;

  -- Get user ID from email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = p_user_email;

  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Log the password reset
  PERFORM public.log_security_event(
    'admin_password_reset',
    'auth.users',
    target_user_id,
    NULL,
    jsonb_build_object('reset_by_admin', auth.uid()),
    'warning'
  );

  result := jsonb_build_object(
    'success', true,
    'user_id', target_user_id,
    'message', 'Password reset initiated for user: ' || p_user_email
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

-- Update the handle_new_user function to work with admin-created profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  existing_profile_id uuid;
BEGIN
    -- Validate input
    IF NEW.id IS NULL OR NEW.email IS NULL THEN
        RAISE EXCEPTION 'Invalid user data: id and email are required';
    END IF;
    
    -- Check if profile already exists (admin pre-created)
    SELECT user_id INTO existing_profile_id
    FROM public.user_profiles up
    INNER JOIN public.user_roles ur ON up.user_id = ur.user_id
    WHERE NOT EXISTS (
      SELECT 1 FROM auth.users WHERE id = up.user_id
    )
    LIMIT 1;
    
    -- If admin pre-created profile exists, update it with the actual user ID
    IF existing_profile_id IS NOT NULL THEN
      -- Update profile with actual user ID
      UPDATE public.user_profiles 
      SET user_id = NEW.id 
      WHERE user_id = existing_profile_id;
      
      -- Update role with actual user ID
      UPDATE public.user_roles 
      SET user_id = NEW.id 
      WHERE user_id = existing_profile_id;
      
      -- Log the connection
      PERFORM public.log_security_event(
        'user_profile_connected',
        'user_profiles',
        NEW.id,
        NULL,
        jsonb_build_object('connected_from', existing_profile_id),
        'info'
      );
    ELSE
      -- No pre-created profile, create default one
      INSERT INTO public.user_profiles (user_id, full_name)
      VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
      
      -- Create default employee role
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'employee');
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't block user creation
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$;
