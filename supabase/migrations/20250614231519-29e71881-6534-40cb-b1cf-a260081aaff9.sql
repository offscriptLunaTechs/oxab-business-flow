
-- Add email tracking fields to invitations table
ALTER TABLE public.invitations 
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_status TEXT DEFAULT 'pending' CHECK (email_status IN ('pending', 'sent', 'failed')),
ADD COLUMN IF NOT EXISTS email_error TEXT;

-- Add index for better performance on email status queries
CREATE INDEX IF NOT EXISTS idx_invitations_email_status ON public.invitations(email_status);

-- Update the invitation status enum to include email_failed
-- (This will help track invitations where email sending failed)
COMMENT ON COLUMN public.invitations.email_status IS 'Tracks the status of invitation email: pending, sent, failed';
