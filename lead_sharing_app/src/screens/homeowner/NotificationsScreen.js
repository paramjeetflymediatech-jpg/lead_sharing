
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { normalize, wp, hp } from "../../utils/responsive";

export default function NotificationsScreen({ navigation }) {
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [smsEnabled, setSmsEnabled] = useState(false);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferences</Text>

                <View style={styles.option}>
                    <View style={styles.optionInfo}>
                        <Text style={styles.optionTitle}>Push Notifications</Text>
                        <Text style={styles.optionDescription}>Receive alerts on your device</Text>
                    </View>
                    <Switch
                        value={pushEnabled}
                        onValueChange={setPushEnabled}
                        trackColor={{ false: "#D1D5DB", true: "#BFDBFE" }}
                        thumbColor={pushEnabled ? "#2563EB" : "#F3F4F6"}
                    />
                </View>

                <View style={styles.divider} />

                <View style={styles.option}>
                    <View style={styles.optionInfo}>
                        <Text style={styles.optionTitle}>Email Notifications</Text>
                        <Text style={styles.optionDescription}>Receive updates via email</Text>
                    </View>
                    <Switch
                        value={emailEnabled}
                        onValueChange={setEmailEnabled}
                        trackColor={{ false: "#D1D5DB", true: "#BFDBFE" }}
                        thumbColor={emailEnabled ? "#2563EB" : "#F3F4F6"}
                    />
                </View>

                <View style={styles.divider} />

                <View style={styles.option}>
                    <View style={styles.optionInfo}>
                        <Text style={styles.optionTitle}>SMS Notifications</Text>
                        <Text style={styles.optionDescription}>Receive updates via text message</Text>
                    </View>
                    <Switch
                        value={smsEnabled}
                        onValueChange={setSmsEnabled}
                        trackColor={{ false: "#D1D5DB", true: "#BFDBFE" }}
                        thumbColor={smsEnabled ? "#2563EB" : "#F3F4F6"}
                    />
                </View>
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
        paddingHorizontal: wp(5),
        paddingVertical: hp(2),
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E5E7EB',
    },
    sectionTitle: {
        fontSize: normalize(14),
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
        marginBottom: hp(2),
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: hp(1.5),
    },
    optionInfo: {
        flex: 1,
        paddingRight: wp(4),
    },
    optionTitle: {
        fontSize: normalize(16),
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: hp(0.5),
    },
    optionDescription: {
        fontSize: normalize(13),
        color: '#6B7280',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: hp(1),
    },
});
