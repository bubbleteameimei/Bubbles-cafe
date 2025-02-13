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
    isLoading: authLoading,
    isFetching
  } = useQuery<User | null>({
    queryKey: ["/api/admin/user"],
    queryFn: async () => {
      try {
        console.log("Fetching user data...");
        const response = await apiRequest("GET", "/api/admin/user");

        if (response.status === 401) {
          console.log("User not authenticated");
          return null;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        console.log("User data fetched:", data);
        return data;
      } catch (error) {
        console.error("Auth error:", error);
        // Don't throw the error, just return null for unauthenticated state
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 4 * 60 * 1000
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      console.log("Attempting login...");
      try {
        const response = await apiRequest("POST", "/api/admin/login", credentials);
        const data = await response.json();
        console.log("Login successful:", data);
        return data;
      } catch (error: any) {
        console.error("Login error:", error);
        // Throw a user-friendly error message
        throw new Error(error.message || "Failed to log in. Please try again.");
      }
    },
    onSuccess: (data: User) => {
      console.log("Login mutation succeeded");
      queryClient.setQueryData(["/api/admin/user"], data);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      navigate("/admin");
    },
    onError: (error: Error) => {
      console.error("Login mutation failed:", error);
      toast({
        title: "Login failed",
        description: error.message || "Failed to log in",
        variant: "destructive"
      });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log("Attempting logout...");
      try {
        const response = await apiRequest("POST", "/api/admin/logout");
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Logout failed");
        }
        console.log("Logout successful");
      } catch (error: any) {
        console.error("Logout error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Logout mutation succeeded");
      queryClient.setQueryData(["/api/admin/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user"] });
      toast({
        title: "Logged out",
        description: "Come back soon!",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      console.error("Logout mutation failed:", error);
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
      isLoading: isFetching,
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