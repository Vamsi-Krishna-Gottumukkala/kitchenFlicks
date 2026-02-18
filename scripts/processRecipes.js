/**
 * Recipe Data Processing Script
 *
 * This script processes the CSV recipe dataset and uploads curated recipes to Firestore.
 *
 * Prerequisites:
 * 1. Firebase project created with Firestore enabled
 * 2. Service account key downloaded and saved as 'serviceAccountKey.json'
 * 3. Run: npm install firebase-admin csv-parse
 *
 * Usage: node scripts/processRecipes.js
 */

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
// Download your service account key from Firebase Console
// Place it in the scripts folder as 'serviceAccountKey.json'
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Configuration
const CSV_PATH = path.join(
  __dirname,
  "..",
  "..",
  "Food Ingredients and Recipe Dataset with Image Name Mapping.csv",
);
const MAX_RECIPES = 5000; // Upload 5000 curated recipes
const BATCH_SIZE = 500; // Firestore batch limit

// Clean and parse ingredients
const parseIngredients = (ingredientStr) => {
  if (!ingredientStr) return [];

  try {
    // The ingredients column might be a JSON-like string
    if (ingredientStr.startsWith("[")) {
      return JSON.parse(ingredientStr.replace(/'/g, '"'));
    }
    // Otherwise split by comma
    return ingredientStr
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);
  } catch {
    return ingredientStr
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);
  }
};

// Determine category based on ingredients
const categorizeRecipe = (title, ingredients) => {
  const titleLower = title.toLowerCase();
  const ingredientStr = ingredients.join(" ").toLowerCase();

  // Check for vegetarian (no meat)
  const meatKeywords = [
    "chicken",
    "beef",
    "pork",
    "lamb",
    "fish",
    "shrimp",
    "bacon",
    "sausage",
    "turkey",
    "meat",
    "seafood",
  ];
  const hasMeat = meatKeywords.some(
    (meat) => titleLower.includes(meat) || ingredientStr.includes(meat),
  );

  // Check for dessert
  const dessertKeywords = [
    "cake",
    "cookie",
    "brownie",
    "pudding",
    "pie",
    "ice cream",
    "chocolate",
    "sweet",
    "dessert",
  ];
  const isDessert = dessertKeywords.some((d) => titleLower.includes(d));

  // Check for breakfast
  const breakfastKeywords = [
    "pancake",
    "waffle",
    "egg",
    "bacon",
    "breakfast",
    "omelette",
    "toast",
    "smoothie",
  ];
  const isBreakfast = breakfastKeywords.some((b) => titleLower.includes(b));

  if (isDessert) return "Dessert";
  if (isBreakfast) return "Breakfast";
  if (!hasMeat) return "Vegetarian";
  return "Main Course";
};

// Process CSV and upload to Firestore
const processRecipes = async () => {
  console.log("🍳 Starting recipe processing...");
  console.log(`📂 Reading from: ${CSV_PATH}`);

  if (!fs.existsSync(CSV_PATH)) {
    console.error("❌ CSV file not found! Please check the path.");
    process.exit(1);
  }

  const recipes = [];
  const seenTitles = new Set();

  // Parse CSV
  const parser = fs.createReadStream(CSV_PATH).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
    }),
  );

  for await (const row of parser) {
    // Skip duplicates
    if (seenTitles.has(row.Title)) continue;
    seenTitles.add(row.Title);

    const ingredients = parseIngredients(row.Ingredients);
    const cleanedIngredients = parseIngredients(row.Cleaned_Ingredients);

    // Skip recipes with too few ingredients
    if (ingredients.length < 3) continue;

    // Skip recipes without instructions
    if (!row.Instructions || row.Instructions.length < 50) continue;

    const recipe = {
      title: row.Title,
      ingredients: ingredients,
      cleanedIngredients:
        cleanedIngredients.length > 0
          ? cleanedIngredients
          : ingredients.map((i) => i.toLowerCase()),
      instructions: row.Instructions,
      imageName: row.Image_Name || "",
      imageUrl: "", // Will be filled by Unsplash on-demand
      category: categorizeRecipe(row.Title, ingredients),
      source: "local",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    recipes.push(recipe);

    if (recipes.length >= MAX_RECIPES) break;
  }

  console.log(`📊 Found ${recipes.length} valid recipes`);

  // Upload in batches
  let uploaded = 0;
  for (let i = 0; i < recipes.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const batchRecipes = recipes.slice(i, i + BATCH_SIZE);

    for (const recipe of batchRecipes) {
      const docRef = db.collection("recipes").doc();
      batch.set(docRef, recipe);
    }

    await batch.commit();
    uploaded += batchRecipes.length;
    console.log(`✅ Uploaded ${uploaded}/${recipes.length} recipes`);
  }

  console.log("🎉 Done! All recipes uploaded to Firestore.");
  process.exit(0);
};

// Run the script
processRecipes().catch((error) => {
  console.error("❌ Error processing recipes:", error);
  process.exit(1);
});
