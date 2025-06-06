
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthCache {
  user: User | null;
  role: string | null;
  lastValidated: number;
  sessionExpiry: number;
}

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  hasRole: (requiredRole: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = 'kecc_auth_cache';

export const OptimizedAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthCache>(() => {
    // Initialize from localStorage cache
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.lastValidated < AUTH_CACHE_DURATION && parsed.sessionExpiry > Date.now()) {
          return parsed;
        }
      } catch (error) {
        console.warn('Failed to parse auth cache:', error);
      }
    }
    return { user: null, role: null, lastValidated: 0, sessionExpiry: 0 };
  });

  const [loading, setLoading] = useState(true);

  const validateAndCache = useCallback(async (session: Session | null) => {
    const now = Date.now();
    
    if (!session) {
      const emptyState = { user: null, role: null, lastValidated: now, sessionExpiry: 0 };
      setAuthState(emptyState);
      localStorage.removeItem(STORAGE_KEY);
      setLoading(false);
      return;
    }

    // Check if we have recent valid cache
    if (authState.user && authState.user.id === session.user.id && 
        (now - authState.lastValidated < AUTH_CACHE_DURATION) && 
        authState.sessionExpiry > now) {
      setLoading(false);
      return;
    }

    try {
      // Single optimized query to get user role
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      const role = roleData?.role || 'employee';
      const sessionExpiry = session.expires_at ? new Date(session.expires_at).getTime() : now + (24 * 60 * 60 * 1000);

      const newAuthState: AuthCache = {
        user: session.user,
        role,
        lastValidated: now,
        sessionExpiry
      };

      setAuthState(newAuthState);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAuthState));
    } catch (error) {
      console.error('Auth validation error:', error);
      // Fallback to basic auth without role
      const basicState: AuthCache = {
        user: session.user,
        role: 'employee',
        lastValidated: now,
        sessionExpiry: now + (24 * 60 * 60 * 1000)
      };
      setAuthState(basicState);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(basicState));
    } finally {
      setLoading(false);
    }
  }, [authState.user?.id, authState.lastValidated, authState.sessionExpiry]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEY);
    setAuthState({ user: null, role: null, lastValidated: 0, sessionExpiry: 0 });
  }, []);

  const hasRole = useCallback((requiredRole: string) => {
    if (!authState.role) return false;
    
    const roleHierarchy = { admin: 3, manager: 2, employee: 1 };
    const userLevel = roleHierarchy[authState.role as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
    
    return userLevel >= requiredLevel;
  }, [authState.role]);

  // Optimized session checking
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          await validateAndCache(session);
        }
      } catch (error) {
        console.error('Session check error:', error);
        if (mounted) setLoading(false);
      }
    };

    // Only check session if cache is expired or invalid
    const now = Date.now();
    if (now - authState.lastValidated >= AUTH_CACHE_DURATION || authState.sessionExpiry <= now) {
      checkSession();
    } else if (authState.user) {
      setLoading(false);
    } else {
      checkSession();
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          if (event === 'SIGNED_OUT') {
            localStorage.removeItem(STORAGE_KEY);
          }
          await validateAndCache(session);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [validateAndCache]);

  return (
    <AuthContext.Provider value={{
      user: authState.user,
      userRole: authState.role,
      loading,
      signOut,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an OptimizedAuthProvider');
  }
  return context;
};
