// User Recipe Service — create, edit, delete user-posted recipes
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./firebase";
import { Recipe, UserRecipe } from "../types";

const USER_RECIPES_COLLECTION = "userRecipes";

// Create a new user recipe
export const createRecipe = async (
  recipe: Omit<UserRecipe, "id">,
  userId: string,
): Promise<string | null> => {
  try {
    const recipeData: Record<string, any> = {
      ...recipe,
      createdBy: userId,
      source: "user",
      isPublic: true,
      createdAt: serverTimestamp(),
    };

    // Firestore does not accept undefined values — remove them
    Object.keys(recipeData).forEach((key) => {
      if (recipeData[key] === undefined) {
        delete recipeData[key];
      }
    });

    const docRef = await addDoc(
      collection(db, USER_RECIPES_COLLECTION),
      recipeData,
    );

    // Add to user's uploadedRecipes list
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        uploadedRecipes: arrayUnion(docRef.id),
      });
    } catch (e) {
      console.warn("Could not update user uploads list:", e);
    }

    return docRef.id;
  } catch (error) {
    console.error("Error creating recipe:", error);
    return null;
  }
};

// Update an existing recipe
export const updateRecipe = async (
  recipeId: string,
  updates: Partial<UserRecipe>,
): Promise<boolean> => {
  try {
    const recipeRef = doc(db, USER_RECIPES_COLLECTION, recipeId);
    await updateDoc(recipeRef, { ...updates });
    return true;
  } catch (error) {
    console.error("Error updating recipe:", error);
    return false;
  }
};

// Delete a recipe
export const deleteUserRecipe = async (
  recipeId: string,
  userId: string,
): Promise<boolean> => {
  try {
    const recipeRef = doc(db, USER_RECIPES_COLLECTION, recipeId);
    const snap = await getDoc(recipeRef);

    if (!snap.exists() || snap.data().createdBy !== userId) {
      return false;
    }

    await deleteDoc(recipeRef);
    return true;
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return false;
  }
};

// Get all recipes by a user
export const getUserRecipes = async (userId: string): Promise<Recipe[]> => {
  try {
    const q = query(
      collection(db, USER_RECIPES_COLLECTION),
      where("createdBy", "==", userId),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      source: "user" as const,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Recipe[];
  } catch (error) {
    console.error("Error fetching user recipes:", error);
    return [];
  }
};

// Get all public user recipes (for search/browse)
export const getPublicUserRecipes = async (): Promise<Recipe[]> => {
  try {
    const q = query(
      collection(db, USER_RECIPES_COLLECTION),
      where("isPublic", "==", true),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      source: "user" as const,
    })) as Recipe[];
  } catch (error) {
    console.error("Error fetching public recipes:", error);
    return [];
  }
};

// Get a single user recipe by ID
export const getUserRecipeById = async (
  recipeId: string,
): Promise<Recipe | null> => {
  try {
    const docRef = doc(db, USER_RECIPES_COLLECTION, recipeId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) return null;

    return {
      id: snap.id,
      ...snap.data(),
      source: "user" as const,
    } as Recipe;
  } catch (error) {
    console.error("Error fetching user recipe:", error);
    return null;
  }
};
