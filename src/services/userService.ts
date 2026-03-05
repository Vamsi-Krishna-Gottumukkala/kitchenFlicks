import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Track when a user views a recipe by saving its category to their view history
 */
export const trackRecipeView = async (
  userId: string,
  category?: string,
): Promise<void> => {
  if (!category || !userId) return;

  try {
    const userRef = doc(db, "users", userId);

    // We only want to keep a recent history, but for simplicity we'll just append it.
    // If we wanted to cap it, we'd need to fetch first, append, slice, and update.
    // Let's do that so the array doesn't grow infinitely large.
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      let history = data.viewHistory || [];

      // Add new category to the end
      history.push(category);

      // Keep only the last 50 views
      if (history.length > 50) {
        history = history.slice(history.length - 50);
      }

      await updateDoc(userRef, {
        viewHistory: history,
      });
    }
  } catch (error) {
    console.warn("Failed to track recipe view:", error);
  }
};
