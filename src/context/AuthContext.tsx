
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state change:', event, currentSession?.user?.email);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Fetch user role if user is authenticated
        if (currentSession?.user) {
          // Use setTimeout to prevent potential recursion in RLS
          setTimeout(() => {
            fetchUserRole(currentSession.user.id);
          }, 100);
        } else {
          setUserRole(null);
        }
        
        // Only show toasts for explicit user actions, not initial loads
        if (event === 'SIGNED_IN' && currentSession?.user) {
          console.log('User signed in:', currentSession.user.email);
          toast.success('Successfully signed in!');
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          toast.info('Signed out successfully');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed for user:', currentSession?.user?.email);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          return;
        }
        
        console.log('Initial session check:', initialSession?.user?.email || 'No session');
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          await fetchUserRole(initialSession.user.id);
        }
      } catch (error) {
        console.error('Error initializing authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Fetching role for user:', userId);
      
      // Use the new security definer function to safely get user role
      const { data, error } = await supabase.rpc('get_user_role', {
        user_id: userId
      });
      
      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole('employee'); // Default role
        return;
      }
      
      console.log('User role fetched:', data);
      setUserRole(data || 'employee');
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setUserRole('employee'); // Default role on error
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      
      console.log('Sign in successful for:', email);
      return { error: null };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Attempting sign up for:', email);
      
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
        return { error };
      }
      
      console.log('Sign up successful for:', email);
      return { error: null };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting sign out');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Error signing out');
        return;
      }
      
      console.log('Sign out successful');
    } catch (error) {
      console.error('Unexpected sign out error:', error);
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
