// Authentication provider and hook
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "../types";
import { User as FirebaseUser } from "firebase/auth";
import {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  subscribeToAuthState,
} from "../services/authService";
import { auth, db } from "../services/firebase";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfileImage: (url: string) => Promise<void>;
  updateUserPreferences: (prefs: string[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          const userData = await getCurrentUser();
          setUser(userData);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const userData = await loginUser(email, password);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const userData = await registerUser(email, password, displayName);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    const userData = await getCurrentUser();
    setUser(userData);
  };

  const updateProfileImage = async (url: string) => {
    if (!user || !auth.currentUser) return;
    try {
      await updateProfile(auth.currentUser, { photoURL: url });
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, { profileImageUrl: url });
      setUser({ ...user, photoURL: url });
    } catch (error) {
      console.error("Error updating profile image:", error);
      throw error;
    }
  };

  const updateUserPreferences = async (prefs: string[]) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        preferences: prefs,
        hasCompletedOnboarding: true,
      });
      setUser({ ...user, preferences: prefs, hasCompletedOnboarding: true });
    } catch (error) {
      console.error("Error saving preferences:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        updateProfileImage,
        updateUserPreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
