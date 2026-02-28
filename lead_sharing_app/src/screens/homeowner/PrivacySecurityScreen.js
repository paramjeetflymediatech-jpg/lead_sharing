import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { normalize, wp, hp } from "../../utils/responsive";

export default function PrivacySecurityScreen({ navigation }) {
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy & Security</Text>
            </View>

            <View style={styles.section}>
                <TouchableOpacity
                    style={styles.option}
                    onPress={() => navigation.navigate("ChangePassword")}
                >
                    <View style={styles.optionIcon}>
                        <Feather name="lock" size={20} color="#4B5563" />
                    </View>
                    <Text style={styles.optionText}>Change Password</Text>
                    <Feather name="chevron-right" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <View style={styles.option}>
                    <View style={styles.optionIcon}>
                        <Feather name="shield" size={20} color="#4B5563" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.optionText}>Two-Factor Authentication</Text>
                        <Text style={styles.optionSubtext}>Extra layer of security</Text>
                    </View>
                    <Switch
                        value={is2FAEnabled}
                        onValueChange={(val) => {
                            setIs2FAEnabled(val);
                            if (val) {
                                Alert.alert("Two-Factor Auth", "This feature will be fully available in the next update.");
                                setTimeout(() => setIs2FAEnabled(false), 500);
                            }
                        }}
                        trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                        thumbColor={is2FAEnabled ? "#2563EB" : "#F3F4F6"}
                    />
                </View>
            </View>

            <View style={[styles.section, styles.dangerZone]}>
                <TouchableOpacity
                    style={styles.option}
                    onPress={() => navigation.navigate("DeleteAccountRequest")}
                >
                    <View style={[styles.optionIcon, { backgroundColor: '#FEE2E2' }]}>
                        <Feather name="trash-2" size={20} color="#EF4444" />
                    </View>
                    <Text style={[styles.optionText, { color: '#EF4444' }]}>Request Account Deletion</Text>
                    <Feather name="chevron-right" size={20} color="#EF4444" />
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
        paddingTop: hp(6.5), // Adjusted for different devices
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
        borderRadius: wp(2.5),
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(4),
    },
    optionText: {
        flex: 1,
        fontSize: normalize(16),
        fontWeight: '600',
        color: '#1F2937',
    },
    optionSubtext: {
        fontSize: normalize(12),
        color: '#6B7280',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginLeft: wp(18),
    },
    dangerZone: {
        marginTop: hp(4),
        borderColor: '#FECACA',
        borderTopWidth: 1,
        borderBottomWidth: 1,
    },
});
