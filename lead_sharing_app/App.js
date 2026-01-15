import * as React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import HomeownerDashboard from "./src/screens/HomeownerDashboard";
import TradespersonDashboard from "./src/screens/TradespersonDashboard";

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
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : user.role === "HOMEOWNER" ? (
        <Stack.Screen
          name="HomeownerDashboard"
          component={HomeownerDashboard}
          options={{ title: "Homeowner" }}
        />
      ) : (
        <Stack.Screen
          name="TradespersonDashboard"
          component={TradespersonDashboard}
          options={{ title: "Tradesperson" }}
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
