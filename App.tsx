// Main App Component with Navigation
import React, { useState } from "react";
import {
  StatusBar,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthProvider, useAuth } from "./src/hooks/useAuth";
import {
  LoginScreen,
  RegisterScreen,
  HomeScreen,
  PantryScreen,
  FavoritesScreen,
  ProfileScreen,
  RecipeDetailScreen,
  PostRecipeScreen,
  MyRecipesScreen,
  OfflineRecipesScreen,
} from "./src/screens";
import { Recipe } from "./src/types";
import { COLORS } from "./src/constants";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Icon Component
const TabIcon = ({
  icon,
  focused,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}) => (
  <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
    <Ionicons
      name={icon}
      size={24}
      color={focused ? COLORS.primary : COLORS.textSecondary}
    />
  </View>
);

// Serialize recipe dates to avoid React Navigation warning
const serializeRecipe = (recipe: Recipe) => ({
  ...recipe,
  createdAt:
    recipe.createdAt instanceof Date
      ? recipe.createdAt.toISOString()
      : recipe.createdAt,
});

// Main Tab Navigator
const MainTabs = ({ navigation }: any) => {
  const handleRecipePress = (recipe: Recipe) => {
    navigation.navigate("RecipeDetail", { recipe: serializeRecipe(recipe) });
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tab.Screen
          name="Home"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="home" focused={focused} />
            ),
          }}
        >
          {() => <HomeScreen onRecipePress={handleRecipePress} />}
        </Tab.Screen>

        <Tab.Screen
          name="Pantry"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="cube-outline" focused={focused} />
            ),
          }}
        >
          {() => <PantryScreen onRecipePress={handleRecipePress} />}
        </Tab.Screen>

        <Tab.Screen
          name="Post"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.postTabIcon}>
                <Ionicons name="add" size={28} color="#FFFFFF" />
              </View>
            ),
            tabBarLabel: () => null,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate("PostRecipe");
            },
          }}
        >
          {() => <View />}
        </Tab.Screen>

        <Tab.Screen
          name="Favorites"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="heart" focused={focused} />
            ),
          }}
        >
          {() => <FavoritesScreen onRecipePress={handleRecipePress} />}
        </Tab.Screen>

        <Tab.Screen
          name="Profile"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="person" focused={focused} />
            ),
          }}
        >
          {() => (
            <ProfileScreen
              onNavigateToMyRecipes={() => navigation.navigate("MyRecipes")}
              onNavigateToOffline={() => navigation.navigate("OfflineRecipes")}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
};

// Auth Stack Navigator
const AuthStack = () => {
  const [currentScreen, setCurrentScreen] = useState<"login" | "register">(
    "login",
  );

  if (currentScreen === "login") {
    return (
      <LoginScreen
        onNavigateToRegister={() => setCurrentScreen("register")}
        onLoginSuccess={() => {}}
      />
    );
  }

  return (
    <RegisterScreen
      onNavigateToLogin={() => setCurrentScreen("login")}
      onRegisterSuccess={() => {}}
    />
  );
};

// Main App Navigation
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons
          name="restaurant"
          size={72}
          color="#FFFFFF"
          style={{ marginBottom: 16 }}
        />
        <Text style={styles.loadingText}>KitchenFlicks</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="RecipeDetail"
            options={{
              presentation: "card",
              animation: "slide_from_right",
            }}
          >
            {({ route, navigation }) => (
              <RecipeDetailScreen
                recipeId={(route.params as any)?.recipe?.id}
                source={(route.params as any)?.recipe?.source}
                initialRecipe={(route.params as any)?.recipe}
                onBack={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="PostRecipe"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          >
            {({ route, navigation }) => (
              <PostRecipeScreen
                editRecipe={(route.params as any)?.editRecipe}
                onBack={() => navigation.goBack()}
                onSuccess={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="MyRecipes"
            options={{
              animation: "slide_from_right",
            }}
          >
            {({ navigation }) => (
              <MyRecipesScreen
                onBack={() => navigation.goBack()}
                onRecipePress={(recipe) =>
                  navigation.navigate("RecipeDetail", {
                    recipe: serializeRecipe(recipe),
                  })
                }
                onEditRecipe={(recipe) =>
                  navigation.navigate("PostRecipe", {
                    editRecipe: serializeRecipe(recipe),
                  })
                }
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="OfflineRecipes"
            options={{
              animation: "slide_from_right",
            }}
          >
            {({ navigation }) => (
              <OfflineRecipesScreen
                onBack={() => navigation.goBack()}
                onRecipePress={(recipe) =>
                  navigation.navigate("RecipeDetail", {
                    recipe: serializeRecipe(recipe),
                  })
                }
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

// Root App Component
export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  loadingIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  tabBar: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    paddingBottom: 0,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: -4,
    marginBottom: 8,
  },
  tabIcon: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  tabIconActive: {
    transform: [{ scale: 1.1 }],
  },
  tabIconText: {
    fontSize: 22,
  },
  postTabIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  postTabIconText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: -2,
  },
});
