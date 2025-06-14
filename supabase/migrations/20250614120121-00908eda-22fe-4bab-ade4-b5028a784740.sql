
-- Modify the admin_provision_profile_and_role function to accept service calls
CREATE OR REPLACE FUNCTION public.admin_provision_profile_and_role(
  p_auth_user_id uuid, 
  p_full_name text, 
  p_role text, 
  p_department text DEFAULT NULL::text,
  p_called_by_service boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Check permissions: either admin user OR authorized service call
  IF NOT p_called_by_service AND NOT public.has_permission('admin') THEN
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
  VALUES (p_auth_user_id, p_role, auth.uid()); -- This will be null for service calls, which is fine

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
      'department', p_department,
      'called_by_service', p_called_by_service
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
