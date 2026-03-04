// Post Recipe Screen — create/edit user recipes
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants";
import { useAuth } from "../hooks/useAuth";
import { createRecipe, updateRecipe } from "../services/userRecipeService";
import { Recipe, UserRecipe } from "../types";

interface PostRecipeScreenProps {
  editRecipe?: Recipe;
  onBack: () => void;
  onSuccess?: () => void;
}

export const PostRecipeScreen: React.FC<PostRecipeScreenProps> = ({
  editRecipe,
  onBack,
  onSuccess,
}) => {
  const { user } = useAuth();
  const isEditing = !!editRecipe;

  const [title, setTitle] = useState(editRecipe?.title || "");
  const [ingredientText, setIngredientText] = useState(
    editRecipe?.ingredients?.join("\n") || "",
  );
  const [instructions, setInstructions] = useState(
    editRecipe?.instructions || "",
  );
  const [category, setCategory] = useState(editRecipe?.category || "");
  const [videoUrl, setVideoUrl] = useState(editRecipe?.videoUrl || "");
  const [imageUrl, setImageUrl] = useState(editRecipe?.imageUrl || "");
  const [prepTime, setPrepTime] = useState(
    editRecipe?.prepTime?.toString() || "",
  );
  const [servings, setServings] = useState(
    editRecipe?.servings?.toString() || "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    "Breakfast",
    "Main Course",
    "Vegetarian",
    "Dessert",
    "Snack",
    "Soup",
    "Salad",
    "Beverage",
  ];

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to post a recipe.");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a recipe title.");
      return;
    }
    if (!ingredientText.trim()) {
      Alert.alert("Required", "Please add at least one ingredient.");
      return;
    }
    if (!instructions.trim()) {
      Alert.alert("Required", "Please add cooking instructions.");
      return;
    }

    setIsSubmitting(true);

    try {
      // YouTube Video Verification
      let isVideoVerified = false;
      const finalVideoUrl = videoUrl.trim();

      if (finalVideoUrl) {
        try {
          const oembedRes = await fetch(
            `https://youtube.com/oembed?url=${encodeURIComponent(finalVideoUrl)}&format=json`,
          );
          if (oembedRes.ok) {
            const videoData = await oembedRes.json();
            const videoTitle = videoData.title.toLowerCase();
            const recipeTitle = title.trim().toLowerCase();

            // Verify: Does video title contain the recipe name?
            if (videoTitle.includes(recipeTitle)) {
              isVideoVerified = true;
            } else {
              setIsSubmitting(false);
              Alert.alert(
                "Verification Failed",
                `Your video is titled "${videoData.title}" which doesn't seem to match your recipe "${title}". Please provide a matching video.`,
              );
              return;
            }
          } else {
            setIsSubmitting(false);
            Alert.alert(
              "Invalid Video",
              "We couldn't verify that YouTube URL. Please make sure it is public and correct.",
            );
            return;
          }
        } catch (e) {
          setIsSubmitting(false);
          Alert.alert("Error", "Could not verify YouTube video at this time.");
          return;
        }
      }

      const ingredients = ingredientText
        .split("\n")
        .map((i) => i.trim())
        .filter(Boolean);

      const recipeData: Omit<UserRecipe, "id"> = {
        title: title.trim(),
        ingredients,
        cleanedIngredients: ingredients.map((i) => i.toLowerCase()),
        instructions: instructions.trim(),
        imageUrl: imageUrl.trim(),
        imageName: title.toLowerCase().replace(/\s+/g, "-"),
        category: category || "Main Course",
        videoUrl: finalVideoUrl || undefined,
        prepTime: prepTime ? parseInt(prepTime) : undefined,
        servings: servings ? parseInt(servings) : undefined,
        source: "user",
        createdBy: user.id, // Fixed user ID reference from types
        isPublic: true,
      };

      // In a real app we would add the isVideoVerified flag to the DB via UserRecipe type
      if (isVideoVerified) {
        (recipeData as any).isVideoVerified = true;
      }

      if (isEditing && editRecipe) {
        const success = await updateRecipe(editRecipe.id, recipeData);
        if (success) {
          Alert.alert(
            isVideoVerified ? "Verified & Updated! ✅" : "Updated!",
            "Your recipe has been updated.",
            [{ text: "OK", onPress: onSuccess || onBack }],
          );
        } else {
          Alert.alert("Error", "Failed to update recipe.");
        }
      } else {
        const id = await createRecipe(recipeData, user.id); // Fixed user ID reference from types
        if (id) {
          Alert.alert(
            isVideoVerified ? "Verified & Posted! ✅" : "Posted! 🎉",
            "Your recipe is now live.",
            [{ text: "OK", onPress: onSuccess || onBack }],
          );
        } else {
          Alert.alert("Error", "Failed to post recipe.");
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? "Edit Recipe" : "Post Recipe"}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.label}>Recipe Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Spicy Garlic Butter Shrimp"
          placeholderTextColor={COLORS.textLight}
          value={title}
          onChangeText={setTitle}
        />

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryRow}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                category === cat && styles.categoryChipActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  category === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Image URL */}
        <Text style={styles.label}>Image URL (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://example.com/my-dish.jpg"
          placeholderTextColor={COLORS.textLight}
          value={imageUrl}
          onChangeText={setImageUrl}
          autoCapitalize="none"
          keyboardType="url"
        />

        {/* Prep Time & Servings */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Prep Time (min)</Text>
            <TextInput
              style={styles.input}
              placeholder="30"
              placeholderTextColor={COLORS.textLight}
              value={prepTime}
              onChangeText={setPrepTime}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Servings</Text>
            <TextInput
              style={styles.input}
              placeholder="4"
              placeholderTextColor={COLORS.textLight}
              value={servings}
              onChangeText={setServings}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Ingredients */}
        <Text style={styles.label}>Ingredients * (one per line)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder={
            "2 cups flour\n1 cup sugar\n3 eggs\n1 tsp vanilla extract"
          }
          placeholderTextColor={COLORS.textLight}
          value={ingredientText}
          onChangeText={setIngredientText}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        {/* Instructions */}
        <Text style={styles.label}>Instructions *</Text>
        <TextInput
          style={[styles.input, styles.multiline, { minHeight: 150 }]}
          placeholder="Step-by-step cooking instructions..."
          placeholderTextColor={COLORS.textLight}
          value={instructions}
          onChangeText={setInstructions}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />

        {/* Video URL */}
        <Text style={styles.label}>YouTube Video URL (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://youtube.com/watch?v=..."
          placeholderTextColor={COLORS.textLight}
          value={videoUrl}
          onChangeText={setVideoUrl}
          autoCapitalize="none"
          keyboardType="url"
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitBtnText}>
              {isEditing ? "Update Recipe" : "Post Recipe"}
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    backgroundColor: COLORS.primary,
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
  form: {
    flex: 1,
  },
  formContent: {
    padding: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 15,
    color: COLORS.text,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  halfField: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: "row",
    marginBottom: SPACING.xs,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "center",
    marginTop: SPACING.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default PostRecipeScreen;
