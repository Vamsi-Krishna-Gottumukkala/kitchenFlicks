// Recipe Detail Screen
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Share,
  ActivityIndicator,
} from "react-native";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants";
import { Recipe } from "../types";
import { ChatBot } from "../components";
import { getRecipeById } from "../services/recipeService";
import { getPlaceholderImage } from "../services/unsplashService";
import { useAuth } from "../hooks/useAuth";
import { addToFavorites, removeFromFavorites } from "../services/recipeService";

interface RecipeDetailScreenProps {
  recipeId: string;
  source?: "local" | "mealdb";
  initialRecipe?: Recipe;
  onBack: () => void;
}

const { width } = Dimensions.get("window");

export const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({
  recipeId,
  source = "local",
  initialRecipe,
  onBack,
}) => {
  const [recipe, setRecipe] = useState<Recipe | null>(initialRecipe || null);
  const [isLoading, setIsLoading] = useState(!initialRecipe);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!initialRecipe) {
      loadRecipe();
    }
  }, [recipeId]);

  useEffect(() => {
    if (user && recipe) {
      setIsFavorite(user.favorites.includes(recipe.id));
    }
  }, [user, recipe]);

  const loadRecipe = async () => {
    setIsLoading(true);
    try {
      const fetchedRecipe = await getRecipeById(recipeId, source);
      setRecipe(fetchedRecipe);
    } catch (error) {
      console.error("Error loading recipe:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user || !recipe) return;

    try {
      if (isFavorite) {
        await removeFromFavorites(user.id, recipe.id);
      } else {
        await addToFavorites(user.id, recipe.id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleShare = async () => {
    if (!recipe) return;

    try {
      await Share.share({
        message: `Check out this recipe: ${recipe.title}\n\nIngredients:\n${recipe.ingredients.slice(0, 5).join("\n")}...`,
        title: recipe.title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>😕</Text>
        <Text style={styles.errorText}>Recipe not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imageUrl =
    imageError || !recipe.imageUrl
      ? getPlaceholderImage(recipe.title)
      : recipe.imageUrl;

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          onError={() => setImageError(true)}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.navButton} onPress={onBack}>
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.navActions}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={handleToggleFavorite}
            >
              <Text style={styles.navButtonText}>
                {isFavorite ? "❤️" : "🤍"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={handleShare}>
              <Text style={styles.navButtonText}>↗️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Title on Image */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{recipe.title}</Text>
          {recipe.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{recipe.category}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Ingredients Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Ingredients</Text>
          <View style={styles.ingredientsList}>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.checkBox} />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Instructions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👨‍🍳 Instructions</Text>
          <Text style={styles.instructions}>{recipe.instructions}</Text>
        </View>

        {/* Spacer for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* AI Chef FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowChatBot(true)}>
        <Text style={styles.fabIcon}>👨‍🍳</Text>
        <Text style={styles.fabText}>Ask AI Chef</Text>
      </TouchableOpacity>

      {/* ChatBot Modal */}
      <ChatBot
        visible={showChatBot}
        onClose={() => setShowChatBot(false)}
        recipe={recipe}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  imageContainer: {
    height: 300,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  navigation: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
  },
  navActions: {
    flexDirection: "row",
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SPACING.sm,
  },
  navButtonText: {
    fontSize: 20,
  },
  titleContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    marginTop: SPACING.sm,
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  ingredientsList: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: SPACING.md,
    marginTop: 2,
  },
  ingredientText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  instructions: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 26,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 24,
    marginRight: SPACING.xs,
  },
  fabText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});

export default RecipeDetailScreen;
