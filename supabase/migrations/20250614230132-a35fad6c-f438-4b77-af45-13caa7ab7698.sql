
-- Create enum for invitation status
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');

-- Create invitations table
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee')),
  department TEXT,
  status invitation_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  invited_by UUID REFERENCES auth.users(id),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  custom_message TEXT
);

-- Add RLS to invitations table
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Only admins can manage invitations
CREATE POLICY "Admins can manage invitations" ON public.invitations
  FOR ALL USING (public.has_permission('admin'));

-- Create function to handle invitation-based user registration
CREATE OR REPLACE FUNCTION public.handle_invitation_signup(
  p_invitation_token TEXT,
  p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invitation_record invitations;
  result JSONB;
BEGIN
  -- Get invitation details
  SELECT * INTO invitation_record
  FROM public.invitations
  WHERE token = p_invitation_token
    AND status = 'pending'
    AND expires_at > NOW();

  IF invitation_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or expired invitation'
    );
  END IF;

  -- Create user profile with invitation details
  INSERT INTO public.user_profiles (user_id, full_name, department)
  VALUES (p_user_id, '', invitation_record.department);

  -- Assign role from invitation
  INSERT INTO public.user_roles (user_id, role, created_by)
  VALUES (p_user_id, invitation_record.role, invitation_record.invited_by);

  -- Mark invitation as accepted
  UPDATE public.invitations
  SET status = 'accepted', accepted_at = NOW(), updated_at = NOW()
  WHERE id = invitation_record.id;

  -- Log the event
  PERFORM public.log_security_event(
    'invitation_signup_completed',
    'invitations',
    invitation_record.id,
    NULL,
    jsonb_build_object(
      'user_id', p_user_id,
      'email', invitation_record.email,
      'role', invitation_record.role
    ),
    'info'
  );

  RETURN jsonb_build_object(
    'success', true,
    'role', invitation_record.role,
    'department', invitation_record.department
  );
END;
$$;

-- Create function to expire old invitations
CREATE OR REPLACE FUNCTION public.expire_old_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.invitations
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' AND expires_at <= NOW();
END;
$$;

-- Block standard registration by updating the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  profile_exists boolean;
  role_exists boolean;
BEGIN
  -- Validate input
  IF NEW.id IS NULL OR NEW.email IS NULL THEN
    RAISE EXCEPTION 'Invalid user data: id and email are required for handle_new_user';
  END IF;

  -- Check if a profile already exists for this user_id (created by invitation signup)
  SELECT EXISTS(SELECT 1 FROM public.user_profiles WHERE user_id = NEW.id) INTO profile_exists;
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = NEW.id) INTO role_exists;

  -- If no profile/role exists, this means they signed up without invitation
  -- Block this by not creating default profile/role
  IF NOT profile_exists AND NOT role_exists THEN
    PERFORM public.log_security_event(
      'unauthorized_signup_blocked',
      'auth.users',
      NEW.id,
      NULL,
      jsonb_build_object('email', NEW.email),
      'warning'
    );
    
    -- Don't create profile or role - user will be blocked from accessing system
    RETURN NEW;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    PERFORM public.log_security_event(
      'handle_new_user_error',
      NULL,
      NEW.id,
      NULL,
      jsonb_build_object('error_message', SQLERRM, 'user_email', NEW.email),
      'error'
    );
    RETURN NEW;
END;
$$;
