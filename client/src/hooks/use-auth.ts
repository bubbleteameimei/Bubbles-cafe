import React, { createContext, useContext, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: number;
  email: string;
  username: string;
  displayName?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  rememberMe?: boolean;
}

export const useAuth = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check current user
  const userQuery = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      const response = await apiRequest('/api/auth/me');
      return response as AuthResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginData): Promise<AuthResponse> => {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response as AuthResponse;
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        toast({
          title: "Success",
          description: "Successfully signed in!",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Login failed",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData): Promise<AuthResponse> => {
      const response = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response as AuthResponse;
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        toast({
          title: "Success",
          description: "Account created successfully!",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Registration failed",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data
      toast({
        title: "Success",
        description: "Successfully signed out!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
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
};

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