import React, { useState } from "react";
import { View, Text, Switch, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { normalize, wp, hp } from "../../utils/responsive";

export default function PaymentSettingsScreen({ onBack }) {
    const [stripeEnabled, setStripeEnabled] = useState(true);
    const [paypalEnabled, setPaypalEnabled] = useState(false);
    const [currency, setCurrency] = useState("CAD");

    return (
        <View style={styles.container}>
            {/* <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Feather name="arrow-left" size={normalize(24)} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment Settings</Text>
            </View> */}

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Gateways</Text>

                    <View style={styles.settingItem}>
                        <View style={styles.settingText}>
                            <Text style={styles.settingLabel}>Stripe</Text>
                            <Text style={styles.settingDescription}>Credit card processing</Text>
                        </View>
                        <Switch
                            value={stripeEnabled}
                            onValueChange={setStripeEnabled}
                            trackColor={{ false: "#E2E8F0", true: "#BFDBFE" }}
                            thumbColor={stripeEnabled ? "#2563EB" : "#F1F5F9"}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingText}>
                            <Text style={styles.settingLabel}>PayPal</Text>
                            <Text style={styles.settingDescription}>PayPal transfers</Text>
                        </View>
                        <Switch
                            value={paypalEnabled}
                            onValueChange={setPaypalEnabled}
                            trackColor={{ false: "#E2E8F0", true: "#BFDBFE" }}
                            thumbColor={paypalEnabled ? "#2563EB" : "#F1F5F9"}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Currency</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Platform Currency</Text>
                        <TextInput
                            style={styles.input}
                            value={currency}
                            onChangeText={setCurrency}
                            maxLength={3}
                            autoCapitalize="characters"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Credit Pricing</Text>
                    <TouchableOpacity style={styles.priceButton}>
                        <Text style={styles.priceButtonText}>Manage Credit Packages</Text>
                        <Feather name="chevron-right" size={normalize(20)} color="#2563EB" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: wp(4),
        paddingVertical: hp(2),
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    backButton: {
        marginRight: wp(3),
        padding: wp(1),
    },
    headerTitle: {
        fontSize: normalize(18),
        fontWeight: "700",
        color: "#1E293B",
    },
    content: {
        padding: wp(4),
    },
    section: {
        marginBottom: hp(3),
    },
    sectionTitle: {
        fontSize: normalize(14),
        fontWeight: "600",
        color: "#64748B",
        marginBottom: hp(1.5),
        textTransform: "uppercase",
        marginLeft: wp(1),
    },
    settingItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        padding: wp(4),
        borderRadius: wp(3),
        marginBottom: hp(1.5),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    settingText: {
        flex: 1,
        marginRight: wp(4),
    },
    settingLabel: {
        fontSize: normalize(16),
        color: "#1E293B",
        fontWeight: "500",
    },
    settingDescription: {
        fontSize: normalize(13),
        color: "#64748B",
        marginTop: hp(0.5),
    },
    inputContainer: {
        backgroundColor: "#FFFFFF",
        padding: wp(4),
        borderRadius: wp(3),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    inputLabel: {
        fontSize: normalize(14),
        fontWeight: "600",
        color: "#475569",
        marginBottom: hp(1),
    },
    input: {
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: wp(2),
        padding: wp(3),
        fontSize: normalize(16),
        color: "#1E293B",
    },
    priceButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#EFF6FF",
        padding: wp(4),
        borderRadius: wp(3),
        borderWidth: 1,
        borderColor: "#DBEAFE",
    },
    priceButtonText: {
        fontSize: normalize(15),
        color: "#2563EB",
        fontWeight: "600",
    },
});
