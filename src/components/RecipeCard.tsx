// Recipe card component for displaying recipe previews
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Recipe } from "../types";
import { COLORS, BORDER_RADIUS, SPACING } from "../constants";
import { getPlaceholderImage } from "../services/unsplashService";

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  variant?: "default" | "compact" | "featured";
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - SPACING.md * 3) / 2;

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onPress,
  variant = "default",
}) => {
  const [imageError, setImageError] = useState(false);

  const imageUrl =
    imageError || !recipe.imageUrl
      ? getPlaceholderImage(recipe.title)
      : recipe.imageUrl;

  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isFeatured && styles.featuredContainer,
        isCompact && styles.compactContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.image,
          isFeatured && styles.featuredImage,
          isCompact && styles.compactImage,
        ]}
        onError={() => setImageError(true)}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      <View style={[styles.content, isFeatured && styles.featuredContent]}>
        <Text
          style={[
            styles.title,
            isFeatured && styles.featuredTitle,
            isCompact && styles.compactTitle,
          ]}
          numberOfLines={2}
        >
          {recipe.title}
        </Text>

        {!isCompact && (
          <View style={styles.metaContainer}>
            {recipe.category ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{recipe.category}</Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    backgroundColor: COLORS.card,
    marginBottom: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredContainer: {
    width: width - SPACING.md * 2,
    height: 220,
  },
  compactContainer: {
    width: 150,
    height: 180,
    marginRight: SPACING.sm,
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  featuredImage: {
    height: "100%",
  },
  compactImage: {
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
  },
  featuredContent: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  compactTitle: {
    fontSize: 12,
  },
  metaContainer: {
    flexDirection: "row",
    marginTop: SPACING.xs,
    flexWrap: "wrap",
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.xs,
    marginTop: SPACING.xs,
  },
  sourceBadge: {
    backgroundColor: COLORS.secondary,
  },
  badgeText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "500",
  },
});

export default RecipeCard;
