// App constants and configuration
import { UNSPLASH_ACCESS_KEY, GEMINI_API_KEY } from "@env";

export const COLORS = {
  primary: "#FF6B35", // Vibrant orange
  primaryDark: "#E55A2B",
  secondary: "#2EC4B6", // Teal accent
  background: "#FAFAFA",
  card: "#FFFFFF",
  text: "#1A1A1A",
  textSecondary: "#666666",
  textLight: "#999999",
  border: "#E0E0E0",
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#F44336",
  overlay: "rgba(0,0,0,0.5)",
  gradient: ["#FF6B35", "#FF8E53"],
};

export const FONTS = {
  regular: "System",
  medium: "System",
  bold: "System",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

// API Keys loaded from .env
export const API_KEYS = {
  unsplash: UNSPLASH_ACCESS_KEY || "",
  gemini: GEMINI_API_KEY || "",
};

// API Endpoints
export const API_ENDPOINTS = {
  mealdb: "https://www.themealdb.com/api/json/v1/1",
  unsplash: "https://api.unsplash.com",
  gemini:
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
};

// Common ingredients for the Pantry feature
export const INGREDIENT_CATEGORIES = [
  {
    name: "Proteins",
    icon: "nutrition-outline",
    ingredients: [
      "Chicken",
      "Beef",
      "Pork",
      "Fish",
      "Shrimp",
      "Eggs",
      "Tofu",
      "Lamb",
    ],
  },
  {
    name: "Vegetables",
    icon: "leaf-outline",
    ingredients: [
      "Onion",
      "Tomato",
      "Potato",
      "Carrot",
      "Garlic",
      "Spinach",
      "Bell Pepper",
      "Broccoli",
      "Mushroom",
      "Cabbage",
    ],
  },
  {
    name: "Dairy",
    icon: "water-outline",
    ingredients: ["Milk", "Cheese", "Butter", "Cream", "Yogurt", "Sour Cream"],
  },
  {
    name: "Grains",
    icon: "grid-outline",
    ingredients: [
      "Rice",
      "Pasta",
      "Bread",
      "Flour",
      "Oats",
      "Quinoa",
      "Noodles",
    ],
  },
  {
    name: "Spices",
    icon: "flame-outline",
    ingredients: [
      "Salt",
      "Pepper",
      "Cumin",
      "Paprika",
      "Turmeric",
      "Cinnamon",
      "Oregano",
      "Basil",
      "Chili",
    ],
  },
  {
    name: "Pantry",
    icon: "basket-outline",
    ingredients: [
      "Olive Oil",
      "Soy Sauce",
      "Vinegar",
      "Sugar",
      "Honey",
      "Coconut Milk",
      "Beans",
      "Lentils",
    ],
  },
];

// Recipe categories for filtering
export const RECIPE_CATEGORIES = [
  { id: "all", name: "All", icon: "restaurant-outline" },
  { id: "breakfast", name: "Breakfast", icon: "cafe-outline" },
  { id: "veg", name: "Vegetarian", icon: "leaf-outline" },
  { id: "nonveg", name: "Non-Veg", icon: "nutrition-outline" },
  { id: "vegan", name: "Vegan", icon: "leaf" },
  { id: "seafood", name: "Seafood", icon: "fish-outline" },
  { id: "dairy", name: "Dairy/Milk", icon: "water-outline" },
  { id: "dessert", name: "Desserts", icon: "ice-cream-outline" },
  { id: "beverage", name: "Beverages", icon: "wine-outline" },
  { id: "snack", name: "Snacks", icon: "fast-food-outline" },
  { id: "indian", name: "Indian", icon: "flame-outline" },
  { id: "chinese", name: "Chinese", icon: "restaurant-outline" },
  { id: "italian", name: "Italian", icon: "pizza-outline" },
  { id: "mexican", name: "Mexican", icon: "flame" },
  { id: "quick", name: "Under 30 Min", icon: "timer-outline" },
];
