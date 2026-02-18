// Main App Component with Navigation
import React, { useState } from "react";
import { StatusBar, SafeAreaView, StyleSheet, View, Text } from "react-native";
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
} from "./src/screens";
import { Recipe } from "./src/types";
import { COLORS } from "./src/constants";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Icon Component
const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
  <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
    <Text style={styles.tabIconText}>{icon}</Text>
  </View>
);

// Main Tab Navigator
const MainTabs = ({ navigation }: any) => {
  const handleRecipePress = (recipe: Recipe) => {
    navigation.navigate("RecipeDetail", { recipe });
  };

  return (
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
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      >
        {() => <HomeScreen onRecipePress={handleRecipePress} />}
      </Tab.Screen>

      <Tab.Screen
        name="Pantry"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🧊" focused={focused} />,
        }}
      >
        {() => <PantryScreen onRecipePress={handleRecipePress} />}
      </Tab.Screen>

      <Tab.Screen
        name="Favorites"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="❤️" focused={focused} />,
        }}
      >
        {() => <FavoritesScreen onRecipePress={handleRecipePress} />}
      </Tab.Screen>

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Auth Stack Navigator
const AuthStack = () => {
  const [currentScreen, setCurrentScreen] = useState<"login" | "register">(
    "login",
  );

  // We use conditional rendering instead of a stack for simpler auth flow
  if (currentScreen === "login") {
    return (
      <LoginScreen
        onNavigateToRegister={() => setCurrentScreen("register")}
        onLoginSuccess={() => {}} // Auth state change handles this
      />
    );
  }

  return (
    <RegisterScreen
      onNavigateToLogin={() => setCurrentScreen("login")}
      onRegisterSuccess={() => {}} // Auth state change handles this
    />
  );
};

// Main App Navigation
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingIcon}>🍳</Text>
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
});
