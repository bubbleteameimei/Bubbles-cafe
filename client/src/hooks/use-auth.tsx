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

  const { 
    data: user, 
    error, 
    isLoading: authLoading 
  } = useQuery<User | null>({
    queryKey: ["/api/admin/user"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/user");

        if (response.status === 401) {
          return null;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        return data;
      } catch (error) {
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      try {
        const response = await apiRequest("POST", "/api/admin/login", credentials);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Login failed");
        }

        const data = await response.json();
        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data: User) => {
      queryClient.setQueryData(["/api/admin/user"], data);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      navigate("/admin");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Failed to log in",
        variant: "destructive"
      });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/logout");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Logout failed");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/admin/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user"] });
      toast({
        title: "Logged out",
        description: "Come back soon!",
      });
      navigate("/");
    },
    onError: (error: Error) => {
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