
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User, AuthError } from "@supabase/supabase-js";
import { toast } from "@/components/ui/sonner";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: string | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
  sessionValid: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionValid, setSessionValid] = useState(true);

  // Security audit logging function
  const logSecurityEvent = useCallback(async (
    eventType: string, 
    severity: 'info' | 'warning' | 'error' | 'critical' = 'info'
  ) => {
    try {
      await supabase.rpc('log_security_event', {
        event_type: eventType,
        severity
      });
    } catch (error) {
      console.warn('Failed to log security event:', error);
    }
  }, []);

  // Optimized role fetching - only once per session
  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      console.log('Fetching role for user:', userId);
      
      const { data, error } = await supabase.rpc('get_user_role_safe', {
        user_id: userId
      });
      
      if (error) {
        console.error('Error fetching user role:', error);
        await logSecurityEvent('role_fetch_error', 'error');
        setUserRole('employee'); // Default role
        return;
      }
      
      console.log('User role fetched:', data);
      setUserRole(data || 'employee');
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      await logSecurityEvent('role_fetch_error', 'error');
      setUserRole('employee'); // Default role on error
    }
  }, [logSecurityEvent]);

  // Session validation
  const validateSession = useCallback(async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    
    if (currentSession) {
      const tokenExpiry = new Date(currentSession.expires_at! * 1000);
      const now = new Date();
      
      if (tokenExpiry <= now) {
        console.log('Session expired, signing out user');
        await logSecurityEvent('session_expired', 'warning');
        await supabase.auth.signOut();
        setSessionValid(false);
        toast.error('Session expired. Please log in again.');
        return false;
      }
      
      // Check if session is nearing expiry (within 1 hour)
      const oneHour = 60 * 60 * 1000;
      if (tokenExpiry.getTime() - now.getTime() < oneHour) {
        console.log('Session nearing expiry, refreshing...');
        try {
          const { error } = await supabase.auth.refreshSession();
          if (error) {
            console.error('Failed to refresh session:', error);
            await logSecurityEvent('session_refresh_failed', 'error');
          } else {
            await logSecurityEvent('session_refreshed', 'info');
          }
        } catch (error) {
          console.error('Session refresh error:', error);
        }
      }
    }
    
    setSessionValid(true);
    return true;
  }, [logSecurityEvent]);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, currentSession?.user?.email);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Only fetch role if user is authenticated and role is not already set
        if (currentSession?.user && !userRole) {
          // Delay role fetching to avoid blocking auth state change
          setTimeout(() => {
            if (mounted) {
              fetchUserRole(currentSession.user.id);
            }
          }, 100);
        } else if (!currentSession?.user) {
          setUserRole(null);
        }
        
        // Handle auth events with security logging
        if (event === 'SIGNED_IN' && currentSession?.user) {
          console.log('User signed in:', currentSession.user.email);
          logSecurityEvent('user_signed_in', 'info');
          toast.success('Successfully signed in!');
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          logSecurityEvent('user_signed_out', 'info');
          toast.info('Signed out successfully');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed for user:', currentSession?.user?.email);
          logSecurityEvent('token_refreshed', 'info');
        }
      }
    );

    // Session validation interval - check every 10 minutes (reduced frequency)
    const sessionInterval = setInterval(validateSession, 10 * 60 * 1000);

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          await logSecurityEvent('auth_initialization_error', 'error');
          return;
        }
        
        console.log('Initial session check:', initialSession?.user?.email || 'No session');
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          await fetchUserRole(initialSession.user.id);
          await validateSession();
        }
      } catch (error) {
        console.error('Error initializing authentication:', error);
        await logSecurityEvent('auth_initialization_error', 'error');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearInterval(sessionInterval);
    };
  }, [logSecurityEvent, validateSession, fetchUserRole, userRole]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      await logSecurityEvent('sign_in_attempt', 'info');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        await logSecurityEvent('sign_in_failed', 'warning');
        return { error };
      }
      
      console.log('Sign in successful for:', email);
      await logSecurityEvent('sign_in_successful', 'info');
      return { error: null };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      await logSecurityEvent('sign_in_error', 'error');
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Attempting sign up for:', email);
      await logSecurityEvent('sign_up_attempt', 'info');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        await logSecurityEvent('sign_up_failed', 'warning');
        return { error };
      }
      
      console.log('Sign up successful for:', email);
      await logSecurityEvent('sign_up_successful', 'info');
      return { error: null };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      await logSecurityEvent('sign_up_error', 'error');
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting sign out');
      await logSecurityEvent('sign_out_attempt', 'info');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        await logSecurityEvent('sign_out_failed', 'error');
        toast.error('Error signing out');
        return;
      }
      
      console.log('Sign out successful');
      await logSecurityEvent('sign_out_successful', 'info');
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      await logSecurityEvent('sign_out_error', 'error');
      toast.error('Error signing out');
    }
  };

  const value = {
    session,
    user,
    userRole,
    signIn,
    signUp,
    signOut,
    loading,
    sessionValid,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
