// Review Service — comments & ratings for recipes
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  deleteDoc,
  orderBy,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Review } from "../types";

const REVIEWS_COLLECTION = "reviews";

// Add a review
export const addReview = async (
  recipeId: string,
  userId: string,
  userName: string,
  text: string,
  rating: number,
): Promise<Review | null> => {
  try {
    const review = {
      recipeId,
      userId,
      userName,
      text,
      rating: Math.min(5, Math.max(1, Math.round(rating))),
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), review);

    // Update average rating on the recipe document
    await updateAverageRating(recipeId);

    return { id: docRef.id, ...review, createdAt: new Date() } as Review;
  } catch (error) {
    console.error("Error adding review:", error);
    return null;
  }
};

// Get all reviews for a recipe
export const getReviews = async (recipeId: string): Promise<Review[]> => {
  try {
    // Query without orderBy to avoid needing a composite index
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where("recipeId", "==", recipeId),
    );
    const snapshot = await getDocs(q);

    const reviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Review[];

    // Sort client-side (newest first)
    return reviews.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
};

// Delete a review (only own)
export const deleteReview = async (
  reviewId: string,
  userId: string,
): Promise<boolean> => {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    const reviewSnap = await getDoc(reviewRef);

    if (!reviewSnap.exists() || reviewSnap.data().userId !== userId) {
      return false;
    }

    const recipeId = reviewSnap.data().recipeId;
    await deleteDoc(reviewRef);
    await updateAverageRating(recipeId);
    return true;
  } catch (error) {
    console.error("Error deleting review:", error);
    return false;
  }
};

// Compute and update average rating on recipe
const updateAverageRating = async (recipeId: string): Promise<void> => {
  try {
    const reviews = await getReviews(recipeId);
    if (reviews.length === 0) return;

    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    // Try updating in 'recipes' collection first, then 'userRecipes'
    try {
      const recipeRef = doc(db, "recipes", recipeId);
      const snap = await getDoc(recipeRef);
      if (snap.exists()) {
        await updateDoc(recipeRef, {
          averageRating: Math.round(avg * 10) / 10,
          ratingCount: reviews.length,
        });
        return;
      }
    } catch {}

    try {
      const userRecipeRef = doc(db, "userRecipes", recipeId);
      const snap = await getDoc(userRecipeRef);
      if (snap.exists()) {
        await updateDoc(userRecipeRef, {
          averageRating: Math.round(avg * 10) / 10,
          ratingCount: reviews.length,
        });
      }
    } catch {}
  } catch (error) {
    console.error("Error updating average rating:", error);
  }
};

// Get average rating for a recipe
export const getAverageRating = async (
  recipeId: string,
): Promise<{ average: number; count: number }> => {
  try {
    const reviews = await getReviews(recipeId);
    if (reviews.length === 0) return { average: 0, count: 0 };

    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return { average: Math.round(avg * 10) / 10, count: reviews.length };
  } catch {
    return { average: 0, count: 0 };
  }
};
