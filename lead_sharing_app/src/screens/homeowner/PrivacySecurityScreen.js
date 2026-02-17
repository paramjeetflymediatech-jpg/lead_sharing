
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { normalize, wp, hp } from "../../utils/responsive";

export default function PrivacySecurityScreen({ navigation }) {

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => console.log("Delete account pressed") }
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy & Security</Text>
            </View>

            <View style={styles.section}>
                <TouchableOpacity style={styles.option} onPress={() => Alert.alert("Change Password", "Feature coming soon")}>
                    <View style={styles.optionIcon}>
                        <Feather name="lock" size={20} color="#4B5563" />
                    </View>
                    <Text style={styles.optionText}>Change Password</Text>
                    <Feather name="chevron-right" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.option} onPress={() => Alert.alert("Two-Factor Auth", "Feature coming soon")}>
                    <View style={styles.optionIcon}>
                        <Feather name="shield" size={20} color="#4B5563" />
                    </View>
                    <Text style={styles.optionText}>Two-Factor Authentication</Text>
                    <Feather name="chevron-right" size={20} color="#9CA3AF" />
                </TouchableOpacity>
            </View>

            <View style={[styles.section, styles.dangerZone]}>
                <TouchableOpacity style={styles.option} onPress={handleDeleteAccount}>
                    <View style={[styles.optionIcon, { backgroundColor: '#FEE2E2' }]}>
                        <Feather name="trash-2" size={20} color="#EF4444" />
                    </View>
                    <Text style={[styles.optionText, { color: '#EF4444' }]}>Delete Account</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        paddingTop: hp(7),
        paddingBottom: hp(2),
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        marginRight: wp(4),
        padding: wp(1),
    },
    headerTitle: {
        fontSize: normalize(20),
        fontWeight: '700',
        color: '#111827',
    },
    section: {
        marginTop: hp(3),
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E5E7EB',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(4),
    },
    optionIcon: {
        width: wp(10),
        height: wp(10),
        borderRadius: wp(2),
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(4),
    },
    optionText: {
        flex: 1,
        fontSize: normalize(16),
        fontWeight: '500',
        color: '#1F2937',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginLeft: wp(18), // Align with text
    },
    dangerZone: {
        marginTop: hp(4),
        borderColor: '#FECACA',
    },
});
