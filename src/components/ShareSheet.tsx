// Share Sheet — enhanced sharing for recipes
import { Share, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Recipe } from "../types";

// Generate shareable recipe text
const generateShareText = (recipe: Recipe): string => {
  const ingredientList = recipe.ingredients
    .slice(0, 10)
    .map((i) => `• ${i}`)
    .join("\n");

  const moreIngredients =
    recipe.ingredients.length > 10
      ? `\n...and ${recipe.ingredients.length - 10} more`
      : "";

  return `🍳 ${recipe.title}

📋 Ingredients:
${ingredientList}${moreIngredients}

📝 Instructions:
${recipe.instructions.slice(0, 300)}${recipe.instructions.length > 300 ? "..." : ""}

📱 Shared from KitchenFlicks — Smart Pantry-to-Plate App`;
};

// Share recipe via native share sheet
export const shareRecipe = async (recipe: Recipe): Promise<void> => {
  try {
    const message = generateShareText(recipe);

    await Share.share({
      message,
      title: `Check out this recipe: ${recipe.title}`,
    });
  } catch (error: any) {
    if (error?.message !== "User did not share") {
      Alert.alert("Error", "Could not share this recipe");
    }
  }
};

// Copy recipe to clipboard
export const copyRecipeToClipboard = async (recipe: Recipe): Promise<void> => {
  try {
    const text = generateShareText(recipe);
    // expo-clipboard may not be installed; fall back to simpler approach
    if (Clipboard && Clipboard.setStringAsync) {
      await Clipboard.setStringAsync(text);
    }
    Alert.alert("Copied!", "Recipe copied to clipboard 📋");
  } catch {
    // Fallback: use Share API
    await shareRecipe(recipe);
  }
};

// Share recipe as ingredients list (for grocery shopping)
export const shareIngredientsList = async (recipe: Recipe): Promise<void> => {
  try {
    const ingredientList = recipe.ingredients.map((i) => `☐ ${i}`).join("\n");

    const message = `🛒 Shopping List for: ${recipe.title}\n\n${ingredientList}\n\n📱 From KitchenFlicks`;

    await Share.share({
      message,
      title: `Shopping list: ${recipe.title}`,
    });
  } catch (error: any) {
    if (error?.message !== "User did not share") {
      Alert.alert("Error", "Could not share the ingredients list");
    }
  }
};
