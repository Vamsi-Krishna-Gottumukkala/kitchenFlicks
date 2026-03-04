// Image service — images are now pre-assigned in recipes.json at build time.
// This file provides a simple fallback for user-posted recipes that have no image.

const imageCache: Map<string, string> = new Map();

// Pool of generic high-quality food photos from Unsplash CDN (no API key needed)
const FALLBACK_FOOD_PHOTOS = [
  "1546069901-5ec6a79120b0",
  "1504674900247-0877df9cc836",
  "1512621776951-a57141f2eefd",
  "1498837167922-ddd27525d352",
  "1467003909585-2f8a72700288",
  "1529042410759-befb1204b468",
  "1476224203421-74ec76854f64",
  "1563379091339-03b21ab4a4f8",
  "1547592180-85f173990554",
  "1533089860892-a7c6f3a1d9e3",
  "1525351484163-7529414344d8",
  "1484723091739-30a097e8f929",
];

/**
 * Returns a food photo URL for a recipe using the recipe title as a hash seed.
 * This is used ONLY as a fallback for user-posted recipes that have no imageUrl.
 * All local dataset recipes already have imageUrl pre-assigned in recipes.json.
 */
export const getRecipeImage = async (recipeName: string): Promise<string> => {
  const key = recipeName.toLowerCase().trim();
  if (imageCache.has(key)) return imageCache.get(key)!;
  const url = getPlaceholderImage(recipeName);
  imageCache.set(key, url);
  return url;
};

export const getPlaceholderImage = (recipeName: string): string => {
  const hash = recipeName
    .split("")
    .reduce((a, c) => c.charCodeAt(0) + ((a << 5) - a), 0);
  const idx = Math.abs(hash) % FALLBACK_FOOD_PHOTOS.length;
  return `https://images.unsplash.com/photo-${FALLBACK_FOOD_PHOTOS[idx]}?w=600&q=80`;
};

export const getRecipeImages = async (
  recipeNames: string[],
): Promise<Map<string, string>> => {
  const results = new Map<string, string>();
  for (const name of recipeNames) {
    results.set(name, getPlaceholderImage(name));
  }
  return results;
};

export const clearImageCache = (): void => {
  imageCache.clear();
};
