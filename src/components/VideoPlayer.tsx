// Video Player — embedded YouTube player for recipe videos
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants";

interface VideoPlayerProps {
  videoUrl?: string;
  recipeTitle?: string;
}

const { width } = Dimensions.get("window");

// Extract YouTube video ID from URL
const getYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  recipeTitle,
}) => {
  const videoId = videoUrl ? getYouTubeId(videoUrl) : null;

  const handlePlay = () => {
    if (videoUrl) {
      Linking.openURL(videoUrl).catch(() => {
        if (videoId) {
          Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`);
        }
      });
    }
  };

  const handleSearchYouTube = () => {
    const query = encodeURIComponent(`${recipeTitle || "recipe"} recipe`);
    Linking.openURL(`https://www.youtube.com/results?search_query=${query}`);
  };

  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Ionicons
          name="videocam"
          size={20}
          color={COLORS.primary}
          style={{ marginRight: SPACING.xs }}
        />
        <Text style={styles.sectionTitle}>Video Instructions</Text>
      </View>

      {videoId && thumbnailUrl ? (
        <>
          <TouchableOpacity
            style={styles.thumbnailContainer}
            onPress={handlePlay}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: thumbnailUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <View style={styles.playOverlay}>
              <View style={styles.playButton}>
                <Ionicons
                  name="play"
                  size={28}
                  color="#FFFFFF"
                  style={{ marginLeft: 4 }}
                />
              </View>
            </View>
            <View style={styles.badge}>
              <Ionicons
                name="logo-youtube"
                size={14}
                color="#FFFFFF"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.badgeText}>YouTube</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.hint}>Tap to watch on YouTube</Text>
        </>
      ) : (
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchYouTube}
          activeOpacity={0.8}
        >
          <View style={styles.searchContent}>
            <View style={styles.youtubeIconWrap}>
              <Ionicons name="logo-youtube" size={28} color="#FF0000" />
            </View>
            <View style={styles.searchTextWrap}>
              <Text style={styles.searchTitle}>Find Video on YouTube</Text>
              <Text style={styles.searchSubtitle}>
                Search for "{recipeTitle}" recipe videos
              </Text>
            </View>
            <Ionicons
              name="open-outline"
              size={18}
              color={COLORS.textSecondary}
            />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  thumbnailContainer: {
    width: "100%",
    height: 200,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,0,0,0.9)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  hint: {
    textAlign: "center",
    marginTop: SPACING.sm,
    fontSize: 12,
    color: COLORS.textLight,
  },
  searchButton: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  searchContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
  },
  youtubeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  searchTextWrap: {
    flex: 1,
  },
  searchTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  searchSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default VideoPlayer;
