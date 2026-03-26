import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { normalize, hp, wp } from "../utils/responsive";

const { height } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const data = await authAPI.login(email, password, {
        deviceType: Platform.OS,
        // deviceId: ... could add device id here if needed
      });

      if (!data.token) {
        setError("No token returned from server");
        setLoading(false);
        return;
      }

      await login(data);
    } catch (error) {
      setError(error.message || "Network error. Please check your connection.");
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration Section */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require("../../assets/login-illustration.jpg")}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>
              Sign in to continue to your account
            </Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}></Text>
              <TextInput
                style={styles.input}
                placeholder="Email ID"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={(text) => setEmail(text.toLowerCase())}
                editable={!loading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}></Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <EyeOff color="#9CA3AF" size={20} />
                ) : (
                  <Eye color="#9CA3AF" size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* OR Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>New to LeadSharing? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.signupLink}>Signup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
  },
  illustrationContainer: {
    backgroundColor: "#FFFFFF",
    paddingTop: hp(5), // Responsive padding
    paddingBottom: hp(2), // Responsive padding
    paddingHorizontal: wp(10), // Responsive padding
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  illustration: {
    width: wp(60), // Responsive width
    height: hp(25), // Responsive height
  },
  formCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: wp(6), // Responsive padding
    marginTop: -hp(2), // Negative margin for overlap
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    marginBottom: hp(2),
  },
  title: {
    fontSize: normalize(24),
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: hp(0.5),
  },
  subtitle: {
    fontSize: normalize(13),
    color: "#6B7280",
    fontWeight: "400",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: normalize(13),
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: hp(1.5),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    height: hp(6.5), // Responsive height
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
    color: "#9CA3AF",
  },
  input: {
    flex: 1,
    fontSize: normalize(14),
    color: "#1F2937",
    height: '100%',
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: hp(2.5),
    marginTop: 4,
  },
  forgotPasswordText: {
    color: "#2563EB",
    fontSize: normalize(13),
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    minHeight: hp(6.5), // Responsive height for touch target
  },
  loginButtonDisabled: {
    backgroundColor: "#93C5FD",
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: normalize(16),
    fontWeight: "700",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: hp(2.5),
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    color: "#9CA3AF",
    fontSize: normalize(12),
    fontWeight: "500",
    marginHorizontal: 12,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(2),
  },
  signupText: {
    color: "#6B7280",
    fontSize: normalize(14),
  },
  signupLink: {
    color: "#2563EB",
    fontSize: normalize(14),
    fontWeight: "700",
  },
});
