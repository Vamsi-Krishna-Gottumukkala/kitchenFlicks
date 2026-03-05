// Recipe Detail Screen — with reviews, video, download, enhanced share
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants";
import { Recipe } from "../types";
import {
  ChatBot,
  StarRating,
  ReviewSection,
  VideoPlayer,
  shareRecipe,
  shareIngredientsList,
} from "../components";
import { getRecipeById } from "../services/recipeService";
import { getUserRecipeById } from "../services/userRecipeService";
import { getPlaceholderImage } from "../services/unsplashService";
import { useAuth } from "../hooks/useAuth";
import { addToFavorites, removeFromFavorites } from "../services/recipeService";
import {
  downloadRecipe,
  isRecipeDownloaded,
  removeOfflineRecipe,
} from "../services/offlineService";
import { getAverageRating } from "../services/reviewService";

interface RecipeDetailScreenProps {
  recipeId: string;
  source?: "local" | "mealdb" | "user";
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
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [avgRating, setAvgRating] = useState({ average: 0, count: 0 });
  const { user } = useAuth();

  useEffect(() => {
    if (!initialRecipe) {
      loadRecipe();
    }
  }, [recipeId]);

  useEffect(() => {
    if (user && recipe) {
      setIsFavorite(user.favorites?.includes(recipe.id) || false);
    }
  }, [user, recipe]);

  useEffect(() => {
    if (recipe) {
      checkDownloaded();
      loadRating();
    }
  }, [recipe]);

  const loadRecipe = async () => {
    setIsLoading(true);
    try {
      let fetchedRecipe: Recipe | null = null;
      if (source === "user") {
        fetchedRecipe = await getUserRecipeById(recipeId);
      } else {
        fetchedRecipe = await getRecipeById(
          recipeId,
          source as "local" | "mealdb",
        );
      }
      setRecipe(fetchedRecipe);
    } catch (error) {
      console.error("Error loading recipe:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkDownloaded = async () => {
    if (recipe) {
      const downloaded = await isRecipeDownloaded(recipe.id);
      setIsDownloaded(downloaded);
    }
  };

  const loadRating = async () => {
    if (recipe) {
      const rating = await getAverageRating(recipe.id);
      setAvgRating(rating);
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

    Alert.alert("Share Recipe", "Choose how to share", [
      { text: "Full Recipe", onPress: () => shareRecipe(recipe) },
      { text: "Shopping List", onPress: () => shareIngredientsList(recipe) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleDownload = async () => {
    if (!recipe) return;

    if (isDownloaded) {
      Alert.alert(
        "Remove Download",
        "Remove this recipe from offline storage?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              await removeOfflineRecipe(recipe.id);
              setIsDownloaded(false);
            },
          },
        ],
      );
    } else {
      const success = await downloadRecipe(recipe);
      if (success) {
        setIsDownloaded(true);
        Alert.alert("Downloaded!", "Recipe saved for offline use.");
      } else {
        Alert.alert("Error", "Could not download recipe.");
      }
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
        <Ionicons name="sad-outline" size={48} color={COLORS.textLight} />
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

        <View style={styles.navigation}>
          <TouchableOpacity style={styles.navButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.navActions}>
            <TouchableOpacity style={styles.navButton} onPress={handleDownload}>
              <Ionicons
                name={isDownloaded ? "cloud-done" : "cloud-download-outline"}
                size={22}
                color={isDownloaded ? COLORS.primary : COLORS.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              onPress={handleToggleFavorite}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={22}
                color={isFavorite ? "#FF4757" : COLORS.text}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={handleShare}>
              <Ionicons
                name="share-social-outline"
                size={22}
                color={COLORS.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Title on Image */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{recipe.title}</Text>
          <View style={styles.titleMeta}>
            {recipe.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{recipe.category}</Text>
              </View>
            )}
            {avgRating.count > 0 && (
              <View style={styles.ratingInline}>
                <StarRating rating={avgRating.average} size={14} />
                <Text style={styles.ratingCountText}>({avgRating.count})</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Info Bar */}
        {(recipe.prepTime || recipe.servings || recipe.source === "user") && (
          <View style={styles.infoBar}>
            {recipe.prepTime && (
              <View style={styles.infoItem}>
                <Ionicons
                  name="timer-outline"
                  size={16}
                  color={COLORS.primary}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.infoText}>{recipe.prepTime} min</Text>
              </View>
            )}
            {recipe.servings && (
              <View style={styles.infoItem}>
                <Ionicons
                  name="people-outline"
                  size={16}
                  color={COLORS.primary}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.infoText}>{recipe.servings} servings</Text>
              </View>
            )}
            {recipe.source === "user" && (
              <View style={styles.infoItem}>
                <Ionicons
                  name="person-outline"
                  size={16}
                  color={COLORS.primary}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.infoText}>Community</Text>
              </View>
            )}
            {isDownloaded && (
              <View style={styles.infoItem}>
                <Ionicons
                  name="cloud-done-outline"
                  size={16}
                  color={COLORS.primary}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.infoText}>Offline</Text>
              </View>
            )}
          </View>
        )}

        {/* Ingredients Section */}
        <View style={styles.section}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: SPACING.md,
            }}
          >
            <Ionicons
              name="list"
              size={20}
              color={COLORS.primary}
              style={{ marginRight: SPACING.xs }}
            />
            <Text style={styles.sectionTitle}>Ingredients</Text>
          </View>
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: SPACING.md,
            }}
          >
            <Ionicons
              name="book"
              size={20}
              color={COLORS.primary}
              style={{ marginRight: SPACING.xs }}
            />
            <Text style={styles.sectionTitle}>Instructions</Text>
          </View>
          <Text style={styles.instructions}>{recipe.instructions}</Text>
        </View>

        {/* Video Section */}
        <VideoPlayer videoUrl={recipe.videoUrl} recipeTitle={recipe.title} />

        {/* Reviews Section */}
        <ReviewSection recipeId={recipe.id} />

        {/* Spacer for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* AI Chef FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowChatBot(true)}>
        <Ionicons
          name="chatbubble-ellipses"
          size={22}
          color="#FFFFFF"
          style={{ marginRight: SPACING.xs }}
        />
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
  titleMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  ratingInline: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingCountText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  infoBar: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  infoText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textSecondary,
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
