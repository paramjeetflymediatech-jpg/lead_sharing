import * as React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import HomeownerTabs from "./src/components/HomeownerTabs";
import TradespersonTabs from "./src/components/TradespersonTabs";
import AdminDashboard from "./src/screens/AdminDashboard";
import TermsAndConditionsScreen from "./src/screens/TermsAndConditionsScreen";
import TradespersonProfileScreen from "./src/screens/tradesperson/TradespersonProfileScreen";
import OnboardingScreen from "./src/screens/tradesperson/OnboardingScreen";
import NotificationHistoryScreen from "./src/screens/NotificationHistoryScreen";
import { NotificationService } from "./src/services/NotificationService";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, loading } = useAuth();
  const [isFirstLaunch, setIsFirstLaunch] = React.useState(null);
  const [checkingFirstLaunch, setCheckingFirstLaunch] = React.useState(true);

  React.useEffect(() => {
    async function checkFirstLaunch() {
      try {
        // TEMPORARY: Always show welcome screen for testing
        // Remove the line below after testing
        await AsyncStorage.removeItem("hasLaunched");

        const hasLaunched = await AsyncStorage.getItem("hasLaunched");
        if (hasLaunched === null) {
          setIsFirstLaunch(true);
          await AsyncStorage.setItem("hasLaunched", "true");
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error("Error checking first launch:", error);
        setIsFirstLaunch(false);
      } finally {
        setCheckingFirstLaunch(false);
      }
    }
    checkFirstLaunch();
  }, []);

  if (loading || checkingFirstLaunch) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1149C7" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {!user ? (
        <>
          {isFirstLaunch && (
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
          )}
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="TermsAndConditions"
            component={TermsAndConditionsScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : user.role === "HOMEOWNER" ? (
        <Stack.Screen
          name="HomeownerDashboard"
          component={HomeownerTabs}
          options={{ headerShown: false }}
        />
      ) : user.role === "TRADESPERSON" ? (
        <>
          {(user.verificationStatus !== "APPROVED") ? (
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ headerShown: false }}
            />
          ) : (
            <Stack.Screen
              name="TradespersonDashboard"
              component={TradespersonTabs}
              options={{ headerShown: false }}
            />
          )}
        </>
      ) : user.role === "ADMIN" ? (
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboard}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="TradespersonDashboard"
          component={TradespersonTabs}
          options={{ headerShown: false }}
        />
      )}
      {/* Global screens accessible from any tab */}
      <Stack.Screen
        name="TradespersonProfile"
        component={TradespersonProfileScreen}
        options={{ title: "Tradesperson Profile" }}
      />
      <Stack.Screen
        name="NotificationHistory"
        component={NotificationHistoryScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#1149C7",
    background: "#FFFFFF",
    card: "#FFFFFF",
    text: "#1F2937",
    border: "#E5E7EB",
    notification: "#EF4444",
  },
};

// Deep linking configuration
const linking = {
  prefixes: ["allcarepros://"],
  config: {
    screens: {
      TradespersonDashboard: {
        screens: {
          Home: "tradesperson",
        },
      },
    },
  },
};

export default function App() {
  React.useEffect(() => {
    // Register notification listeners
    const cleanup = NotificationService.addListener((notification) => {
      console.log("[App] Notification foreground:", notification);
    });

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer theme={MyTheme} linking={linking}>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
