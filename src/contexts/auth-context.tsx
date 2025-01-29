import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEel } from "@/hooks/use-eel";

export interface User {
  username: string;
  email: string;
  avatar: string;
  session_token?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { eel } = useEel();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) as User;
          if (parsedUser.session_token) {
            // Validate the session token
            const validUser = await eel.validate_session(
              parsedUser.session_token,
            )();
            if (validUser) {
              // Make sure to include the session_token in the user object
              setUser({
                ...validUser,
                session_token: parsedUser.session_token,
              });
              setIsAuthenticated(true);
              console.log("User is authenticated");
              setIsLoading(false);
              return;
            }
          }
          console.log("Invalid session token");
          // If we get here, the session is invalid
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [eel]);

  const login = async (email: string, password: string) => {
    try {
      const user = await eel.login(email, password)();
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      toast.success("Successfully logged in");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "Login failed");
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (user?.session_token) {
        await eel.logout(user.session_token)();
      }
    } finally {
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, isLoading }}
    >
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
