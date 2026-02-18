// Unsplash API service for fetching recipe images
import { API_KEYS, API_ENDPOINTS } from "../constants";

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  user: {
    name: string;
    username: string;
  };
}

// Cache to avoid repeated API calls for the same query
const imageCache: Map<string, string> = new Map();

/**
 * Search Unsplash for food images based on recipe title
 * Falls back to generic food image if no results
 */
export const getRecipeImage = async (recipeName: string): Promise<string> => {
  // Check cache first
  const cacheKey = recipeName.toLowerCase();
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  // If no API key, return placeholder
  if (!API_KEYS.unsplash || API_KEYS.unsplash === "YOUR_UNSPLASH_ACCESS_KEY") {
    return getPlaceholderImage(recipeName);
  }

  try {
    const searchQuery = `${recipeName} food dish`;
    const response = await fetch(
      `${API_ENDPOINTS.unsplash}/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${API_KEYS.unsplash}`,
        },
      },
    );

    if (!response.ok) {
      console.warn("Unsplash API error:", response.status);
      return getPlaceholderImage(recipeName);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const imageUrl = data.results[0].urls.regular;
      imageCache.set(cacheKey, imageUrl);
      return imageUrl;
    }

    return getPlaceholderImage(recipeName);
  } catch (error) {
    console.error("Error fetching Unsplash image:", error);
    return getPlaceholderImage(recipeName);
  }
};

/**
 * Get a placeholder image from a free service
 * Uses Lorem Picsum with a food-like seed based on recipe name
 */
export const getPlaceholderImage = (recipeName: string): string => {
  // Create a consistent hash from the recipe name for deterministic images
  const hash = recipeName.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const seed = Math.abs(hash);

  // Use picsum.photos with seed for consistent random images
  return `https://picsum.photos/seed/${seed}/400/300`;
};

/**
 * Get multiple recipe images in batch
 * Useful for loading home screen
 */
export const getRecipeImages = async (
  recipeNames: string[],
): Promise<Map<string, string>> => {
  const results = new Map<string, string>();

  // Process in batches of 5 to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < recipeNames.length; i += batchSize) {
    const batch = recipeNames.slice(i, i + batchSize);
    const promises = batch.map(async (name) => {
      const imageUrl = await getRecipeImage(name);
      results.set(name, imageUrl);
    });
    await Promise.all(promises);

    // Small delay between batches to respect rate limits
    if (i + batchSize < recipeNames.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
};

/**
 * Clear the image cache
 */
export const clearImageCache = (): void => {
  imageCache.clear();
};
