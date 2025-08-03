import { createContext, useContext, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Define types
export interface User {
  id: number;
  username: string;
  email: string;
  role?: 'admin' | 'user';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

// Main authentication hook
export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for current user
  const userQuery = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginData): Promise<AuthResponse> => {
      const result = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return result as AuthResponse;
    },
    onSuccess: (data: AuthResponse) => {
      if (data.success && data.user) {
        queryClient.setQueryData(['/api/auth/me'], data);
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        toast({
          title: "Login successful",
          description: `Welcome back, ${data.user.username}!`,
        });
      } else {
        throw new Error(data.message || 'Login failed');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData): Promise<AuthResponse> => {
      const result = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return result as AuthResponse;
    },
    onSuccess: (data: AuthResponse) => {
      if (data.success && data.user) {
        queryClient.setQueryData(['/api/auth/me'], data);
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        toast({
          title: "Registration successful",
          description: `Welcome, ${data.user.username}!`,
        });
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async (): Promise<AuthResponse> => {
      const result = await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
      return result as AuthResponse;
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Logout failed",
        description: error.message || "Logout failed",
        variant: "destructive",
      });
    },
  });

  return {
    user: (userQuery.data as AuthResponse)?.user || null,
    isAuthenticated: !!((userQuery.data as AuthResponse)?.user),
    isLoading: userQuery.isLoading,
    loginMutation,
    registerMutation,
    logoutMutation,
  };
}

// Create AuthContext for provider pattern
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginMutation: ReturnType<typeof useMutation>;
  registerMutation: ReturnType<typeof useMutation>;
  logoutMutation: ReturnType<typeof useMutation>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}