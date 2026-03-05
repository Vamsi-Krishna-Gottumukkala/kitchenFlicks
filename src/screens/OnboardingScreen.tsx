import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  RECIPE_CATEGORIES,
} from "../constants";
import { useAuth } from "../hooks/useAuth";

export const OnboardingScreen: React.FC = () => {
  const { completeOnboarding } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // We'll use the recipe categories for onboarding (excluding "all")
  const availableCategories = RECIPE_CATEGORIES.filter((c) => c.id !== "all");

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(
        selectedCategories.filter((id) => id !== categoryId),
      );
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleComplete = async () => {
    if (selectedCategories.length < 3) return;
    setIsSubmitting(true);
    try {
      await completeOnboarding(selectedCategories);
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What do you love?</Text>
        <Text style={styles.subtitle}>
          Select at least 3 dish types to personalize your recipes
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {availableCategories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => toggleCategory(category.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.iconContainer,
                    isSelected && styles.iconContainerSelected,
                  ]}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={32}
                    color={isSelected ? "#FFF" : COLORS.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.cardText,
                    isSelected && styles.cardTextSelected,
                  ]}
                >
                  {category.name}
                </Text>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={COLORS.primary}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.selectionCount}>
          {selectedCategories.length} / 3 selected
        </Text>
        <TouchableOpacity
          style={[
            styles.button,
            selectedCategories.length < 3 && styles.buttonDisabled,
          ]}
          onPress={handleComplete}
          disabled={selectedCategories.length < 3 || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.xl,
    paddingTop: SPACING.xl * 1.5,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  gridContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "#FFF5F0",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  iconContainerSelected: {
    backgroundColor: COLORS.primary,
  },
  cardText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  cardTextSelected: {
    color: COLORS.primaryDark,
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFF",
    borderRadius: 12,
  },
  footer: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xl * 1.5,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  selectionCount: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default OnboardingScreen;
