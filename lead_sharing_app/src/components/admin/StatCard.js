import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { normalize, wp, hp } from '../../utils/responsive';

export default function StatCard({ title, value, subtitle, icon, color, onPress }) {
    return (
        <TouchableOpacity
            style={[styles.statCard, { borderLeftColor: color, backgroundColor: `${color}08` }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Feather name={icon} size={24} color={color} style={styles.statIconStyle} />
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
            {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    statCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: wp(4),
        padding: wp(4),
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    statIconStyle: {
        marginBottom: 8,
    },
    statValue: {
        fontSize: normalize(22),
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: hp(0.5),
    },
    statTitle: {
        fontSize: normalize(12),
        color: "#64748B",
        fontWeight: "600",
    },
    statSubtitle: {
        fontSize: normalize(10),
        color: "#94A3B8",
        marginTop: hp(0.2),
    },
});
