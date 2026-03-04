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
  averageRating?: number;
  videoUrl?: string;
  createdBy?: string;
  createdAt?: Date;
  source?: "local" | "mealdb" | "user" | "local_dataset";
  views?: number;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  favorites: string[];
  uploadedRecipes: string[];
  reviewCount?: number;
  preferences?: string[];
  hasCompletedOnboarding?: boolean;
  createdAt: Date;
}

export interface Review {
  id: string;
  recipeId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  rating: number; // 1–5
  createdAt: Date;
}

export interface UserRecipe extends Recipe {
  createdBy: string;
  isPublic: boolean;
}

export interface OfflineRecipe extends Recipe {
  downloadedAt: Date;
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
  RecipeDetail: { recipeId: string; source?: "local" | "mealdb" | "user" };
  PostRecipe: { editRecipe?: Recipe };
  MyRecipes: undefined;
  OfflineRecipes: undefined;
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
