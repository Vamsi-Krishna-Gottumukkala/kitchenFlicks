// Reusable Star Rating Component
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { COLORS, SPACING } from "../constants";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  showLabel?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 24,
  interactive = false,
  onRate,
  showLabel = false,
}) => {
  const renderStar = (index: number) => {
    const filled = index < Math.floor(rating);
    const half = !filled && index < rating && rating - index >= 0.5;
    const starChar = filled ? "★" : half ? "★" : "☆";
    const color = filled || half ? "#FFB800" : "#D1D5DB";

    const star = (
      <Text
        key={index}
        style={[
          styles.star,
          { fontSize: size, color, opacity: half ? 0.6 : 1 },
        ]}
      >
        {starChar}
      </Text>
    );

    if (interactive && onRate) {
      return (
        <TouchableOpacity
          key={index}
          onPress={() => onRate(index + 1)}
          activeOpacity={0.7}
        >
          {star}
        </TouchableOpacity>
      );
    }

    return star;
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsRow}>
        {Array.from({ length: maxStars }, (_, i) => renderStar(i))}
      </View>
      {showLabel && (
        <Text style={styles.label}>
          {rating > 0 ? rating.toFixed(1) : "No ratings"}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsRow: {
    flexDirection: "row",
  },
  star: {
    marginHorizontal: 1,
  },
  label: {
    marginLeft: SPACING.sm,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
});

export default StarRating;
