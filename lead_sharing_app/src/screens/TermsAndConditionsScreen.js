import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// import { StatusBar } from 'expo-status-bar'; // Using RN StatusBar for height calculation
import { ArrowLeft } from 'lucide-react-native';
import { normalize, hp, wp } from "../utils/responsive";

const TermsAndConditionsScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#333" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms & Conditions</Text>
            </View>

            <ScrollView style={styles.contentAndPadding} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>1. Introduction</Text>
                <Text style={styles.text}>
                    Welcome to All Care Pros. By accessing or using our mobile application, you agree to be bound by these Terms and Conditions.
                </Text>

                <Text style={styles.sectionTitle}>2. User Accounts</Text>
                <Text style={styles.text}>
                    To use certain features of the App, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials.
                </Text>

                <Text style={styles.sectionTitle}>3. Lead Sharing</Text>
                <Text style={styles.text}>
                    Our platform facilitates the sharing of leads between users. We do not guarantee the quality or conversion of any leads shared through the platform.
                </Text>

                <Text style={styles.sectionTitle}>4. Users Responsibilities</Text>
                <Text style={styles.text}>
                    You agree not to use the App for any unlawful purpose or in any way that interrupts, damages, or impairs the service.
                </Text>

                <Text style={styles.sectionTitle}>5. Limitation of Liability</Text>
                <Text style={styles.text}>
                    We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of the App.
                </Text>

                <Text style={styles.sectionTitle}>6. Changes to Terms</Text>
                <Text style={styles.text}>
                    We reserve the right to modify these Terms at any time. Your continued use of the App following any changes indicates your acceptance of the new Terms.
                </Text>

                <Text style={styles.sectionTitle}>7. Contact Us</Text>
                <Text style={styles.text}>
                    If you have any questions about these Terms, please contact us at allcarepros@gmail.com.
                </Text>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Last Updated: February 2026</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(4),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : hp(5),
    },
    backButton: {
        padding: wp(2),
        marginRight: wp(2),
    },
    headerTitle: {
        fontSize: normalize(20),
        fontWeight: 'bold',
        color: '#333',
    },
    contentAndPadding: {
        flex: 1,
    },
    scrollContent: {
        padding: wp(5),
        paddingBottom: hp(5),
    },
    sectionTitle: {
        fontSize: normalize(18),
        fontWeight: '600',
        color: '#2c3e50',
        marginTop: hp(2.5),
        marginBottom: hp(1.2),
    },
    text: {
        fontSize: normalize(16),
        color: '#555',
        lineHeight: normalize(24),
        textAlign: 'justify',
    },
    footer: {
        marginTop: hp(4),
        paddingTop: hp(2.5),
        borderTopWidth: 1,
        borderTopColor: '#eee',
        alignItems: 'center'
    },
    footerText: {
        color: '#999',
        fontSize: normalize(14)
    }
});

export default TermsAndConditionsScreen;
