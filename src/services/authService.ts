// Authentication service - handles user login, registration, and session
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { User } from "../types";

/**
 * Register a new user with email and password
 */
export const registerUser = async (
  email: string,
  password: string,
  displayName: string,
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const firebaseUser = userCredential.user;

    // Update display name in Firebase Auth
    await updateProfile(firebaseUser, { displayName });

    // Create user document in Firestore
    const userData: Omit<User, "id"> = {
      email: firebaseUser.email || email,
      displayName,
      favorites: [],
      uploadedRecipes: [],
      preferences: [],
      viewHistory: [],
      onboardingCompleted: false,
      createdAt: new Date(),
    };

    await setDoc(doc(db, "users", firebaseUser.uid), userData);

    return {
      id: firebaseUser.uid,
      ...userData,
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Sign in with email and password
 */
export const loginUser = async (
  email: string,
  password: string,
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const firebaseUser = userCredential.user;

    // Fetch user data from Firestore
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

    if (userDoc.exists()) {
      return {
        id: firebaseUser.uid,
        ...userDoc.data(),
      } as User;
    }

    // If no Firestore doc exists, create a basic one
    const userData: Omit<User, "id"> = {
      email: firebaseUser.email || email,
      displayName: firebaseUser.displayName || email.split("@")[0],
      favorites: [],
      uploadedRecipes: [],
      preferences: [],
      viewHistory: [],
      onboardingCompleted: false,
      createdAt: new Date(),
    };

    await setDoc(doc(db, "users", firebaseUser.uid), userData);

    return {
      id: firebaseUser.uid,
      ...userData,
    };
  } catch (error: any) {
    console.error("Login error:", error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Sign out the current user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Failed to sign out. Please try again.");
  }
};

/**
 * Get the current user from Firestore
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser;

  if (!firebaseUser) return null;

  try {
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

    if (userDoc.exists()) {
      return {
        id: firebaseUser.uid,
        ...userDoc.data(),
      } as User;
    }

    return null;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

/**
 * Mark onboarding as complete and save preferences
 */
export const completeOnboarding = async (
  userId: string,
  preferences: string[],
): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      preferences,
      onboardingCompleted: true,
    });
  } catch (error) {
    console.error("Error saving onboarding preferences:", error);
    throw new Error("Failed to save preferences. Please try again.");
  }
};

/**
 * Subscribe to auth state changes
 */
export const subscribeToAuthState = (
  callback: (user: FirebaseUser | null) => void,
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Convert Firebase auth error codes to user-friendly messages
 */
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please try logging in.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/user-not-found":
      return "No account found with this email. Please register.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    default:
      return "An error occurred. Please try again.";
  }
};
