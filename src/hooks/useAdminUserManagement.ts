
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface CreateUserParams {
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'employee';
  department?: string;
}

interface ResetPasswordParams {
  email: string;
}

interface AdminFunctionResponse {
  success: boolean;
  message?: string;
  error?: string;
  user_id?: string;
  resetEmailSent?: boolean;
}

export const useAdminUserManagement = () => {
  const queryClient = useQueryClient();

  const createUser = useMutation({
    mutationFn: async ({ email, fullName, role, department }: CreateUserParams) => {
      console.log('Creating user with admin function:', { email, fullName, role, department });
      
      const { data, error } = await supabase.rpc('admin_create_user', {
        p_email: email,
        p_full_name: fullName,
        p_role: role,
        p_department: department
      });

      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }

      console.log('User creation response:', data);
      return data as AdminFunctionResponse;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'User created successfully');
        queryClient.invalidateQueries({ queryKey: ['users'] });
      } else {
        toast.error(data.error || 'Failed to create user');
      }
    },
    onError: (error) => {
      console.error('User creation error:', error);
      toast.error('Failed to create user: ' + error.message);
    }
  });

  const resetPassword = useMutation({
    mutationFn: async ({ email }: ResetPasswordParams) => {
      console.log('Resetting password for:', email);
      
      // First call our admin function to log the action
      const { data: adminData, error: adminError } = await supabase.rpc('admin_reset_user_password', {
        p_user_email: email
      });

      if (adminError) {
        console.error('Error in admin reset function:', adminError);
        throw adminError;
      }

      const adminResponse = adminData as AdminFunctionResponse;

      // Then trigger the actual password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`
      });

      if (resetError) {
        console.error('Error sending reset email:', resetError);
        throw resetError;
      }

      return { ...adminResponse, resetEmailSent: true };
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Password reset email sent successfully');
      } else {
        toast.error(data.error || 'Failed to reset password');
      }
    },
    onError: (error) => {
      console.error('Password reset error:', error);
      toast.error('Failed to reset password: ' + error.message);
    }
  });

  return {
    createUser,
    resetPassword,
    isCreatingUser: createUser.isPending,
    isResettingPassword: resetPassword.isPending
  };
};
