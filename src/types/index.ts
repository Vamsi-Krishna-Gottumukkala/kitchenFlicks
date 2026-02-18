// Type definitions for KitchenFlicks app

export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  cleanedIngredients: string[];
  instructions: string;
  imageUrl: string;
  imageName: string;
  category?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  ratings?: number;
  ratingCount?: number;
  createdAt?: Date;
  source?: "local" | "mealdb";
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  favorites: string[];
  uploadedRecipes: string[];
  createdAt: Date;
}

export interface Comment {
  id: string;
  recipeId: string;
  userId: string;
  userName: string;
  text: string;
  rating: number;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface IngredientCategory {
  name: string;
  icon: string;
  ingredients: string[];
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  RecipeDetail: { recipeId: string; source?: "local" | "mealdb" };
  UploadRecipe: undefined;
  Search: { ingredients?: string[] };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Pantry: undefined;
  Favorites: undefined;
  Profile: undefined;
};
