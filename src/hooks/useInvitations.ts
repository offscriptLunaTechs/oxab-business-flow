
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface Invitation {
  id: string;
  email: string;
  token: string;
  role: 'admin' | 'manager' | 'employee';
  department?: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expires_at: string;
  invited_by?: string;
  accepted_at?: string;
  created_at: string;
  updated_at: string;
  custom_message?: string;
  email_sent_at?: string;
  email_status?: 'pending' | 'sent' | 'failed';
  email_error?: string;
}

export interface CreateInvitationParams {
  email: string;
  role: 'admin' | 'manager' | 'employee';
  department?: string;
  customMessage?: string;
}

export const useInvitations = () => {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Invitation[];
    }
  });
};

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateInvitationParams) => {
      console.log('Creating invitation for:', params.email);
      
      // First create the invitation record
      const { data: invitation, error } = await supabase
        .from('invitations')
        .insert({
          email: params.email,
          role: params.role,
          department: params.department,
          custom_message: params.customMessage,
          invited_by: (await supabase.auth.getUser()).data.user?.id,
          email_status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create invitation:', error);
        throw error;
      }

      console.log('Invitation created, sending email...');

      // Then send the invitation email
      try {
        const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-invitation-email', {
          body: { invitationId: invitation.id }
        });

        if (emailError) {
          console.error('Email function error:', emailError);
          throw new Error(`Failed to send invitation email: ${emailError.message}`);
        }

        if (!emailResult?.success) {
          throw new Error(emailResult?.error || 'Failed to send invitation email');
        }

        console.log('Invitation email sent successfully');
        return invitation;
      } catch (emailError) {
        console.error('Error sending invitation email:', emailError);
        // Don't throw here - invitation was created successfully
        // The email status will be marked as failed in the database
        toast.warning('Invitation created but email sending failed. You can resend it later.');
        return invitation;
      }
    },
    onSuccess: () => {
      toast.success('Invitation sent successfully');
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
    onError: (error: any) => {
      console.error('Invitation creation error:', error);
      toast.error('Failed to send invitation: ' + error.message);
    }
  });
};

export const useDeleteInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Invitation deleted');
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
    onError: (error: any) => {
      toast.error('Failed to delete invitation: ' + error.message);
    }
  });
};

export const useResendInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      console.log('Resending invitation:', invitationId);
      
      // Update expiry date first
      const { error: updateError } = await supabase
        .from('invitations')
        .update({ 
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          email_status: 'pending'
        })
        .eq('id', invitationId);

      if (updateError) throw updateError;

      // Send the email
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-invitation-email', {
        body: { invitationId }
      });

      if (emailError) {
        throw new Error(`Failed to resend invitation email: ${emailError.message}`);
      }

      if (!emailResult?.success) {
        throw new Error(emailResult?.error || 'Failed to resend invitation email');
      }

      return emailResult;
    },
    onSuccess: () => {
      toast.success('Invitation resent successfully');
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
    onError: (error: any) => {
      console.error('Resend invitation error:', error);
      toast.error('Failed to resend invitation: ' + error.message);
    }
  });
};
