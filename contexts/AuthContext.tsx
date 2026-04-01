import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../supabaseClient';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ requiresEmailConfirmation: boolean }>;
  signInWithGoogle: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (session) {
        fetchProfile(session.user.id, session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (session) {
        fetchProfile(session.user.id, session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, sessionUser?: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Profile doesn't exist yet - fallback to session user if provided
        if (sessionUser) {
          setUser(createUserFromSession(sessionUser));
        }
      } else if (data) {
        setUser(data as User);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (sessionUser && !user) {
        setUser(createUserFromSession(sessionUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const createUserFromSession = (sessionUser: any) => {
    const metadata = sessionUser.user_metadata || {};
    return {
      id: sessionUser.id,
      email: sessionUser.email,
      name: metadata.full_name || metadata.name || sessionUser.email?.split('@')[0] || 'User',
      role: 'Student' as UserRole,
      avatarUrl: metadata.avatar_url || metadata.picture || '',
      status: 'Active' as const,
      joinedAt: new Date().toISOString()
    };
  };

  const login = async (email: string, password?: string) => {
    if (!password) throw new Error("Password is required");

    setLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (session) {
        await fetchProfile(session.user.id, session.user);
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ requiresEmailConfirmation: boolean }> => {
    setLoading(true);
    try {
      const redirectUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      // Check if email confirmation is required
      if (data.user && !data.session) {
        setLoading(false);
        return { requiresEmailConfirmation: true };
      }

      // If no confirmation required (emailConfirm disabled in Supabase), fetch profile
      if (data.session) {
        await fetchProfile(data.user!.id, data.user);
      }

      return { requiresEmailConfirmation: false };
    } catch (err: any) {
      setLoading(false);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const redirectUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setLoading(false);
      console.error('Google sign-in error:', err);
      throw new Error(err.message || 'Failed to sign in with Google. Please check Supabase OAuth configuration.');
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error logging out globally, attempting local logout:', error);
        await supabase.auth.signOut({ scope: 'local' });
      }
    } catch (err) {
      console.error('Error during logout:', err);
      await supabase.auth.signOut({ scope: 'local' });
    }
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, login, signUp, signInWithGoogle, logout, isAuthenticated: !!user, hasRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};