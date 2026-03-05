// Favorites Screen
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../constants";
import { Recipe } from "../types";
import { RecipeCard } from "../components";
import { useAuth } from "../hooks/useAuth";
import { getRecipeById, getMealDBRecipeById } from "../services/recipeService";

interface FavoritesScreenProps {
  onRecipePress: (recipe: Recipe) => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  onRecipePress,
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const favoriteIds = user.favorites || [];
      const recipePromises = favoriteIds.map(async (id) => {
        // Try local first, then MealDB
        let recipe = await getRecipeById(id, "local");
        if (!recipe) {
          recipe = await getMealDBRecipeById(id);
        }
        return recipe;
      });

      const results = await Promise.all(recipePromises);
      setRecipes(results.filter((r): r is Recipe => r !== null));
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFavorites();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name="heart"
          size={26}
          color="#FFFFFF"
          style={{ marginRight: SPACING.sm }}
        />
        <Text style={styles.headerTitle}>My Favorites</Text>
      </View>

      {recipes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="heart-dislike-outline"
            size={60}
            color={COLORS.textLight}
          />
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the heart icon on recipes to save them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => `${item.source}-${item.id}`}
          numColumns={2}
          columnWrapperStyle={styles.recipeRow}
          contentContainerStyle={styles.recipeList}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          renderItem={({ item }) => (
            <RecipeCard recipe={item} onPress={() => onRecipePress(item)} />
          )}
        />
      )}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: "#FF6B8A",
  },
  headerIcon: {
    fontSize: 28,
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  recipeRow: {
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
  },
  recipeList: {
    paddingTop: SPACING.md,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});

export default FavoritesScreen;
