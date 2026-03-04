// My Recipes Screen — list of user's posted recipes
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants";
import { Recipe } from "../types";
import { RecipeCard } from "../components";
import { useAuth } from "../hooks/useAuth";
import {
  getUserRecipes,
  deleteUserRecipe,
} from "../services/userRecipeService";

interface MyRecipesScreenProps {
  onBack: () => void;
  onRecipePress: (recipe: Recipe) => void;
  onEditRecipe: (recipe: Recipe) => void;
}

export const MyRecipesScreen: React.FC<MyRecipesScreenProps> = ({
  onBack,
  onRecipePress,
  onEditRecipe,
}) => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadRecipes = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const result = await getUserRecipes(user.id);
    setRecipes(result);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRecipes();
    setIsRefreshing(false);
  };

  const handleDelete = (recipe: Recipe) => {
    if (!user) return;
    Alert.alert(
      "Delete Recipe",
      `Are you sure you want to delete "${recipe.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await deleteUserRecipe(recipe.id, user.id);
            if (success) {
              setRecipes(recipes.filter((r) => r.id !== recipe.id));
            } else {
              Alert.alert("Error", "Could not delete recipe.");
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Recipes</Text>
        <View style={{ width: 60 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : recipes.length === 0 ? (
        <View style={styles.center}>
          <Ionicons
            name="document-text-outline"
            size={60}
            color={COLORS.textLight}
          />
          <Text style={styles.emptyTitle}>No recipes yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to share your first recipe!
          </Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.recipeItem}>
              <TouchableOpacity
                style={styles.recipeContent}
                onPress={() => onRecipePress(item)}
              >
                <Text style={styles.recipeTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.recipeMeta}>
                  {item.category || "Uncategorized"} •{" "}
                  {item.ingredients?.length || 0} ingredients
                </Text>
              </TouchableOpacity>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => onEditRecipe(item)}
                >
                  <Ionicons
                    name="create-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleDelete(item)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={COLORS.error}
                  />
                </TouchableOpacity>
              </View>
            </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.secondary,
  },
  backBtn: {
    width: 60,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SPACING.xs,
  },
  list: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  recipeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recipeContent: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  recipeMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  actionBtn: {
    padding: SPACING.sm,
  },
  actionIcon: {
    fontSize: 20,
  },
});

export default MyRecipesScreen;
