import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Dimensions,
} from "react-native";

const { height } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            {/* Logo Section */}
            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                <Text style={styles.logoText}>All Care Pros</Text>
                <Text style={styles.tagline}>Find and hire trusted tradespeople</Text>
            </Animated.View>

            {/* Bottom Buttons */}
            <Animated.View style={[styles.bottomContainer, { opacity: fadeAnim }]}>
                <TouchableOpacity
                    style={styles.getStartedButton}
                    onPress={() => navigation.navigate("Signup")}
                    activeOpacity={0.8}
                >
                    <Text style={styles.getStartedText}>Get Started</Text>
                </TouchableOpacity>

                <View style={styles.loginContainer}>
                    <Text style={styles.loginPrompt}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                        <Text style={styles.loginLink}>Log in</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1149C7",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 60,
    },
    logoContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    logoText: {
        fontSize: 48,
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: 2,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: "#E3F2FD",
        fontWeight: "500",
        letterSpacing: 1,
    },
    bottomContainer: {
        width: "100%",
        paddingHorizontal: 32,
        alignItems: "center",
    },
    getStartedButton: {
        backgroundColor: "#FFFFFF",
        paddingVertical: 16,
        paddingHorizontal: 60,
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
        marginBottom: 24,
        width: "100%",
        alignItems: "center",
    },
    getStartedText: {
        color: "#1149C7",
        fontSize: 18,
        fontWeight: "700",
    },
    loginContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    loginPrompt: {
        color: "#E3F2FD",
        fontSize: 15,
    },
    loginLink: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
        textDecorationLine: "underline",
    },
});
