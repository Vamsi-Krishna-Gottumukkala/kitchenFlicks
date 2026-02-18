// Recipe service - handles fetching recipes from Firestore and TheMealDB API
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  limit,
  orderBy,
  addDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
import { Recipe } from "../types";
import { API_ENDPOINTS } from "../constants";

// Fetch recipes from Firestore
export const getRecipes = async (
  limitCount: number = 20,
): Promise<Recipe[]> => {
  try {
    const recipesRef = collection(db, "recipes");
    const q = query(recipesRef, limit(limitCount));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      source: "local" as const,
    })) as Recipe[];
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
};

// Search recipes by ingredients
export const searchRecipesByIngredients = async (
  ingredients: string[],
): Promise<Recipe[]> => {
  try {
    // Normalize ingredients to lowercase
    const normalizedIngredients = ingredients.map((i) => i.toLowerCase());

    // Fetch from Firestore - we'll filter client-side for ingredient matching
    const recipesRef = collection(db, "recipes");
    const snapshot = await getDocs(query(recipesRef, limit(100)));

    const recipes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      source: "local" as const,
    })) as Recipe[];

    // Score recipes by how many ingredients match
    const scoredRecipes = recipes.map((recipe) => {
      const recipeIngredients =
        recipe.cleanedIngredients?.map((i) => i.toLowerCase()) || [];
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
      .map((sr) => sr.recipe);
  } catch (error) {
    console.error("Error searching recipes:", error);
    return [];
  }
};

// Fetch recipe by ID
export const getRecipeById = async (
  id: string,
  source: "local" | "mealdb" = "local",
): Promise<Recipe | null> => {
  try {
    if (source === "mealdb") {
      return await getMealDBRecipeById(id);
    }

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

// TheMealDB API Integration
export const searchMealDB = async (searchTerm: string): Promise<Recipe[]> => {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.mealdb}/search.php?s=${encodeURIComponent(searchTerm)}`,
    );
    const data = await response.json();

    if (!data.meals) return [];

    return data.meals.map((meal: any) => convertMealDBToRecipe(meal));
  } catch (error) {
    console.error("Error searching MealDB:", error);
    return [];
  }
};

export const getMealDBRecipeById = async (
  id: string,
): Promise<Recipe | null> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.mealdb}/lookup.php?i=${id}`);
    const data = await response.json();

    if (!data.meals || data.meals.length === 0) return null;

    return convertMealDBToRecipe(data.meals[0]);
  } catch (error) {
    console.error("Error fetching MealDB recipe:", error);
    return null;
  }
};

export const getRandomMealDBRecipes = async (
  count: number = 10,
): Promise<Recipe[]> => {
  try {
    const recipes: Recipe[] = [];
    for (let i = 0; i < count; i++) {
      const response = await fetch(`${API_ENDPOINTS.mealdb}/random.php`);
      const data = await response.json();
      if (data.meals && data.meals.length > 0) {
        recipes.push(convertMealDBToRecipe(data.meals[0]));
      }
    }
    return recipes;
  } catch (error) {
    console.error("Error fetching random recipes:", error);
    return [];
  }
};

export const getMealDBByCategory = async (
  category: string,
): Promise<Recipe[]> => {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.mealdb}/filter.php?c=${encodeURIComponent(category)}`,
    );
    const data = await response.json();

    if (!data.meals) return [];

    // Filter endpoint returns limited data, we need to fetch full details
    return data.meals.slice(0, 10).map((meal: any) => ({
      id: meal.idMeal,
      title: meal.strMeal,
      imageUrl: meal.strMealThumb,
      ingredients: [],
      cleanedIngredients: [],
      instructions: "",
      source: "mealdb" as const,
    }));
  } catch (error) {
    console.error("Error fetching MealDB category:", error);
    return [];
  }
};

// Convert MealDB response to our Recipe type
const convertMealDBToRecipe = (meal: any): Recipe => {
  // Extract ingredients (MealDB uses strIngredient1-20)
  const ingredients: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push(`${measure?.trim() || ""} ${ingredient.trim()}`.trim());
    }
  }

  return {
    id: meal.idMeal,
    title: meal.strMeal,
    ingredients,
    cleanedIngredients: ingredients.map((i) => i.toLowerCase()),
    instructions: meal.strInstructions || "",
    imageUrl: meal.strMealThumb || "",
    imageName: meal.strMeal.toLowerCase().replace(/\s+/g, "-"),
    category: meal.strCategory,
    source: "mealdb",
  };
};

// User favorites management
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
