// Review Section — comments & ratings for recipes
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants";
import { Review } from "../types";
import { StarRating } from "./StarRating";
import { addReview, getReviews, deleteReview } from "../services/reviewService";
import { useAuth } from "../hooks/useAuth";

interface ReviewSectionProps {
  recipeId: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ recipeId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    loadReviews();
  }, [recipeId]);

  const loadReviews = async () => {
    setIsLoading(true);
    const result = await getReviews(recipeId);
    setReviews(result);
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please log in to leave a review.");
      return;
    }
    if (newRating === 0) {
      Alert.alert("Rating Required", "Please select a star rating.");
      return;
    }
    if (!newComment.trim()) {
      Alert.alert("Comment Required", "Please write a comment.");
      return;
    }

    setIsSubmitting(true);
    const review = await addReview(
      recipeId,
      user.id,
      user.displayName || "Anonymous",
      newComment.trim(),
      newRating,
    );

    if (review) {
      setReviews([review, ...reviews]);
      setNewRating(0);
      setNewComment("");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (reviewId: string) => {
    if (!user) return;

    Alert.alert("Delete Review", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const success = await deleteReview(reviewId, user.id);
          if (success) {
            setReviews(reviews.filter((r) => r.id !== reviewId));
          }
        },
      },
    ]);
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAvatar}>
          <Text style={styles.reviewAvatarText}>
            {item.userName?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>
        <View style={styles.reviewInfo}>
          <Text style={styles.reviewName}>{item.userName}</Text>
          <Text style={styles.reviewDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <StarRating rating={item.rating} size={14} />
        {user && user.id === item.userId && (
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.reviewText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Reviews & Ratings</Text>
        {reviews.length > 0 && (
          <View style={styles.avgContainer}>
            <StarRating rating={averageRating} size={16} />
            <Text style={styles.avgText}>
              {averageRating.toFixed(1)} ({reviews.length})
            </Text>
          </View>
        )}
      </View>

      {/* Write Review */}
      <View style={styles.writeReview}>
        <Text style={styles.writeTitle}>Leave a Review</Text>
        <StarRating
          rating={newRating}
          size={32}
          interactive
          onRate={setNewRating}
        />
        <TextInput
          style={styles.commentInput}
          placeholder="Share your experience with this recipe..."
          placeholderTextColor={COLORS.textLight}
          value={newComment}
          onChangeText={setNewComment}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (isSubmitting || newRating === 0) && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || newRating === 0}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Review</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
      {isLoading ? (
        <ActivityIndicator
          color={COLORS.primary}
          style={{ marginTop: SPACING.md }}
        />
      ) : reviews.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="chatbubble-outline"
            size={40}
            color={COLORS.textLight}
          />
          <Text style={styles.emptyText}>No reviews yet. Be the first!</Text>
        </View>
      ) : (
        reviews.map((review) => (
          <View key={review.id}>{renderReview({ item: review })}</View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  avgContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avgText: {
    marginLeft: SPACING.xs,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  writeReview: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  writeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 80,
    backgroundColor: COLORS.background,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
    marginTop: SPACING.md,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  reviewCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  reviewAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  reviewInfo: {
    flex: 1,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  deleteBtn: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  deleteBtnText: {
    fontSize: 16,
  },
  reviewText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: SPACING.lg,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default ReviewSection;
