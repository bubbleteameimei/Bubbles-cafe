import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { useLocation } from "wouter";

interface User {
  id: number;
  email: string;
  isAdmin: boolean;
  username?: string;
}

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  authLoading: boolean;
  error: Error | null;
  loginMutation: any;
  logoutMutation: any;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Query for checking authentication status
  const { data: user, error, isLoading: authLoading } = useQuery<User | null>({
    queryKey: ["/api/admin/user"],
    queryFn: async () => {
      try {
        console.log('[Auth] Fetching user data...');
        const response = await apiRequest("GET", "/api/admin/user");

        if (response.status === 401) {
          console.log('[Auth] User not authenticated');
          return null;
        }

        if (!response.ok) {
          console.error('[Auth] Failed to fetch user:', response.statusText);
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        console.log('[Auth] User data fetched successfully:', data);
        return data;
      } catch (error) {
        console.error('[Auth] Error fetching user data:', error);
        return null;
      }
    },
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    staleTime: 4 * 60 * 1000, // Consider data stale after 4 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      try {
        console.log('[Auth] Attempting login...');
        const response = await apiRequest("POST", "/api/admin/login", credentials);

        if (!response.ok) {
          const error = await response.json();
          console.error('[Auth] Login failed:', error);
          throw new Error(error.message || "Login failed");
        }

        const data = await response.json();
        console.log('[Auth] Login successful:', data);
        return data;
      } catch (error) {
        console.error('[Auth] Login error:', error);
        throw error;
      }
    },
    onSuccess: (data: User) => {
      console.log('[Auth] Updating user data after login');
      queryClient.setQueryData(["/api/admin/user"], data);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user"] });
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      navigate("/admin");
    },
    onError: (error: Error) => {
      console.error('[Auth] Login mutation error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Failed to log in",
        variant: "destructive"
      });
    }
  });

  // Logout mutation with improved error handling
  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log('[Auth] Attempting logout...');
      const response = await apiRequest("POST", "/api/admin/logout");
      if (!response.ok) {
        const error = await response.json();
        console.error('[Auth] Logout failed:', error);
        throw new Error(error.message || "Logout failed");
      }
      console.log('[Auth] Logout successful');
    },
    onSuccess: () => {
      console.log('[Auth] Clearing user data after logout');
      queryClient.setQueryData(["/api/admin/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user"] });
      toast({
        title: "Logged out",
        description: "Come back soon!",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      console.error('[Auth] Logout mutation error:', error);
      toast({
        title: "Logout failed",
        description: error.message || "Failed to log out",
        variant: "destructive"
      });
    }
  });

  return (
    <AuthContext.Provider value={{
      user: user ?? null,
      isLoading: authLoading,
      authLoading,
      error,
      loginMutation,
      logoutMutation
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}