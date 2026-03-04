// Offline Service — download recipes for offline use via AsyncStorage
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Recipe, OfflineRecipe } from "../types";

const OFFLINE_KEY_PREFIX = "@offline_recipe_";
const OFFLINE_INDEX_KEY = "@offline_recipe_ids";

// Download a recipe for offline use
export const downloadRecipe = async (recipe: Recipe): Promise<boolean> => {
  try {
    const offlineRecipe: OfflineRecipe = {
      ...recipe,
      downloadedAt: new Date(),
    };

    // Save recipe data
    await AsyncStorage.setItem(
      `${OFFLINE_KEY_PREFIX}${recipe.id}`,
      JSON.stringify(offlineRecipe),
    );

    // Update index
    const existingIds = await getOfflineIds();
    if (!existingIds.includes(recipe.id)) {
      existingIds.push(recipe.id);
      await AsyncStorage.setItem(
        OFFLINE_INDEX_KEY,
        JSON.stringify(existingIds),
      );
    }

    return true;
  } catch (error) {
    console.error("Error downloading recipe:", error);
    return false;
  }
};

// Get all offline recipes
export const getOfflineRecipes = async (): Promise<OfflineRecipe[]> => {
  try {
    const ids = await getOfflineIds();
    const recipes: OfflineRecipe[] = [];

    for (const id of ids) {
      const data = await AsyncStorage.getItem(`${OFFLINE_KEY_PREFIX}${id}`);
      if (data) {
        const parsed = JSON.parse(data);
        parsed.downloadedAt = new Date(parsed.downloadedAt);
        recipes.push(parsed);
      }
    }

    // Sort by download date (newest first)
    return recipes.sort(
      (a, b) => b.downloadedAt.getTime() - a.downloadedAt.getTime(),
    );
  } catch (error) {
    console.error("Error fetching offline recipes:", error);
    return [];
  }
};

// Remove a recipe from offline storage
export const removeOfflineRecipe = async (
  recipeId: string,
): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(`${OFFLINE_KEY_PREFIX}${recipeId}`);

    const ids = await getOfflineIds();
    const updated = ids.filter((id) => id !== recipeId);
    await AsyncStorage.setItem(OFFLINE_INDEX_KEY, JSON.stringify(updated));

    return true;
  } catch (error) {
    console.error("Error removing offline recipe:", error);
    return false;
  }
};

// Check if a recipe is downloaded
export const isRecipeDownloaded = async (
  recipeId: string,
): Promise<boolean> => {
  try {
    const data = await AsyncStorage.getItem(`${OFFLINE_KEY_PREFIX}${recipeId}`);
    return data !== null;
  } catch {
    return false;
  }
};

// Get count of offline recipes
export const getOfflineCount = async (): Promise<number> => {
  const ids = await getOfflineIds();
  return ids.length;
};

// Helper to get stored IDs
const getOfflineIds = async (): Promise<string[]> => {
  try {
    const data = await AsyncStorage.getItem(OFFLINE_INDEX_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};
