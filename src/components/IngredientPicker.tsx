// Ingredient Picker component for Pantry-to-Plate feature
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  INGREDIENT_CATEGORIES,
} from "../constants";

interface IngredientPickerProps {
  selectedIngredients: string[];
  onSelectionChange: (ingredients: string[]) => void;
  maxSelections?: number;
}

export const IngredientPicker: React.FC<IngredientPickerProps> = ({
  selectedIngredients,
  onSelectionChange,
  maxSelections = 10,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    INGREDIENT_CATEGORIES[0].name,
  );

  const toggleIngredient = (ingredient: string) => {
    if (selectedIngredients.includes(ingredient)) {
      onSelectionChange(selectedIngredients.filter((i) => i !== ingredient));
    } else if (selectedIngredients.length < maxSelections) {
      onSelectionChange([...selectedIngredients, ingredient]);
    }
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(
      expandedCategory === categoryName ? null : categoryName,
    );
  };

  return (
    <View style={styles.container}>
      {/* Selected ingredients chips */}
      {selectedIngredients.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedLabel}>
            Selected ({selectedIngredients.length}/{maxSelections}):
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
          >
            {selectedIngredients.map((ingredient) => (
              <TouchableOpacity
                key={ingredient}
                style={styles.selectedChip}
                onPress={() => toggleIngredient(ingredient)}
              >
                <Text style={styles.selectedChipText}>{ingredient}</Text>
                <Text style={styles.removeIcon}>×</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Category accordion */}
      <ScrollView style={styles.categoriesContainer}>
        {INGREDIENT_CATEGORIES.map((category) => (
          <View key={category.name} style={styles.categorySection}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => toggleCategory(category.name)}
            >
              <Ionicons
                name={category.icon as any}
                size={20}
                color={COLORS.primary}
                style={{ marginRight: SPACING.sm }}
              />
              <Text style={styles.categoryName}>{category.name}</Text>
              <Ionicons
                name={
                  expandedCategory === category.name
                    ? "chevron-down"
                    : "chevron-forward"
                }
                size={16}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>

            {expandedCategory === category.name && (
              <View style={styles.ingredientsGrid}>
                {category.ingredients.map((ingredient) => {
                  const isSelected = selectedIngredients.includes(ingredient);
                  return (
                    <TouchableOpacity
                      key={ingredient}
                      style={[
                        styles.ingredientChip,
                        isSelected && styles.ingredientChipSelected,
                      ]}
                      onPress={() => toggleIngredient(ingredient)}
                    >
                      <Text
                        style={[
                          styles.ingredientText,
                          isSelected && styles.ingredientTextSelected,
                        ]}
                      >
                        {ingredient}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selectedContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  selectedLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  chipsScroll: {
    flexDirection: "row",
  },
  selectedChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.xs,
  },
  selectedChipText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
  },
  removeIcon: {
    color: "#FFFFFF",
    fontSize: 16,
    marginLeft: 4,
    fontWeight: "bold",
  },
  categoriesContainer: {
    flex: 1,
  },
  categorySection: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.card,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  expandIcon: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  ingredientsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  ingredientChip: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    margin: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ingredientChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  ingredientText: {
    fontSize: 13,
    color: COLORS.text,
  },
  ingredientTextSelected: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
});

export default IngredientPicker;
