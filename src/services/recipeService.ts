// Recipe service - handles fetching recipes from Firestore and local dataset
import {
  collection,
  query,
  getDocs,
  getDoc,
  doc,
  limit,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./firebase";
import { Recipe } from "../types";
import { getRecipeImage, getPlaceholderImage } from "./unsplashService";

// Import the processed dataset
// In a real production app, this might be loaded lazily or stored in an SQLite DB
// For this robust prototype, we bundle the 5000 optimized items directly.
import localRecipesData from "../../assets/recipes.json";
const localRecipes = localRecipesData as Recipe[];

// Utility to ensure recipes have images
const ensureRecipeImage = (recipe: Recipe): Recipe => {
  if (!recipe.imageUrl || recipe.imageUrl === "") {
    // Start async fetch in background, provide placeholder immediately
    getRecipeImage(recipe.title).then((url) => {
      // This won't update the current render synchronously, but populates cache
      // and might trigger subsequent re-renders if state is managed carefully
      recipe.imageUrl = url;
    });
    return { ...recipe, imageUrl: getPlaceholderImage(recipe.title) };
  }
  return recipe;
};

// --- DATASET QUERIES ---

// Fetch recommended recipes (Home screen feed)
export const getRecipes = async (
  limitCount: number = 20,
  userPreferences?: string[],
): Promise<Recipe[]> => {
  try {
    if (!userPreferences || userPreferences.length === 0) {
      // Fallback: Shuffle and pick limitCount recipes if no preferences
      const shuffled = [...localRecipes].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, limitCount).map(ensureRecipeImage);
    }

    // Recommendation Engine: Score recipes based on preference overlap
    const normalizedPrefs = userPreferences.map((p) => p.toLowerCase());

    // Weight parameters
    const PREF_MATCH_WEIGHT = 10;
    const TITLE_MATCH_WEIGHT = 5;

    const scoredRecipes = localRecipes.map((recipe) => {
      let score = 0;

      // Check recipe title
      const titleLower = recipe.title.toLowerCase();
      normalizedPrefs.forEach((pref) => {
        if (titleLower.includes(pref)) {
          score += TITLE_MATCH_WEIGHT;
        }
      });

      // Check ingredients
      const recipeIngredients = recipe.cleanedIngredients || [];
      normalizedPrefs.forEach((pref) => {
        if (recipeIngredients.some((ri) => ri.includes(pref))) {
          score += PREF_MATCH_WEIGHT;
        }
      });

      // Check category
      if (
        recipe.category &&
        normalizedPrefs.includes(recipe.category.toLowerCase())
      ) {
        score += TITLE_MATCH_WEIGHT;
      }

      // Add a tiny bit of randomness to break ties and keep feed fresh
      score += Math.random() * 2;

      return { recipe, score };
    });

    // Filter out recipes with very low scores to ensure relevance, then sort
    const recommended = scoredRecipes
      .filter((sr) => sr.score > 2)
      .sort((a, b) => b.score - a.score)
      .slice(0, limitCount)
      .map((sr) => ensureRecipeImage(sr.recipe));

    // If perfectly matching recipes are too few, pad with random popular ones
    if (recommended.length < limitCount) {
      const needed = limitCount - recommended.length;
      const fallbacks = [...localRecipes]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .filter((r) => !recommended.find((rec) => rec.id === r.id))
        .slice(0, needed)
        .map(ensureRecipeImage);
      return [...recommended, ...fallbacks];
    }

    return recommended;
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
};

// Get most popular/trending recipes (highest views)
export const getTrendingRecipes = async (
  limitCount: number = 20,
): Promise<Recipe[]> => {
  try {
    const sorted = [...localRecipes].sort(
      (a, b) => (b.views || 0) - (a.views || 0),
    );
    return sorted.slice(0, limitCount).map(ensureRecipeImage);
  } catch (error) {
    console.error("Error fetching trending recipes:", error);
    return [];
  }
};

// Search recipes by exact name matching
export const searchRecipesByName = async (
  searchTerm: string,
): Promise<Recipe[]> => {
  try {
    const term = searchTerm.toLowerCase();
    const results = localRecipes.filter((r) =>
      r.title.toLowerCase().includes(term),
    );
    // Sort by shortest titles first (most exact matches)
    return results
      .sort((a, b) => a.title.length - b.title.length)
      .slice(0, 30) // Limit to 30 for performance
      .map(ensureRecipeImage);
  } catch (error) {
    console.error("Error searching recipes by name:", error);
    return [];
  }
};

// Search recipes by ingredients (Pantry feature)
export const searchRecipesByIngredients = async (
  ingredients: string[],
): Promise<Recipe[]> => {
  try {
    const normalizedIngredients = ingredients.map((i) => i.toLowerCase());

    // Score recipes by how many ingredients match
    const scoredRecipes = localRecipes.map((recipe) => {
      const recipeIngredients = recipe.cleanedIngredients || [];
      const matchCount = normalizedIngredients.filter((ing) =>
        recipeIngredients.some((ri) => ri.includes(ing)),
      ).length;
      return {
        recipe,
        matchCount,
        matchPercentage: matchCount / normalizedIngredients.length,
      };
    });

    // Filter and sort by match count
    return scoredRecipes
      .filter((sr) => sr.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount)
      .slice(0, 50)
      .map((sr) => ensureRecipeImage(sr.recipe));
  } catch (error) {
    console.error("Error searching recipes:", error);
    return [];
  }
};

// Fetch recipe by ID
export const getRecipeById = async (
  id: string,
  source: "local" | "local_dataset" = "local",
): Promise<Recipe | null> => {
  try {
    if (source === "local_dataset") {
      const recipe = localRecipes.find((r) => r.id === id);
      return recipe ? ensureRecipeImage(recipe) : null;
    }

    // User-posted recipes are still in Firestore under 'recipes'
    const docRef = doc(db, "recipes", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data(), source: "local" } as Recipe;
    }
    return null;
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return null;
  }
};

