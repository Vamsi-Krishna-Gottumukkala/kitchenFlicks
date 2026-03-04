// Home Screen - Recipe Discovery
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  RECIPE_CATEGORIES,
} from "../constants";
import { Recipe } from "../types";
import { RecipeCard } from "../components";
import {
  getRecipes, // Used for Recommended
  getTrendingRecipes, // Used for Most Popular
  searchRecipesByName,
  getRecipesByCategory,
} from "../services/recipeService";
import { getPublicUserRecipes } from "../services/userRecipeService";

import { useAuth } from "../hooks/useAuth";

interface HomeScreenProps {
  onRecipePress: (recipe: Recipe) => void;
}

const { width } = Dimensions.get("window");

export const HomeScreen: React.FC<HomeScreenProps> = ({ onRecipePress }) => {
  const { user } = useAuth();
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([]);
  const [trendingRecipes, setTrendingRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, [selectedCategory, user?.preferences]);

  const loadRecipes = async () => {
    setIsLoading(true);
    try {
      if (selectedCategory === "all") {
        // Load Recommended, Trending, and user-posted recipes
        const [recommended, trending, userRecipes] = await Promise.all([
          getRecipes(10, user?.preferences || []), // Pass user preferences to engine
          getTrendingRecipes(10),
          getPublicUserRecipes(),
        ]);

        // Interleave user recipes into recommended for visibility
        setRecommendedRecipes([...userRecipes.slice(0, 2), ...recommended]);
        setTrendingRecipes(trending);
      } else {
        // Load by category
        const categoryName =
          RECIPE_CATEGORIES.find((c) => c.id === selectedCategory)?.name ||
          "All";
        const categoryResults = await getRecipesByCategory(categoryName);
        setRecommendedRecipes(categoryResults);
        setTrendingRecipes([]);
      }
    } catch (error) {
      console.error("Error loading recipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRecipes();
    setIsRefreshing(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search across local JSON dataset and user-posted recipes
      const [localResults, userRecipes] = await Promise.all([
        searchRecipesByName(searchQuery),
        getPublicUserRecipes(),
      ]);

      // Filter user recipes by search term
      const filteredUserRecipes = userRecipes.filter((r) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      setSearchResults([...filteredUserRecipes, ...localResults]);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Chef! 👋</Text>
          <Text style={styles.headerTitle}>What would you like to cook?</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={18}
            color={COLORS.textLight}
            style={{ marginRight: SPACING.sm }}
          />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search recipes..."
            placeholderTextColor={COLORS.textLight}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Categories */}
        {!searchQuery && (
          <View style={styles.section}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: SPACING.md,
              }}
            >
              <Ionicons
                name="pricetag"
                size={18}
                color={COLORS.primary}
                style={{ marginRight: SPACING.xs }}
              />
              <Text style={styles.sectionTitle}>Categories</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
            >
              {RECIPE_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id &&
                      styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={16}
                    color={
                      selectedCategory === category.id
                        ? "#FFFFFF"
                        : COLORS.textSecondary
                    }
                    style={{ marginRight: SPACING.xs }}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.id &&
                        styles.categoryTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Search Results */}
        {searchQuery ? (
          <View style={styles.section}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: SPACING.md,
              }}
            >
              <Ionicons
                name="search"
                size={20}
                color={COLORS.primary}
                style={{ marginRight: SPACING.xs }}
              />
              <Text style={styles.sectionTitle}>Search Results</Text>
            </View>

            {isLoading || isSearching ? (
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
                style={styles.loader}
              />
            ) : searchResults.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="restaurant-outline"
                  size={60}
                  color={COLORS.textLight}
                />
                <Text style={styles.emptyText}>No recipes found</Text>
                <Text style={styles.emptySubtext}>
                  Try a different search term
                </Text>
              </View>
            ) : (
              <View style={styles.recipeGrid}>
                {searchResults.map((recipe) => (
                  <RecipeCard
                    key={`search-${recipe.id}`}
                    recipe={recipe}
                    onPress={() => onRecipePress(recipe)}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          /* Normal Feeds (Not Searching) */
          <>
            {/* Recommended Section (formerly Featured) */}
            {recommendedRecipes.length > 0 && (
              <View style={styles.section}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: SPACING.md,
                  }}
                >
                  <Ionicons
                    name="star"
                    size={20}
                    color={COLORS.primary}
                    style={{ marginRight: SPACING.xs }}
                  />
                  <Text style={styles.sectionTitle}>
                    {selectedCategory === "all"
                      ? "Recommended For You"
                      : `${RECIPE_CATEGORIES.find((c) => c.id === selectedCategory)?.name} Recipes`}
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.featuredScroll}
                >
                  {recommendedRecipes.map((recipe) => (
                    <View key={`rec-${recipe.id}`} style={styles.featuredCard}>
                      <RecipeCard
                        recipe={recipe}
                        variant="featured"
                        onPress={() => onRecipePress(recipe)}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Trending / Most Popular Section */}
            {trendingRecipes.length > 0 && selectedCategory === "all" && (
              <View style={styles.section}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: SPACING.md,
                  }}
                >
                  <Ionicons
                    name="trending-up"
                    size={20}
                    color={COLORS.primary}
                    style={{ marginRight: SPACING.xs }}
                  />
                  <Text style={styles.sectionTitle}>
                    Trending & Most Popular
                  </Text>
                </View>

                {isLoading ? (
                  <ActivityIndicator
                    size="large"
                    color={COLORS.primary}
                    style={styles.loader}
                  />
                ) : (
                  <View style={styles.recipeGrid}>
                    {trendingRecipes.map((recipe) => (
                      <RecipeCard
                        key={`trend-${recipe.id}`}
                        recipe={recipe}
                        onPress={() => onRecipePress(recipe)}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  greeting: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: SPACING.xs,
  },
  clearIcon: {
    fontSize: 16,
    color: COLORS.textSecondary,
    padding: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  featuredScroll: {
    marginHorizontal: -SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  featuredCard: {
    marginRight: SPACING.md,
  },
  categoriesScroll: {
    marginHorizontal: -SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  recipeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 100,
  },
  loader: {
    marginTop: SPACING.xl,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: SPACING.xl * 2,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default HomeScreen;
