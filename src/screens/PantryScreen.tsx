// Pantry Screen - Ingredient-based Recipe Search
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants";
import { Recipe } from "../types";
import { IngredientPicker, RecipeCard } from "../components";
import {
  searchRecipesByIngredients,
  searchMealDBByIngredients,
} from "../services/recipeService";

interface PantryScreenProps {
  onRecipePress: (recipe: Recipe) => void;
}

export const PantryScreen: React.FC<PantryScreenProps> = ({
  onRecipePress,
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleFindRecipes = async () => {
    if (selectedIngredients.length === 0) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      // Search both local and MealDB (now supporting proper multi-ingredient intersection)
      const [localResults, mealDBResults] = await Promise.all([
        searchRecipesByIngredients(selectedIngredients),
        searchMealDBByIngredients(selectedIngredients),
      ]);

      // Combine and deduplicate
      const combined = [...localResults, ...mealDBResults];
      setRecipes(combined);
    } catch (error) {
      console.error("Error searching recipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedIngredients([]);
    setRecipes([]);
    setHasSearched(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name="cube"
          size={36}
          color="#FFFFFF"
          style={{ marginRight: SPACING.md }}
        />
        <View>
          <Text style={styles.headerTitle}>Pantry to Plate</Text>
          <Text style={styles.headerSubtitle}>Select ingredients you have</Text>
        </View>
      </View>

      {/* Main Content */}
      {hasSearched && recipes.length > 0 ? (
        // Results View
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              Found {recipes.length} Recipes
            </Text>
            <TouchableOpacity onPress={handleClear}>
              <Text style={styles.clearText}>Start Over</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.selectedPreview}>
            <Text style={styles.selectedLabel}>With: </Text>
            <Text style={styles.selectedItems} numberOfLines={1}>
              {selectedIngredients.join(", ")}
            </Text>
          </View>

          <FlatList
            data={recipes}
            keyExtractor={(item) => `${item.source}-${item.id}`}
            numColumns={2}
            columnWrapperStyle={styles.recipeRow}
            contentContainerStyle={styles.recipeList}
            renderItem={({ item }) => (
              <RecipeCard recipe={item} onPress={() => onRecipePress(item)} />
            )}
          />
        </View>
      ) : (
        // Ingredient Selection View
        <View style={styles.selectionContainer}>
          <IngredientPicker
            selectedIngredients={selectedIngredients}
            onSelectionChange={setSelectedIngredients}
            maxSelections={10}
          />

          {/* Find Recipes Button */}
          <View style={styles.buttonContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Finding recipes...</Text>
              </View>
            ) : hasSearched && recipes.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="sad-outline"
                  size={48}
                  color={COLORS.textLight}
                />
                <Text style={styles.emptyText}>No recipes found</Text>
                <Text style={styles.emptySubtext}>
                  Try different ingredients
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleClear}
                >
                  <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.findButton,
                  selectedIngredients.length === 0 && styles.findButtonDisabled,
                ]}
                onPress={handleFindRecipes}
                disabled={selectedIngredients.length === 0}
              >
                <Text style={styles.findButtonText}>
                  Find Recipes ({selectedIngredients.length} selected)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
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
    paddingTop: 60,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.secondary,
  },
  headerIcon: {
    fontSize: 40,
    marginRight: SPACING.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  selectionContainer: {
    flex: 1,
  },
  buttonContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  findButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 80,
  },
  findButtonDisabled: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  findButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: SPACING.lg,
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  clearText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  selectedPreview: {
    flexDirection: "row",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  selectedLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  selectedItems: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "500",
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
    alignItems: "center",
    paddingVertical: SPACING.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  retryButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default PantryScreen;
