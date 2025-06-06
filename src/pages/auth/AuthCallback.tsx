
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from '@/components/ui/sonner';

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if we have a hash in the URL (e.g. from email confirmation)
        const hashParams = window.location.hash;
        
        if (hashParams && hashParams.includes('access_token')) {
          // The hash contains auth params, let Supabase handle it
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Error getting session:", error);
            setError(error.message);
            toast.error("Authentication failed: " + error.message);
            return;
          }
          
          if (data?.session) {
            toast.success('Successfully authenticated');
            // Redirect to dashboard after successful authentication
            navigate('/dashboard');
            return;
          }
        }
        
        // Try to get the session normally
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error in auth callback:", error);
          setError(error.message);
          return;
        }
        
        if (data?.session) {
          // Redirect to dashboard after successful authentication
          navigate('/dashboard');
        } else {
          // No session found, redirect to login
          navigate('/auth/login');
        }
      } catch (err) {
        console.error("Unexpected error in auth callback:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => navigate('/auth/login')}
            className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">Completing authentication...</p>
    </div>
  );
};

export default AuthCallback;
