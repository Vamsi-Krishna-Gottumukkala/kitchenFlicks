// Offline Recipes Screen — manage downloaded recipes
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants";
import { OfflineRecipe } from "../types";
import {
  getOfflineRecipes,
  removeOfflineRecipe,
} from "../services/offlineService";

interface OfflineRecipesScreenProps {
  onBack: () => void;
  onRecipePress: (recipe: OfflineRecipe) => void;
}

export const OfflineRecipesScreen: React.FC<OfflineRecipesScreenProps> = ({
  onBack,
  onRecipePress,
}) => {
  const [recipes, setRecipes] = useState<OfflineRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRecipes = useCallback(async () => {
    setIsLoading(true);
    const result = await getOfflineRecipes();
    setRecipes(result);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const handleRemove = (recipe: OfflineRecipe) => {
    Alert.alert(
      "Remove Download",
      `Remove "${recipe.title}" from offline storage?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await removeOfflineRecipe(recipe.id);
            setRecipes(recipes.filter((r) => r.id !== recipe.id));
          },
        },
      ],
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Downloaded Recipes</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Count Badge */}
      {recipes.length > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} saved
            offline
          </Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : recipes.length === 0 ? (
        <View style={styles.center}>
          <Ionicons
            name="cloud-download-outline"
            size={60}
            color={COLORS.textLight}
          />
          <Text style={styles.emptyTitle}>No downloads yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the download button on any recipe to save it for offline use
          </Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.recipeItem}
              onPress={() => onRecipePress(item)}
              activeOpacity={0.8}
            >
              <View style={styles.recipeContent}>
                <Text style={styles.recipeTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.recipeMeta}>
                  {item.category || "Recipe"} • Downloaded{" "}
                  {formatDate(item.downloadedAt)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemove(item)}
              >
                <Ionicons name="close" size={16} color={COLORS.error} />
              </TouchableOpacity>
            </TouchableOpacity>
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
    backgroundColor: "#6C63FF",
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
  countBadge: {
    backgroundColor: "#F0EEFF",
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
  },
  countText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6C63FF",
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
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFE5E5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SPACING.sm,
  },
  removeIcon: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: "700",
  },
});

export default OfflineRecipesScreen;
