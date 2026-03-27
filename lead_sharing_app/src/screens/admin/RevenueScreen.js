import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { normalize, wp, hp } from '../../utils/responsive';

export default function RevenueScreen({ revenue }) {
    return (
        <>
            <View style={styles.revenueCard}>
                <Feather name="dollar-sign" size={48} color="#2563EB" style={styles.revenueIconStyle} />
                <Text style={styles.revenueAmount}>${revenue}</Text>
                <Text style={styles.revenueLabel}>Total Platform Revenue</Text>
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Revenue Breakdown</Text>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Earnings</Text>
                    <Text style={styles.summaryValue}>${revenue}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>This Month</Text>
                    <Text style={styles.summaryValue}>
                        ${Math.floor(revenue * 0.3)}
                    </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Last Month</Text>
                    <Text style={styles.summaryValue}>
                        ${Math.floor(revenue * 0.25)}
                    </Text>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    revenueCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: wp(4),
        padding: wp(8),
        alignItems: "center",
        marginBottom: hp(2.5),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    revenueIconStyle: {
        marginBottom: hp(2),
    },
    revenueAmount: {
        fontSize: normalize(40),
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: hp(1),
    },
    revenueLabel: {
        fontSize: normalize(14),
        color: "#64748B",
    },
    summaryCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    summaryTitle: {
        fontSize: normalize(16),
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: hp(2),
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: hp(1.5),
    },
    summaryLabel: {
        fontSize: 14,
        color: "#64748B",
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1E293B",
    },
    summaryDivider: {
        height: 1,
        backgroundColor: "#E2E8F0",
    },
});
