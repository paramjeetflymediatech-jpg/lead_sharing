import * as React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import HomeownerDashboard from "./src/screens/HomeownerDashboard";
import TradespersonDashboard from "./src/screens/TradespersonDashboard";
import AdminDashboard from "./src/screens/AdminDashboard";
// import PostJob from "./src/screens/PostJob";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {!user ? (
        <>
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
        </>
      ) : user.role === "HOMEOWNER" ? (
        <Stack.Screen
          name="HomeownerDashboard"
          component={HomeownerDashboard}
          options={{ title: "Homeowner" }}
        />
      ) : user.role === "TRADESPERSON" ? (
        <Stack.Screen
          name="TradespersonDashboard"
          component={TradespersonDashboard}
          options={{ title: "Tradesperson" }}
        />
      ) : user.role === "ADMIN" ? (
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboard}
          options={{ title: "Admin Portal" }}
        />
      ) : (
        <Stack.Screen
          name="TradespersonDashboard"
          component={TradespersonDashboard}
          options={{ title: "Dashboard" }}
        />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
