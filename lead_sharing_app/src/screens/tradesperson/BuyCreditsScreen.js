import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from "react-native";

export default function BuyCreditsScreen({ navigation }) {
    const creditPackages = [
        { id: 1, credits: 10, price: 29.99, popular: false },
        { id: 2, credits: 25, price: 69.99, popular: true },
        { id: 3, credits: 50, price: 129.99, popular: false },
        { id: 4, credits: 100, price: 239.99, popular: false },
    ];

    function handlePurchase(pkg) {
        Alert.alert(
            "Coming Soon",
            `Payment integration for ${pkg.credits} credits (£${pkg.price}) will be available soon!`,
            [{ text: "OK" }]
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Buy Credits</Text>
                <Text style={styles.headerSubtitle}>
                    Use credits to unlock job leads and view contact details
                </Text>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
                <Text style={styles.infoIcon}>💡</Text>
                <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>How Credits Work</Text>
                    <Text style={styles.infoText}>
                        • 1 credit = 1 job unlock{"\n"}
                        • View homeowner contact details{"\n"}
                        • Submit unlimited quotes{"\n"}
                        • No expiration date
                    </Text>
                </View>
            </View>

            {/* Credit Packages */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select a Package</Text>

                {creditPackages.map((pkg, index) => (
                    <TouchableOpacity
                        key={pkg.id || index}
                        style={[styles.packageCard, pkg.popular && styles.packageCardPopular]}
                        onPress={() => handlePurchase(pkg)}
                    >
                        {pkg.popular && (
                            <View style={styles.popularBadge}>
                                <Text style={styles.popularText}>MOST POPULAR</Text>
                            </View>
                        )}

                        <View style={styles.packageHeader}>
                            <View>
                                <Text style={styles.packageCredits}>{pkg.credits} Credits</Text>
                                <Text style={styles.packagePrice}>£{pkg.price}</Text>
                            </View>
                            <View style={styles.perCreditContainer}>
                                <Text style={styles.perCreditLabel}>Per credit</Text>
                                <Text style={styles.perCreditValue}>
                                    £{(pkg.price / pkg.credits).toFixed(2)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.packageFooter}>
                            <Text style={styles.packageButton}>Purchase →</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* FAQ */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>FAQs</Text>

                <View style={styles.faqItem}>
                    <Text style={styles.faqQuestion}>When are credits deducted?</Text>
                    <Text style={styles.faqAnswer}>
                        Credits are only deducted when you unlock a job to view homeowner contact details.
                    </Text>
                </View>

                <View style={styles.faqItem}>
                    <Text style={styles.faqQuestion}>Do credits expire?</Text>
                    <Text style={styles.faqAnswer}>
                        No, your credits never expire and can be used anytime.
                    </Text>
                </View>

                <View style={styles.faqItem}>
                    <Text style={styles.faqQuestion}>Can I get a refund?</Text>
                    <Text style={styles.faqAnswer}>
                        Unused credits can be refunded within 14 days of purchase.
                    </Text>
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },
    header: {
        padding: 20,
        paddingTop: 16,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: "700",
        color: "#1F2937",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 4,
        lineHeight: 20,
    },
    infoCard: {
        backgroundColor: "#EFF6FF",
        marginHorizontal: 16,
        marginBottom: 24,
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
    },
    infoIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 6,
    },
    infoText: {
        fontSize: 13,
        color: "#4B5563",
        lineHeight: 20,
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 12,
    },
    packageCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 20,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    packageCardPopular: {
        borderColor: "#2563EB",
        backgroundColor: "#F8FAFF",
    },
    popularBadge: {
        backgroundColor: "#2563EB",
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 12,
    },
    popularText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "700",
    },
    packageHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    packageCredits: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 4,
    },
    packagePrice: {
        fontSize: 18,
        fontWeight: "600",
        color: "#2563EB",
    },
    perCreditContainer: {
        alignItems: "flex-end",
    },
    perCreditLabel: {
        fontSize: 12,
        color: "#6B7280",
        marginBottom: 2,
    },
    perCreditValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#10B981",
    },
    packageFooter: {
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        paddingTop: 12,
    },
    packageButton: {
        fontSize: 15,
        fontWeight: "600",
        color: "#2563EB",
        textAlign: "center",
    },
    faqItem: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    faqQuestion: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 6,
    },
    faqAnswer: {
        fontSize: 14,
        color: "#6B7280",
        lineHeight: 20,
    },
});