// Category filter — matches by keyword in title or ingredients
// This works because the dataset doesn't store categories, so we match by content
export const getRecipesByCategory = async (
  category: string,
  limitCount: number = 20,
): Promise<Recipe[]> => {
  try {
    if (category === "all") {
      const shuffled = [...localRecipes].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, limitCount).map(ensureRecipeImage);
    }

    const term = category.toLowerCase();

    // "vegetarian" — special case: exclude common meat keywords
    if (term === "vegetarian") {
      const meatKeywords = [
        "chicken",
        "beef",
        "pork",
        "lamb",
        "shrimp",
        "salmon",
        "tuna",
        "bacon",
        "turkey",
      ];
      const vegRecipes = localRecipes.filter((r) => {
        const fullText = (
          r.title +
          " " +
          r.cleanedIngredients.join(" ")
        ).toLowerCase();
        return !meatKeywords.some((m) => fullText.includes(m));
      });
      return vegRecipes.slice(0, limitCount).map(ensureRecipeImage);
    }

    // General: match category keyword against title and ingredients
    const results = localRecipes.filter((r) => {
      const titleMatch = r.title.toLowerCase().includes(term);
      const ingMatch = r.cleanedIngredients.some((i) => i.includes(term));
      return titleMatch || ingMatch;
    });

    // Sort: title matches first
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(term) ? 0 : 1;
      const bTitle = b.title.toLowerCase().includes(term) ? 0 : 1;
      return aTitle - bTitle;
    });

    return results.slice(0, limitCount).map(ensureRecipeImage);
  } catch (error) {
    console.error("Error fetching category:", error);
    return [];
  }
};

// --- USER FAVORITES ---

export const addToFavorites = async (
  userId: string,
  recipeId: string,
): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      favorites: arrayUnion(recipeId),
    });
  } catch (error) {
    console.error("Error adding to favorites:", error);
  }
};

export const removeFromFavorites = async (
  userId: string,
  recipeId: string,
): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      favorites: arrayRemove(recipeId),
    });
  } catch (error) {
    console.error("Error removing from favorites:", error);
  }
};
