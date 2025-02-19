import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEel } from "@/hooks/use-eel";
import { UserData } from "@/types/UserData.schema";

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { eel } = useEel();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) as UserData;
          if (parsedUser.sessionToken) {
            // Validate the session token
            const validUser = await eel.validate_session(
              parsedUser.sessionToken,
            )();
            console.log("Valid user:", validUser);
            if (validUser) {
              // Make sure to include the session_token in the user object
              setUser({
                ...validUser,
                sessionToken: parsedUser.sessionToken,
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

  const login = async (username: string, password: string) => {
    try {
      const user = await eel.login(username, password)();
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      toast.success("登录成功");
      if (user.is_admin) {
        navigate("/admin/dashboard"); // 管理员界面
      } else {
        navigate("/dashboard");// 普通用户界面
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "登录失败");
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (user?.sessionToken) {
        await eel.logout(user.sessionToken)();
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
