// Image service - uses free Unsplash Source CDN (no API key required)
// Docs: https://source.unsplash.com/ (deprecated but still works)
// Fallback: picsum.photos for guaranteed uptime

const imageCache: Map<string, string> = new Map();

// Slug-friendly keywords for common recipe terms
const normalizeQuery = (recipeName: string): string => {
  return recipeName
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 4) // Keep only first 4 words for tighter matches
    .join(",");
};

/**
 * Get a recipe image URL using the free Picsum Photos service as primary,
 * with a deterministic seed based on the recipe name (no API key needed).
 */
export const getRecipeImage = async (recipeName: string): Promise<string> => {
  const cacheKey = recipeName.toLowerCase();
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  const url = getPlaceholderImage(recipeName);
  imageCache.set(cacheKey, url);
  return url;
};

/**
 * Deterministic image from picsum.photos — always returns an image, no API key.
 */
export const getPlaceholderImage = (recipeName: string): string => {
  const hash = recipeName.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const seed = Math.abs(hash) % 1000;
  // Use a consistent food-looking picsum image
  return `https://picsum.photos/seed/${seed}/600/400`;
};

/**
 * Batch-fetch images (now instant since we use deterministic placeholder)
 */
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
