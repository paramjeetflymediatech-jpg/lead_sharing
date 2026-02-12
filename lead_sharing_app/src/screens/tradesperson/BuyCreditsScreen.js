import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
    Linking,
    ActivityIndicator
} from "react-native";
import { useAuth } from "../../context/AuthContext"; // Adjust path if needed
import { tradespersonAPI, userAPI } from "../../services/api"; // Adjust path if needed

// Plans matching the website
const PLANS = [
    {
        id: "starter",
        name: "Starter Pack",
        price: 9.99,
        credits: 10,
        popular: false,
        description: "Perfect for getting started"
    },
    {
        id: "pro",
        name: "Professional Pack",
        price: 19.99,
        credits: 25,
        popular: true,
        description: "For growing businesses",
        recommended: true
    },
    {
        id: "business",
        name: "Business Pack",
        price: 39.99,
        credits: 60,
        popular: false,
        description: "Maximum value for busy professionals"
    },
];

export default function BuyCreditsScreen({ navigation }) {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processingPlan, setProcessingPlan] = useState(null);

    const fetchProfile = useCallback(async () => {
        try {
            const data = await userAPI.getMe();
            if (data.success && data.tradespersonProfile) {
                setProfile(data.tradespersonProfile);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProfile();
    }, [fetchProfile]);

    const handlePurchase = async (plan) => {
        try {
            setProcessingPlan(plan.id);
            console.log("Processing plan:", plan.id);

            const response = await tradespersonAPI.topUpCredits(plan.id);
            console.log("Top-up response:", response);

            if (response.url) {
                // Open Stripe checkout in browser
                const supported = await Linking.canOpenURL(response.url);
                if (supported) {
                    await Linking.openURL(response.url);
                } else {
                    Alert.alert("Error", "Cannot open payment link: " + response.url);
                }
            } else {
                Alert.alert("Error", "Could not generate payment link");
            }
        } catch (error) {
            console.error("Purchase error:", error);
            Alert.alert("Error", error.message || "Failed to initiate purchase");
        } finally {
            setProcessingPlan(null);
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    // Calculate per-credit pricing for stats
    const averagePerCredit = (
        (PLANS[0].price / PLANS[0].credits +
            PLANS[1].price / PLANS[1].credits +
            PLANS[2].price / PLANS[2].credits) / 3
    ).toFixed(2);

    const businessPerCredit = (PLANS[2].price / PLANS[2].credits).toFixed(2);

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Buy Credits</Text>
                <Text style={styles.headerSubtitle}>
                    Use credits to unlock job leads and view contact details
                </Text>
            </View>

            {/* Current Balance Card - Gradient Style */}
            <View style={styles.balanceCard}>
                <View style={styles.balanceContent}>
                    <View>
                        <Text style={styles.balanceLabel}>Your Credit Balance</Text>
                        <Text style={styles.balanceSubtext}>Ready to unlock new opportunities</Text>
                        <View style={styles.noExpireBadge}>
                            <Text style={styles.noExpireText}>⚡ Credits never expire</Text>
                        </View>
                    </View>
                    <View style={styles.balanceRight}>
                        <Text style={styles.balanceValue}>{profile?.credits || 0}</Text>
                        <Text style={styles.balanceValueLabel}>AVAILABLE</Text>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Avg Value</Text>
                        <Text style={styles.statValue}>£{averagePerCredit}</Text>
                        <Text style={styles.statSub}>per credit</Text>
                    </View>
                    <View style={[styles.statItem, styles.statBorder]}>
                        <Text style={styles.statLabel}>Best Value</Text>
                        <Text style={styles.statValue}>£{businessPerCredit}</Text>
                        <Text style={styles.statSub}>Business plan</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Validity</Text>
                        <Text style={styles.statValue}>∞</Text>
                        <Text style={styles.statSub}>Lifetime</Text>
                    </View>
                </View>
            </View>

            {/* Credit Packages */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Choose Your Plan</Text>

                {PLANS.map((plan) => (
                    <View
                        key={plan.id}
                        style={[
                            styles.packageCard,
                            plan.popular && styles.packageCardPopular
                        ]}
                    >
                        {plan.popular && (
                            <View style={styles.popularBadge}>
                                <Text style={styles.popularText}>MOST POPULAR</Text>
                            </View>
                        )}

                        <View style={styles.packageContent}>
                            <View style={styles.packageHeaderRow}>
                                <Text style={styles.packageName}>{plan.name}</Text>
                                {plan.recommended && (
                                    <View style={styles.recommendedBadge}>
                                        <Text style={styles.recommendedText}>RECOMMENDED</Text>
                                    </View>
                                )}
                            </View>

                            <Text style={styles.packageDescription}>{plan.description}</Text>

                            <View style={styles.priceRow}>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.priceSymbol}>£</Text>
                                    <Text style={styles.priceAmount}>{plan.price}</Text>
                                    <Text style={styles.pricePeriod}>one-time</Text>
                                </View>
                            </View>

                            <View style={styles.creditsRow}>
                                <View style={styles.creditsBadge}>
                                    <Text style={styles.creditsBadgeText}>{plan.credits} Credits</Text>
                                </View>
                                <Text style={styles.perCreditText}>
                                    £{(plan.price / plan.credits).toFixed(2)} per credit
                                </Text>
                            </View>

                            <View style={styles.featuresList}>
                                <FeatureItem text={`Unlock ${plan.credits} job leads`} />
                                <FeatureItem text="Immediate contact access" />
                                <FeatureItem text="Credits never expire" />
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.purchaseButton,
                                    plan.popular ? styles.purchaseButtonPopular : styles.purchaseButtonStandard,
                                    processingPlan === plan.id && styles.buttonDisabled
                                ]}
                                onPress={() => handlePurchase(plan)}
                                disabled={!!processingPlan}
                            >
                                {processingPlan === plan.id ? (
                                    <ActivityIndicator color={plan.popular ? "#fff" : "#2563EB"} />
                                ) : (
                                    <Text style={[
                                        styles.purchaseButtonText,
                                        plan.popular ? styles.reqtextWhite : styles.reqtextBlue
                                    ]}>
                                        Buy Now
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>

            {/* FAQ */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

                <View style={styles.faqItem}>
                    <Text style={styles.faqQuestion}>How do credits work?</Text>
                    <Text style={styles.faqAnswer}>
                        Each credit allows you to unlock one job lead. When you find a job you're interested in, use one credit to access the contact information.
                    </Text>
                </View>

                <View style={styles.faqItem}>
                    <Text style={styles.faqQuestion}>Do credits expire?</Text>
                    <Text style={styles.faqAnswer}>
                        No, your credits never expire. You can use them whenever you find the right opportunity.
                    </Text>
                </View>

                <View style={styles.faqItem}>
                    <Text style={styles.faqQuestion}>Is payment secure?</Text>
                    <Text style={styles.faqAnswer}>
                        Yes, all payments are processed securely via Stripe. We do not store your card details.
                    </Text>
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

function FeatureItem({ text }) {
    return (
        <View style={styles.featureItem}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.featureText}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        padding: 20,
        paddingTop: 16,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1F2937",
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 15,
        color: "#6B7280",
        lineHeight: 22,
    },
    balanceCard: {
        margin: 16,
        marginTop: 0,
        backgroundColor: "#2563EB", // Fallback / Base color
        borderRadius: 24,
        padding: 24,
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
        overflow: "hidden",
    },
    balanceContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 24,
    },
    balanceLabel: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    balanceSubtext: {
        fontSize: 13,
        color: "rgba(255, 255, 255, 0.8)",
        marginBottom: 12,
        maxWidth: 180,
    },
    noExpireBadge: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
    },
    noExpireText: {
        color: "#FFF",
        fontSize: 12,
        fontWeight: "600",
    },
    balanceRight: {
        alignItems: "center",
    },
    balanceValue: {
        fontSize: 42,
        fontWeight: "900",
        color: "#FFFFFF",
        lineHeight: 48,
    },
    balanceValueLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: "rgba(255, 255, 255, 0.9)",
        letterSpacing: 0.5,
    },
    statsRow: {
        flexDirection: "row",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 16,
        padding: 16,
        justifyContent: "space-between",
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statBorder: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    statLabel: {
        fontSize: 11,
        color: "rgba(255, 255, 255, 0.8)",
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFF",
        marginBottom: 2,
    },
    statSub: {
        fontSize: 10,
        color: "rgba(255, 255, 255, 0.6)",
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 16,
        textAlign: "center",
    },
    packageCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
        overflow: "hidden",
    },
    packageCardPopular: {
        borderColor: "#2563EB",
        backgroundColor: "#F8FAFF",
        borderWidth: 2,
        shadowColor: "#2563EB",
        shadowOpacity: 0.1,
    },
    popularBadge: {
        backgroundColor: "#2563EB",
        paddingVertical: 6,
        alignItems: "center",
    },
    popularText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    packageContent: {
        padding: 24,
    },
    packageHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    packageName: {
        fontSize: 20,
        fontWeight: "800",
        color: "#111827",
    },
    recommendedBadge: {
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 100,
    },
    recommendedText: {
        color: "#2563EB",
        fontSize: 10,
        fontWeight: "700",
    },
    packageDescription: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 16,
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "baseline",
        marginBottom: 16,
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    priceSymbol: {
        fontSize: 24,
        fontWeight: "600",
        color: "#111827",
        marginRight: 2,
    },
    priceAmount: {
        fontSize: 36,
        fontWeight: "900",
        color: "#111827",
    },
    pricePeriod: {
        fontSize: 14,
        color: "#6B7280",
        marginLeft: 6,
    },
    creditsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        gap: 12,
    },
    creditsBadge: {
        backgroundColor: "rgba(37, 99, 235, 0.1)", // blue-500 equivalent opacity
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
    },
    creditsBadgeText: {
        color: "#2563EB",
        fontWeight: "700",
        fontSize: 14,
    },
    perCreditText: {
        fontSize: 13,
        color: "#6B7280",
    },
    featuresList: {
        marginBottom: 24,
        gap: 12,
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    checkIcon: {
        color: "#10B981", // green-500
        fontSize: 16,
        fontWeight: "bold",
    },
    featureText: {
        fontSize: 14,
        color: "#4B5563", // gray-600
    },
    purchaseButton: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    purchaseButtonPopular: {
        backgroundColor: "#2563EB",
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    purchaseButtonStandard: {
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#E5E7EB",
    },
    purchaseButtonText: {
        fontSize: 16,
        fontWeight: "700",
    },
    reqtextWhite: {
        color: "#FFFFFF",
    },
    reqtextBlue: {
        color: "#2563EB",
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    faqItem: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    faqQuestion: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 8,
    },
    faqAnswer: {
        fontSize: 14,
        color: "#6B7280",
        lineHeight: 22,
    },
});
