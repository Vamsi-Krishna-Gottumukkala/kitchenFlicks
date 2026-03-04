// Profile Screen — updated with My Recipes and Downloads navigation
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants";
import { useAuth } from "../hooks/useAuth";
import { getOfflineCount } from "../services/offlineService";

interface ProfileScreenProps {
  onNavigateToMyRecipes?: () => void;
  onNavigateToOffline?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateToMyRecipes,
  onNavigateToOffline,
}) => {
  const { user, logout, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);

  useEffect(() => {
    loadOfflineCount();
  }, []);

  const loadOfflineCount = async () => {
    const count = await getOfflineCount();
    setOfflineCount(count);
  };

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await logout();
          } catch (error) {
            console.error("Logout error:", error);
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  const MenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
    badge,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    badge?: string;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons
        name={icon}
        size={22}
        color={COLORS.primary}
        style={{ marginRight: SPACING.md }}
      />
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {badge && (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.displayName?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.displayName || "User"}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.favorites?.length || 0}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {user?.uploadedRecipes?.length || 0}
          </Text>
          <Text style={styles.statLabel}>Recipes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{offlineCount}</Text>
          <Text style={styles.statLabel}>Downloads</Text>
        </View>
      </View>

      {/* Menu */}
      <ScrollView style={styles.menu}>
        <Text style={styles.sectionTitle}>My Content</Text>
        <View style={styles.menuSection}>
          <MenuItem
            icon="document-text-outline"
            title="My Recipes"
            subtitle="Manage your posted recipes"
            onPress={onNavigateToMyRecipes}
            badge={
              user?.uploadedRecipes?.length
                ? `${user.uploadedRecipes.length}`
                : undefined
            }
          />
          <MenuItem
            icon="cloud-download-outline"
            title="Downloaded Recipes"
            subtitle="Available offline"
            onPress={onNavigateToOffline}
            badge={offlineCount > 0 ? `${offlineCount}` : undefined}
          />
        </View>

        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuSection}>
          <MenuItem
            icon="person-outline"
            title="Edit Profile"
            subtitle="Update your name and photo"
          />
          <MenuItem icon="mail-outline" title="Email" subtitle={user?.email} />
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.menuSection}>
          <MenuItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Manage push notifications"
          />
          <MenuItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Coming soon"
          />
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.menuSection}>
          <MenuItem
            icon="information-circle-outline"
            title="About KitchenFlicks"
            subtitle="Version 2.0.0"
          />
          <MenuItem icon="document-outline" title="Terms of Service" />
          <MenuItem icon="lock-closed-outline" title="Privacy Policy" />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={COLORS.error}
            style={{ marginRight: SPACING.xs }}
          />
          <Text style={styles.logoutText}>
            {isLoggingOut ? "Signing out..." : "Sign Out"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
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
    alignItems: "center",
    paddingTop: 70,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: COLORS.primary,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: SPACING.xs,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    marginTop: -20,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  menu: {
    flex: 1,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  menuSection: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
  },
  menuSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
  },
  menuBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  menuArrow: {
    fontSize: 24,
    color: COLORS.textLight,
  },
  logoutButton: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.error,
  },
});

export default ProfileScreen;
