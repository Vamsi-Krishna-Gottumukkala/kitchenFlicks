// Onboarding Screen - Gather initial user preferences
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  INGREDIENT_CATEGORIES,
} from "../constants";
import { useAuth } from "../hooks/useAuth";

const PREFERENCE_OPTIONS = [
  ...INGREDIENT_CATEGORIES.map((c) => ({
    id: c.name,
    name: c.name,
    icon: c.icon,
  })),
  { id: "Mexican", name: "Mexican", icon: "fast-food-outline" },
  { id: "Italian", name: "Italian", icon: "pizza-outline" },
  { id: "Indian", name: "Indian", icon: "restaurant-outline" },
  { id: "Asian", name: "Asian", icon: "nutrition-outline" },
  { id: "Healthy", name: "Healthy", icon: "fitness-outline" },
  { id: "Dessert", name: "Dessert", icon: "ice-cream-outline" },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
}) => {
  const { user, updateUserPreferences } = useAuth();
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePreference = (id: string) => {
    if (selectedPrefs.includes(id)) {
      setSelectedPrefs(selectedPrefs.filter((p) => p !== id));
    } else {
      setSelectedPrefs([...selectedPrefs, id]);
    }
  };

  const handleContinue = async () => {
    if (selectedPrefs.length < 3) return;

    setIsSubmitting(true);
    try {
      await updateUserPreferences(selectedPrefs);
      onComplete();
    } catch (error) {
      console.error("Error saving preferences:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>What do you love?</Text>
          <Text style={styles.subtitle}>
            Pick at least 3 categories so we can personalize your recipe
            recommendations.
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {PREFERENCE_OPTIONS.map((pref) => {
            const isSelected = selectedPrefs.includes(pref.id);
            return (
              <TouchableOpacity
                key={pref.id}
                style={[styles.prefCard, isSelected && styles.prefCardActive]}
                onPress={() => togglePreference(pref.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[styles.iconWrap, isSelected && styles.iconWrapActive]}
                >
                  <Ionicons
                    name={pref.icon as any}
                    size={32}
                    color={isSelected ? "#FFF" : COLORS.primary}
                  />
                </View>
                <Text
                  style={[styles.prefName, isSelected && styles.prefNameActive]}
                >
                  {pref.name}
                </Text>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={12} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.countText}>
            {selectedPrefs.length} selected (minimum 3)
          </Text>
          <TouchableOpacity
            style={[
              styles.continueBtn,
              selectedPrefs.length < 3 && styles.continueBtnDisabled,
            ]}
            onPress={handleContinue}
            disabled={selectedPrefs.length < 3 || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.continueText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: SPACING.md,
    justifyContent: "space-between",
  },
  prefCard: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "center",
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  prefCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#FFF5F0",
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF0E6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  iconWrapActive: {
    backgroundColor: COLORS.primary,
  },
  prefName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  prefNameActive: {
    color: COLORS.primaryDark,
  },
  checkBadge: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.success,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  continueBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    opacity: 1,
  },
  continueBtnDisabled: {
    backgroundColor: COLORS.textLight,
  },
  continueText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    marginRight: SPACING.xs,
  },
});

export default OnboardingScreen;
