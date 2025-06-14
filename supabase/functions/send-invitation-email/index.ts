
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationData {
  id: string;
  email: string;
  token: string;
  role: string;
  department?: string;
  custom_message?: string;
  invited_by?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role key for database operations to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { invitationId } = await req.json();
    
    if (!invitationId) {
      throw new Error('Invitation ID is required');
    }

    console.log('Processing invitation email for ID:', invitationId);

    // Get invitation details from database using service role
    const { data: invitation, error: fetchError } = await supabaseClient
      .from('invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    if (fetchError || !invitation) {
      console.error('Failed to fetch invitation:', fetchError);
      throw new Error(`Invitation not found: ${fetchError?.message || 'Unknown error'}`);
    }

    const invitationData = invitation as InvitationData;
    console.log('Fetched invitation data:', { email: invitationData.email, role: invitationData.role });

    // Create invitation signup URL
    const baseUrl = req.headers.get('origin') || 'http://localhost:8080';
    const invitationUrl = `${baseUrl}/auth/invitation?token=${invitationData.token}`;

    // Prepare email content
    const emailSubject = 'You\'re invited to join KECC Business System';
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitation to KECC Business System</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .invitation-details { background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px; }
            .invitation-details h3 { margin: 0 0 15px 0; color: #1e40af; font-size: 18px; }
            .detail-item { margin: 8px 0; }
            .detail-label { font-weight: 600; color: #374151; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 25px 0; transition: transform 0.2s; }
            .cta-button:hover { transform: translateY(-2px); }
            .custom-message { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }
            .custom-message-title { font-weight: 600; color: #92400e; margin: 0 0 10px 0; }
            .footer { background-color: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
            .security-note { background-color: #fee2e2; border: 1px solid #fca5a5; padding: 15px; border-radius: 6px; margin-top: 25px; font-size: 14px; }
            .security-note-title { font-weight: 600; color: #dc2626; margin: 0 0 8px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 You're Invited!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Join KECC Business System</p>
            </div>
            
            <div class="content">
              <p>Hello!</p>
              <p>You've been invited to join the <strong>KECC Business System</strong>. This platform will give you access to manage business operations, track inventory, handle invoices, and collaborate with your team.</p>
              
              <div class="invitation-details">
                <h3>📋 Invitation Details</h3>
                <div class="detail-item"><span class="detail-label">Email:</span> ${invitationData.email}</div>
                <div class="detail-item"><span class="detail-label">Role:</span> <span style="text-transform: capitalize; background-color: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 14px;">${invitationData.role}</span></div>
                ${invitationData.department ? `<div class="detail-item"><span class="detail-label">Department:</span> ${invitationData.department}</div>` : ''}
              </div>

              ${invitationData.custom_message ? `
                <div class="custom-message">
                  <div class="custom-message-title">💬 Personal Message</div>
                  <p style="margin: 0; font-style: italic; color: #92400e;">"${invitationData.custom_message}"</p>
                </div>
              ` : ''}

              <div style="text-align: center; margin: 35px 0;">
                <a href="${invitationUrl}" class="cta-button">
                  🚀 Complete Your Registration
                </a>
              </div>

              <p>Click the button above to complete your registration and set up your account. You'll be able to access all the features based on your assigned role.</p>

              <div class="security-note">
                <div class="security-note-title">🔒 Security Notice</div>
                <p style="margin: 0;">This invitation will expire in 7 days. If you didn't expect this invitation, please ignore this email or contact your system administrator.</p>
              </div>
            </div>

            <div class="footer">
              <p>This invitation was sent by KECC Business System</p>
              <p style="margin: 10px 0 0 0;">If you have any questions, please contact your system administrator.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
      You're invited to join KECC Business System!
      
      Email: ${invitationData.email}
      Role: ${invitationData.role}
      ${invitationData.department ? `Department: ${invitationData.department}` : ''}
      
      ${invitationData.custom_message ? `Personal Message: "${invitationData.custom_message}"` : ''}
      
      Complete your registration: ${invitationUrl}
      
      This invitation will expire in 7 days.
      
      Best regards,
      KECC Business System
    `;

    // Send email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('Resend API key not configured');
    }

    console.log('Sending email to:', invitationData.email);

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'KECC Business System <onboarding@resend.dev>',
        to: [invitationData.email],
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log('Email API response:', emailResult);

    if (!emailResponse.ok) {
      throw new Error(`Email sending failed: ${emailResult.message || 'Unknown error'}`);
    }

    // Update invitation with email sent status using service role
    const { error: updateError } = await supabaseClient
      .from('invitations')
      .update({
        email_status: 'sent',
        email_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', invitationId);

    if (updateError) {
      console.error('Failed to update invitation status:', updateError);
      // Don't throw here as email was sent successfully
    }

    console.log('Invitation email sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation email sent successfully',
        emailId: emailResult.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in send-invitation-email function:', error);

    // Try to update invitation with failed status using service role
    try {
      const body = await req.clone().json();
      if (body.invitationId) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        );

        await supabaseClient
          .from('invitations')
          .update({
            email_status: 'failed',
            email_error: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', body.invitationId);
      }
    } catch (updateError) {
      console.error('Failed to update invitation with error status:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
