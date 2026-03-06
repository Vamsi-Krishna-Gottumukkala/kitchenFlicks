// Register Screen
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants";
import { useAuth } from "../hooks/useAuth";

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Validation States
  const [emailError, setEmailError] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { register } = useAuth();

  // Dynamic Password Validation Checks
  const passwordCriteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&]/.test(password),
  };
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const validateEmail = (text: string) => {
    setEmail(text);
    if (!text.trim()) {
      setEmailError("");
      return;
    }
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com|icloud\.com)$/i;
    if (!emailRegex.test(text.trim())) {
      setEmailError(
        "Please use a valid provider (e.g., @gmail.com, @yahoo.com)",
      );
    } else {
      setEmailError("");
    }
  };

  const handleRegister = async () => {
    if (!displayName.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (emailError) {
      Alert.alert("Invalid Email", emailError);
      return;
    }

    if (!isPasswordValid) {
      Alert.alert("Weak Password", "Please meet all password requirements.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await register(email.trim(), password, displayName.trim());
      onRegisterSuccess();
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons
            name="restaurant"
            size={46}
            color="#FFFFFF"
            style={{ marginBottom: SPACING.xs }}
          />
          <Text style={styles.appName}>KitchenFlicks</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your cooking journey</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="John Doe"
              placeholderTextColor={COLORS.textLight}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              value={email}
              onChangeText={validateEmail}
              placeholder="your@email.com"
              placeholderTextColor={COLORS.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[
                styles.input,
                password && !isPasswordValid && !passwordFocused
                  ? styles.inputError
                  : null,
              ]}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              placeholder="At least 8 characters"
              placeholderTextColor={COLORS.textLight}
              secureTextEntry
            />

            {/* Dynamic Password Checklist */}
            {(passwordFocused || password.length > 0) && (
              <View style={styles.passwordChecklist}>
                <PasswordRequirement
                  met={passwordCriteria.length}
                  text="At least 8 characters"
                />
                <PasswordRequirement
                  met={passwordCriteria.uppercase}
                  text="One uppercase letter"
                />
                <PasswordRequirement
                  met={passwordCriteria.lowercase}
                  text="One lowercase letter"
                />
                <PasswordRequirement
                  met={passwordCriteria.number}
                  text="One number"
                />
                <PasswordRequirement
                  met={passwordCriteria.special}
                  text="One special character (@$!%*?&)"
                />
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[
                styles.input,
                confirmPassword && password !== confirmPassword
                  ? styles.inputError
                  : null,
              ]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              placeholderTextColor={COLORS.textLight}
              secureTextEntry
            />
            {confirmPassword && password !== confirmPassword && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  appIcon: {
    fontSize: 50,
    marginBottom: SPACING.xs,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  form: {
    flex: 1,
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    marginTop: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  errorText: {
    color: "#E63946",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  inputError: {
    borderColor: "#E63946",
  },
  passwordChecklist: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reqRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  reqText: {
    fontSize: 12,
    marginLeft: 6,
  },
});

// Helper component for checklist rendering
const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
  <View style={styles.reqRow}>
    <Ionicons
      name={met ? "checkmark-circle" : "close-circle"}
      size={14}
      color={met ? "#2EC4B6" : "#E63946"}
    />
    <Text
      style={[
        styles.reqText,
        { color: met ? "#2EC4B6" : COLORS.textSecondary },
      ]}
    >
      {text}
    </Text>
  </View>
);

export default RegisterScreen;
