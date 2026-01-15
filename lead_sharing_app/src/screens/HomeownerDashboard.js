import React from "react";
import { View, Text, Button } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function HomeownerDashboard() {
  const { user, logout } = useAuth();

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
        Homeowner dashboard
      </Text>
      <Text style={{ marginBottom: 16 }}>Signed in as {user?.email}</Text>

      <Text style={{ marginBottom: 8 }}>
        Later we can add: list of your jobs, and a "Post job" form that calls /api/jobs.
      </Text>

      <Button title="Log out" onPress={logout} />
    </View>
  );
}
