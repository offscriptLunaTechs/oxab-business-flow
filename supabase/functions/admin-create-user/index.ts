
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'employee';
  department?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client (with service role key for user creation)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create regular client for checking permissions
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify the current user is an admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.log('User verification failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin permissions
    const { data: hasAdminPermission, error: permissionError } = await supabaseClient
      .rpc('has_permission', { required_role: 'admin' });

    if (permissionError || !hasAdminPermission) {
      console.log('Permission check failed:', permissionError);
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Admin role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: CreateUserRequest = await req.json();
    const { email, fullName, role, department } = body;

    // Validate input
    if (!email || !fullName || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, fullName, role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['admin', 'manager', 'employee'].includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role. Must be admin, manager, or employee' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating user with admin API:', { email, fullName, role, department });

    // Create user in auth.users using admin API
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      user_metadata: { full_name: fullName },
      email_confirm: true, // Auto-confirm email to avoid email verification step
    });

    if (createUserError || !newUser.user) {
      console.error('Failed to create user:', createUserError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create user', 
          details: createUserError?.message 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User created successfully, provisioning profile and role:', newUser.user.id);

    // Now provision the profile and role using our SQL function with service parameter
    const { data: provisionResult, error: provisionError } = await supabaseAdmin
      .rpc('admin_provision_profile_and_role', {
        p_auth_user_id: newUser.user.id,
        p_full_name: fullName,
        p_role: role,
        p_department: department || null,
        p_called_by_service: true, // This tells the function this is an authorized service call
      });

    if (provisionError) {
      console.error('Failed to provision profile and role:', provisionError);
      
      // Clean up - delete the user we just created since provisioning failed
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to provision user profile and role', 
          details: provisionError.message 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!provisionResult || !provisionResult.success) {
      console.error('Provision function returned error:', provisionResult?.error || 'Unknown error');
      
      // Clean up - delete the user we just created since provisioning failed
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to provision user profile and role', 
          details: provisionResult?.error || 'Unknown provisioning error'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User provisioning completed successfully');

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        user_id: newUser.user.id,
        message: `User created successfully. They can now log in with email: ${email}`,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in admin-create-user:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
