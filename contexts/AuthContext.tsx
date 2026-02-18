import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../supabaseClient';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
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
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) {
        setUser(data as User);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password?: string) => {
    if (!password) throw new Error("Password is required");

    setLoading(true);
    try {
      const { data: { user: authUser }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (authUser) {
        await fetchProfile(authUser.id);
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error logging out:', error);
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, hasRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};