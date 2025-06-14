
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface InvitationData {
  email: string;
  role: string;
  department?: string;
  custom_message?: string;
}

interface InvitationSignupResult {
  success: boolean;
  error?: string;
  role?: string;
  department?: string;
}

const InvitationSignup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingUp, setSigningUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    confirmPassword: ''
  });

  const token = searchParams.get('token');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
      return;
    }

    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    validateInvitation();
  }, [token, user, navigate]);

  const validateInvitation = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('invitations')
        .select('email, role, department, custom_message, expires_at, status')
        .eq('token', token)
        .single();

      if (error || !data) {
        setError('Invitation not found');
        return;
      }

      if (data.status !== 'pending') {
        setError('This invitation has already been used or cancelled');
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setError('This invitation has expired');
        return;
      }

      setInvitationData(data);
    } catch (error) {
      console.error('Error validating invitation:', error);
      setError('Failed to validate invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setSigningUp(true);
      
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitationData!.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Process the invitation signup
      const { data: invitationResult, error: invitationError } = await supabase
        .rpc('handle_invitation_signup', {
          p_invitation_token: token,
          p_user_id: authData.user.id
        });

      if (invitationError) {
        throw new Error('Failed to process invitation');
      }

      // Properly type the response by converting through unknown first
      const result = invitationResult as unknown as InvitationSignupResult;
      
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to process invitation');
      }

      toast.success('Account created successfully! You can now sign in.');
      navigate('/login');
      
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setSigningUp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-6 text-center">
              <Button onClick={() => navigate('/login')} variant="outline">
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <UserPlus className="h-6 w-6" />
            Complete Your Registration
          </CardTitle>
          <CardDescription>
            You've been invited to join KECC Business System
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Invitation Details</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Email:</strong> {invitationData?.email}</p>
              <p><strong>Role:</strong> <span className="capitalize">{invitationData?.role}</span></p>
              {invitationData?.department && (
                <p><strong>Department:</strong> {invitationData.department}</p>
              )}
            </div>
            {invitationData?.custom_message && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-sm italic text-blue-800">"{invitationData.custom_message}"</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Create a password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm your password"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={signingUp}>
              {signingUp ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Creating Account...</span>
                </>
              ) : (
                'Complete Registration'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/login')}>
              Sign in here
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationSignup;
